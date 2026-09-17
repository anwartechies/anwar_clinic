import path from "path";
import os from "os";

/**
 * Deploy targets, defined HERE and nowhere else (mirrors rhinon-cms).
 *
 * The admin panel sends only a key ("prod"); the repo path, branch and pm2 process
 * name are never accepted from the client. If a caller could supply a path or a
 * command, this endpoint would be a remote shell for anyone holding a stolen token.
 */
export interface DeployTarget {
  key: string;
  label: string;
  /** Absolute path to the git checkout (repo root) on this EC2 box. */
  repo: string;
  /** The backend's folder inside that monorepo checkout. */
  appDir: string;
  branch: string;
  /** pm2 process name to restart once the build succeeds. */
  proc: string;
  /** Local port and path used for the post-restart health check. */
  port: number;
  healthPath: string;
  app: string;
  description: string;
}

export const DEPLOY_TARGETS: Record<string, DeployTarget> = {
  prod: {
    key: "prod",
    label: "Production",
    app: "NexGen Hair Transplant",
    repo: process.env.DEPLOY_PROD_REPO || "/home/ubuntu/anwar_clinic",
    appDir: "backend",
    branch: process.env.DEPLOY_PROD_BRANCH || "main",
    proc: process.env.DEPLOY_PROD_PROC || "anwar-clinic-api",
    port: parseInt(process.env.PORT || "5050", 10),
    healthPath: "/health",
    description: "api.nexgenhairtransplant.com — live backend for the website, shop and admin panel.",
  },
};

export function getDeployTarget(key: string): DeployTarget | null {
  return Object.prototype.hasOwnProperty.call(DEPLOY_TARGETS, key) ? DEPLOY_TARGETS[key] : null;
}

/**
 * Where the deploy script streams its output. Lives outside the checkout so a
 * `git pull` can never disturb an in-flight run's log.
 */
export const DEPLOY_LOG_DIR = process.env.DEPLOY_LOG_DIR || path.join(os.homedir(), "deploy-logs");

/**
 * Off unless explicitly enabled, so a laptop or a rebuilt instance never exposes
 * a self-restart button by accident. Set DEPLOY_ENABLED=true in the server's .env.
 */
export const DEPLOY_ENABLED = process.env.DEPLOY_ENABLED === "true";

export const deployLogPath = (id: string) => path.join(DEPLOY_LOG_DIR, `${id}.log`);
/** Written by the script's EXIT trap — the only signal that a detached run finished. */
export const deployExitPath = (id: string) => path.join(DEPLOY_LOG_DIR, `${id}.exit`);
