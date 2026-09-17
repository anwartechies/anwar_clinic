"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  TbRocket,
  TbRefresh,
  TbCheck,
  TbX,
  TbLoader2,
  TbGitCommit,
  TbAlertTriangle,
} from "react-icons/tb";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/Layout/PageHeader";
import { usePermissions } from "@/context/PermissionsContext";

type DeployStatus = "running" | "success" | "failed";

interface DeploymentSummary {
  id: string;
  target: string;
  status: DeployStatus;
  triggeredByName: string;
  commitBefore: string | null;
  commitAfter: string | null;
  commitMessage: string | null;
  exitCode: number | null;
  startedAt: string;
  finishedAt: string | null;
  log?: string;
}

interface DeployTarget {
  key: string;
  label: string;
  app: string;
  branch: string;
  /** The pm2 process that gets restarted. */
  unit: string;
  port: number;
  description: string;
  latest: DeploymentSummary | null;
}

type Notice = { kind: "info" | "success" | "error"; text: string } | null;

const POLL_MS = 2000;

/**
 * Manual backend deploys — pull, build, restart pm2 — triggered from the panel
 * (mirrors rhinon-cms Settings → Deploy).
 *
 * Deploying restarts the very API this page talks to, so a failed poll is the
 * expected middle of a successful deploy, not an error: polling keeps going
 * through the gap and only the run's own exit code decides success.
 */
export function DeployManager() {
  const { has } = usePermissions();
  const canTrigger = has("deploy:trigger");

  const [enabled, setEnabled] = useState(true);
  const [targets, setTargets] = useState<DeployTarget[]>([]);
  const [history, setHistory] = useState<DeploymentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [active, setActive] = useState<DeploymentSummary | null>(null);
  const [starting, setStarting] = useState<string | null>(null);
  const [apiUnreachable, setApiUnreachable] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const logRef = useRef<HTMLPreElement>(null);
  const stickToBottom = useRef(true);

  const flash = useCallback((n: NonNullable<Notice>) => {
    setNotice(n);
    window.setTimeout(() => setNotice((cur) => (cur === n ? null : cur)), 6000);
  }, []);

  const loadOverview = useCallback(async () => {
    const [t, h] = await Promise.all([
      apiFetch<{ enabled: boolean; targets: DeployTarget[] }>("/deploy/targets"),
      apiFetch<{ deployments: DeploymentSummary[] }>("/deploy/history?limit=20"),
    ]);
    setEnabled(t.enabled);
    setTargets(t.targets);
    setHistory(h.deployments);
  }, []);

  useEffect(() => {
    loadOverview()
      .catch((err) => flash({ kind: "error", text: err instanceof Error ? err.message : "Could not load deploys" }))
      .finally(() => setLoading(false));
  }, [loadOverview, flash]);

  const labelFor = useCallback(
    (key: string) => targets.find((t) => t.key === key)?.label || key,
    [targets]
  );

  // Adopt an already-running deploy on mount, so reloading mid-deploy (or opening a
  // second tab) picks the console back up instead of losing the run.
  useEffect(() => {
    if (activeId) return;
    const running = targets.find((t) => t.latest?.status === "running")?.latest;
    if (running) setActiveId(running.id);
  }, [targets, activeId]);

  // Poll the selected run. A network error here almost always means pm2 is
  // restarting the API mid-deploy — show "restarting", keep polling, change nothing.
  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const { deployment } = await apiFetch<{ deployment: DeploymentSummary }>(`/deploy/run/${activeId}`);
        if (cancelled) return;
        setApiUnreachable(false);
        setActive(deployment);
        if (deployment.status !== "running") {
          flash(
            deployment.status === "success"
              ? { kind: "success", text: `${labelFor(deployment.target)} deployed` }
              : { kind: "error", text: `${labelFor(deployment.target)} deploy failed — check the log` }
          );
          loadOverview().catch(() => {});
          return; // stop polling
        }
      } catch {
        if (!cancelled) setApiUnreachable(true);
      }
      if (!cancelled) timer = setTimeout(tick, POLL_MS);
    };

    timer = setTimeout(tick, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // labelFor/flash/loadOverview are stable enough; re-running on them would restart polling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Follow the log tail, but stop fighting the user once they scroll up to read.
  useEffect(() => {
    const el = logRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [active?.log]);

  const openRun = (id: string) => {
    setActive(null);
    setActiveId(id);
    stickToBottom.current = true;
  };

  const runDeploy = async (target: DeployTarget) => {
    const warning =
      target.key === "prod"
        ? `Deploy PRODUCTION?\n\nThis pulls ${target.branch}, rebuilds and restarts ${target.unit}. The API will be briefly unavailable.`
        : `Deploy ${target.label}?\n\nThis pulls ${target.branch}, rebuilds and restarts ${target.unit}.`;
    if (!confirm(warning)) return;

    setStarting(target.key);
    try {
      const { deploymentId } = await apiFetch<{ deploymentId: string }>(`/deploy/${target.key}`, { method: "POST" });
      openRun(deploymentId);
      flash({ kind: "info", text: `${target.label} deploy started` });
      loadOverview().catch(() => {});
    } catch (err) {
      flash({ kind: "error", text: err instanceof Error ? err.message : "Could not start the deploy" });
    } finally {
      setStarting(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Deploy"
        description="Pull the latest code, build and restart the backend on the server."
        action={
          <button
            type="button"
            onClick={() => loadOverview().catch(() => {})}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <TbRefresh className="h-4 w-4" /> Refresh
          </button>
        }
      />

      <div className="space-y-6">
        {notice && (
          <div
            role="status"
            className={cn(
              "rounded-lg border px-4 py-2.5 text-sm",
              notice.kind === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
              notice.kind === "error" && "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
              notice.kind === "info" && "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300"
            )}
          >
            {notice.text}
          </div>
        )}

        {!loading && !enabled && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <TbAlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-xs">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Deploys are disabled on this server</p>
              <p className="text-slate-600 dark:text-slate-400">
                Set <code className="font-mono">DEPLOY_ENABLED=true</code> in the backend&apos;s{" "}
                <code className="font-mono">.env</code> and restart it once by hand. History stays readable either way.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {loading && targets.length === 0 && (
            <div className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          )}
          {targets.map((t) => {
            const busy = t.latest?.status === "running" || starting === t.key;
            return (
              <div key={t.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{t.app}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
                  </div>
                  <StatusPill status={t.latest?.status} />
                </div>

                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <dt>Branch</dt>
                  <dd className="font-mono text-slate-800 dark:text-slate-200">{t.branch}</dd>
                  <dt>Process</dt>
                  <dd className="font-mono text-slate-800 dark:text-slate-200">{t.unit}</dd>
                  <dt>Last deploy</dt>
                  <dd className="text-slate-800 dark:text-slate-200">
                    {t.latest ? `${when(t.latest.startedAt)} · ${t.latest.triggeredByName}` : "never"}
                  </dd>
                </dl>

                {t.latest?.commitMessage && (
                  <p className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <TbGitCommit className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="truncate" title={t.latest.commitMessage}>
                      {t.latest.commitMessage}
                    </span>
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!canTrigger || !enabled || busy}
                    onClick={() => runDeploy(t)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? <TbLoader2 className="h-4 w-4 animate-spin" /> : <TbRocket className="h-4 w-4" />}
                    {busy ? "Deploying…" : `Deploy ${t.label}`}
                  </button>
                  {t.latest && (
                    <button
                      type="button"
                      onClick={() => openRun(t.latest!.id)}
                      className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      View log
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!canTrigger && !loading && (
          <p className="text-xs text-slate-500">
            You can see deploy history but not trigger deploys. You need the{" "}
            <code className="font-mono">deploy:trigger</code> permission.
          </p>
        )}

        {activeId && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <StatusPill status={active?.status} />
              <p className="flex-1 text-xs text-slate-500 dark:text-slate-400">
                {active
                  ? `${labelFor(active.target)} · started by ${active.triggeredByName} · ${when(active.startedAt)}`
                  : "Loading run…"}
              </p>
              {active?.commitAfter && (
                <code className="font-mono text-[11px] text-slate-500">{active.commitAfter.slice(0, 7)}</code>
              )}
            </div>

            {apiUnreachable && (
              <p className="flex items-center gap-2 border-b border-slate-200 bg-amber-50 px-4 py-2 text-[11px] text-amber-700 dark:border-slate-800 dark:bg-amber-950/30 dark:text-amber-400">
                <TbLoader2 className="h-3.5 w-3.5 animate-spin" />
                API restarting — this is expected mid-deploy. Reconnecting…
              </p>
            )}

            <pre
              ref={logRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
              }}
              className="max-h-[28rem] overflow-auto whitespace-pre-wrap bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-emerald-100"
            >
              {active?.log?.trim() || "Waiting for output…"}
            </pre>
          </div>
        )}

        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">History</h2>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {history.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-slate-500">{loading ? "Loading…" : "No deploys yet."}</p>
            )}
            {history.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => openRun(d.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  activeId === d.id && "bg-slate-50 dark:bg-slate-800/50"
                )}
              >
                <StatusPill status={d.status} compact />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">
                    {labelFor(d.target)}
                    {d.commitMessage ? ` — ${d.commitMessage}` : ""}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {d.triggeredByName} · {when(d.startedAt)}
                    {d.finishedAt ? ` · ${duration(d.startedAt, d.finishedAt)}` : ""}
                  </p>
                </div>
                {d.commitAfter && <code className="font-mono text-[11px] text-slate-500">{d.commitAfter.slice(0, 7)}</code>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StatusPill({ status, compact }: { status?: DeployStatus | null; compact?: boolean }) {
  if (!status) {
    return compact ? null : (
      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800">
        No runs
      </span>
    );
  }
  const map = {
    running: { icon: <TbLoader2 className="h-3 w-3 animate-spin" />, label: "Running", cls: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400" },
    success: { icon: <TbCheck className="h-3 w-3" />, label: "Success", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" },
    failed: { icon: <TbX className="h-3 w-3" />, label: "Failed", cls: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
  }[status];

  return (
    <span className={cn("flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", map.cls)}>
      {map.icon}
      {!compact && map.label}
    </span>
  );
}

function when(iso: string) {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function duration(start: string, end: string) {
  const secs = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000));
  return secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`;
}
