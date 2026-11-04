import React, { useEffect, useState } from 'react';
import { Laptop, Lock, LogOut, Search, ShieldCheck, Smartphone, UserPlus } from 'lucide-react';
import { Async, Avatar, Banner, Btn, Card, Chip, Drawer, Field, KV, Modal, Pills, SecHead, Toggle } from '../components/ui';
import { ago, date, dateTime, inr, useAction, useFetch } from '../lib';
import api from '../api';
import { useAuth } from '../auth';

const ROLE = { super_admin: ['cobalt', 'Super Admin'], inventory_manager: ['violet', 'Inventory'], dispensing: ['mint', 'Dispensing'], billing: ['amber', 'Billing'], clinician: ['coral', 'Clinician'] };
const ROLE_OPTIONS = ['inventory_manager', 'dispensing', 'billing', 'clinician'];

function InviteModal({ onClose, onDone }) {
  const [f, setF] = useState({ name: '', phone: '+91 ', email: '', role: 'billing', shiftOnly: true, otpNewDevice: true });
  const [busy, run] = useAction();
  const [code, setCode] = useState(null);
  const send = () => run(async () => { const { data } = await api.post('/staff/invite', { ...f, email: f.email || undefined }); setCode(data.emailed ? 'emailed' : data.devInviteCode || 'sent'); onDone(); }, 'Invite sent');
  return (
    <Modal title="Invite staff member" onClose={onClose} footer={code ? <Btn onClick={onClose}>Done</Btn> : <Btn icon={UserPlus} disabled={busy || !f.name || f.phone.replace(/\D/g, '').length < 12} onClick={send}>Send invite · valid 7 days</Btn>}>
      {code ? <Banner tone="mint">{code === 'emailed' ? `Invite emailed to ${f.email}. They enter the code in the app under “I have an invite”.` : code === 'sent' ? `${f.name} can now activate their account.` : <>Invite created. <b>Dev mode code: {code}</b> — they enter it in the app under “I have an invite”.</>}</Banner> : (
        <>
          <Field label="Full name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <div className="grid g2" style={{ gap: 12 }}>
            <Field label="Mobile"><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
            <Field label="Email (optional)"><input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          </div>
          <Field label="Role"><Pills value={f.role} onChange={(role) => setF({ ...f, role })} options={ROLE_OPTIONS.map((r) => ({ key: r, label: ROLE[r][1] }))} /></Field>
          <div className="between"><div><div className="h3">Shift-only access</div><div className="sub">09:00 – 19:00 · Mon–Sat</div></div><Toggle on={f.shiftOnly} onChange={(v) => setF({ ...f, shiftOnly: v })} label="Shift-only" /></div>
          <div className="between"><div><div className="h3">Require OTP on new device</div><div className="sub">Recommended for all roles</div></div><Toggle on={f.otpNewDevice} onChange={(v) => setF({ ...f, otpNewDevice: v })} label="OTP on new device" /></div>
        </>
      )}
    </Modal>
  );
}

export function Staff() {
  const [search, setSearch] = useState('');
  const q = useFetch('/staff', { search: search || undefined });
  const [inviting, setInviting] = useState(false);
  const [sel, setSel] = useState(null);
  const activity = useFetch(sel ? `/staff/${sel.id}/activity` : null);
  const [busy, run] = useAction();
  const patch = (body, msg) => run(async () => { const { data } = await api.patch(`/staff/${sel.id}`, body); setSel({ ...sel, ...data }); q.reload(); }, msg);
  const resend = (u) => run(async () => { const { data } = await api.post(`/staff/${u.id}/resend`); return data; }, 'Invite resent');
  return (
    <>
      <div className="between wrap">
        <div><h1 className="h1">Staff</h1><div className="sub">{q.data ? `${q.data.counts.total} total · ${q.data.counts.active} active · ${q.data.counts.invited} invited` : ' '}</div></div>
        <div className="row wrap"><label className="search"><Search size={18} /><input placeholder="Search name, role or phone" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search staff" /></label><Btn icon={UserPlus} onClick={() => setInviting(true)}>Invite</Btn></div>
      </div>
      <Async q={q}>{(d) => (
        <Card pad0 className="table-wrap"><table className="t"><thead><tr><th>Name</th><th>Role</th><th>Contact</th><th>Last seen</th><th>Status</th></tr></thead>
          <tbody>{d.items.map((u) => (
            <tr key={u.id} className={u.you ? '' : 'click'} onClick={u.you ? undefined : () => setSel(u)} style={u.status === 'inactive' ? { opacity: 0.6 } : null}>
              <td><div className="row"><Avatar initials={u.initials} bg={u.avatarBg} fg={u.avatarFg} /><div><div className="h3" style={u.status === 'inactive' ? { textDecoration: 'line-through' } : null}>{u.name}</div><div className="sub" style={{ fontSize: 12 }}>{u.title || ''}</div></div></div></td>
              <td><Chip tone={ROLE[u.role][0]}>{ROLE[u.role][1]}</Chip></td>
              <td><div>{u.phone}</div><div className="sub" style={{ fontSize: 12 }}>{u.email}</div></td>
              <td>{u.online ? <Chip tone="mint">Online now</Chip> : u.lastSeenAt ? ago(u.lastSeenAt) : '—'}</td>
              <td>{u.you ? <Chip tone="night">You</Chip> : u.status === 'invited' ? <Btn size="sm" tone="soft" onClick={(e) => { e.stopPropagation(); resend(u); }}>Resend invite</Btn> : u.status === 'inactive' ? <Chip>Inactive</Chip> : u.flags ? <Chip tone="amber">Flag</Chip> : <Chip tone="mint">Active</Chip>}</td>
            </tr>
          ))}</tbody></table></Card>
      )}</Async>
      {inviting ? <InviteModal onClose={() => setInviting(false)} onDone={q.reload} /> : null}
      {sel ? (
        <Drawer title={sel.name} subtitle={`${ROLE[sel.role][1]} · ${sel.phone}`} onClose={() => setSel(null)}
          footer={sel.status === 'inactive' ? <Btn tone="soft" disabled={busy} onClick={() => patch({ status: 'active' }, 'Access restored')}>Reactivate</Btn>
            : <Btn tone="danger" icon={Lock} disabled={busy} onClick={() => { if (window.confirm(`Deactivate ${sel.name}? They are signed out everywhere.`)) patch({ status: 'inactive' }, 'Access revoked'); }}>Deactivate & revoke access</Btn>}>
          {sel.status !== 'inactive' ? <Field label="Role"><Pills value={sel.role} onChange={(role) => patch({ role }, 'Role updated')} options={ROLE_OPTIONS.map((r) => ({ key: r, label: ROLE[r][1] }))} /></Field> : null}
          <Card>
            <div className="between"><div><div className="h3">Shift-only access</div><div className="sub">{sel.shiftStart} – {sel.shiftEnd}</div></div><Toggle on={sel.shiftOnly} onChange={(v) => patch({ shiftOnly: v }, 'Saved')} label="Shift-only access" /></div>
          </Card>
          <SecHead title="Recent activity" />
          <Async q={activity}>{(rows) => (
            <Card pad0><div className="list">{rows.length ? rows.map((a) => <div key={a.id} className="li"><div className="grow"><b>{a.message}</b><div className="meta">{a.detail}</div></div><span className="sub" style={{ whiteSpace: 'nowrap' }}>{dateTime(a.createdAt)}</span></div>) : <div className="li sub">No activity yet.</div>}</div></Card>
          )}</Async>
        </Drawer>
      ) : null}
    </>
  );
}

export function Roles() {
  const q = useFetch('/roles');
  const [role, setRole] = useState('inventory_manager');
  const [perms, setPerms] = useState([]);
  const [busy, run] = useAction();
  const cur = q.data && q.data.roles.find((r) => r.role === role);
  useEffect(() => { if (cur) setPerms(cur.permissions); }, [cur]);
  const dirty = cur && JSON.stringify([...perms].sort()) !== JSON.stringify([...cur.permissions].sort());
  const save = () => run(async () => { await api.put(`/roles/${role}`, { permissions: perms }); q.reload(); }, 'Permissions saved');
  return (
    <>
      <div className="between wrap">
        <div><h1 className="h1">Roles & permissions</h1><div className="sub">Enforced on the server, not just hidden in the app</div></div>
        <div className="row"><Btn tone="ghost" disabled={!dirty} onClick={() => setPerms(cur.permissions)}>Discard</Btn><Btn tone="night" disabled={!dirty || busy} onClick={save}>Save role</Btn></div>
      </div>
      <Pills value={role} onChange={setRole} options={ROLE_OPTIONS.map((r) => ({ key: r, label: ROLE[r][1] }))} />
      <Async q={q}>{(d) => (
        <>
          <Card tone={ROLE[role][0] === 'mint' || ROLE[role][0] === 'amber' ? ROLE[role][0] : ROLE[role][0] === 'coral' ? 'coral' : 'violet'} className="row">
            <ShieldCheck size={22} /><div className="grow"><div className="h2" style={{ color: 'inherit' }}>{cur.label}</div><div style={{ fontSize: 13, opacity: 0.9 }}>{cur.members} member{cur.members === 1 ? '' : 's'} · {perms.length} of {d.catalogue.length} permissions</div></div>
          </Card>
          <div className="grid g2">
            {[...new Set(d.catalogue.map((p) => p.group))].map((g) => (
              <Card key={g} pad0>
                <div className="cap" style={{ padding: '16px 18px 4px' }}>{g}</div>
                <div className="list">{d.catalogue.filter((p) => p.group === g).map((p) => (
                  <div key={p.key} className="li"><div className="grow"><div className="h3">{p.label}</div>{p.hint ? <div className="meta">{p.hint}</div> : null}</div>
                    {p.locked ? <Lock size={18} color="var(--muted)" aria-label="Locked" /> : <Toggle on={perms.includes(p.key)} onChange={() => setPerms(perms.includes(p.key) ? perms.filter((x) => x !== p.key) : [...perms, p.key])} label={p.label} />}</div>
                ))}</div>
              </Card>
            ))}
          </div>
        </>
      )}</Async>
    </>
  );
}

export function Settings() {
  const q = useFetch('/settings');
  const ses = useFetch('/auth/sessions');
  const { user, signOut } = useAuth();
  const [draft, setDraft] = useState(null);
  const [busy, run] = useAction();
  useEffect(() => { if (q.data) setDraft(q.data); }, [q.data]);
  const save = () => run(async () => { const { data } = await api.put('/settings', draft); q.setData(data); }, 'Settings saved');
  const set = (k, v) => setDraft({ ...draft, [k]: v });
  const revoke = (id) => run(async () => { await api.delete(`/auth/sessions/${id}`); ses.reload(); }, 'Device signed out');
  const revokeOthers = () => run(async () => { await api.post('/auth/sessions/revoke-others'); ses.reload(); }, 'Other devices signed out');
  return (
    <>
      <div className="between wrap"><div><h1 className="h1">Settings</h1><div className="sub">Alert thresholds, approval limits and security</div></div><Btn disabled={busy || !draft || JSON.stringify(draft) === JSON.stringify(q.data)} onClick={save}>Save changes</Btn></div>
      <div className="grid g2">
        <Async q={q}>{() => (draft ? (
          <Card className="stack">
            <SecHead title="Alert thresholds" />
            <Field label="Expiry warning windows (days)" help="Comma separated, e.g. 7, 30, 60, 90"><input className="input" value={draft.expiryWindows.join(', ')} onChange={(e) => set('expiryWindows', e.target.value.split(',').map((x) => parseInt(x.trim(), 10)).filter((n) => n > 0))} /></Field>
            <div className="grid g2" style={{ gap: 12 }}>
              <Field label="Count variance tolerance (%)"><input className="input" type="number" value={draft.varianceTolerancePct} onChange={(e) => set('varianceTolerancePct', Number(e.target.value))} /></Field>
              <Field label="Auto-approve adjustments up to (₹)" help="0 = every adjustment needs approval"><input className="input" type="number" value={draft.adjustmentApprovalAbove} onChange={(e) => set('adjustmentApprovalAbove', Number(e.target.value))} /></Field>
              <Field label="POs need approval above (₹)"><input className="input" type="number" value={draft.poApprovalAbove} onChange={(e) => set('poApprovalAbove', Number(e.target.value))} /></Field>
              <Field label="Refunds need approval above (₹)"><input className="input" type="number" value={draft.refundApprovalAbove} onChange={(e) => set('refundApprovalAbove', Number(e.target.value))} /></Field>
              <Field label="Working hours start"><input className="input" type="time" value={draft.workingHours.start} onChange={(e) => set('workingHours', { ...draft.workingHours, start: e.target.value })} /></Field>
              <Field label="Working hours end"><input className="input" type="time" value={draft.workingHours.end} onChange={(e) => set('workingHours', { ...draft.workingHours, end: e.target.value })} /></Field>
              <Field label="Default GST (%)"><select className="input" value={draft.gstDefault} onChange={(e) => set('gstDefault', Number(e.target.value))}>{[5, 12, 18].map((g) => <option key={g} value={g}>{g}%</option>)}</select></Field>
              <Field label="Dispense reversal window (min)"><input className="input" type="number" value={draft.reverseWindowMinutes} onChange={(e) => set('reverseWindowMinutes', Number(e.target.value))} /></Field>
            </div>
            <div className="between"><div><div className="h3">After-hours activity flag</div><div className="sub">Flags stock movements outside working hours</div></div><Toggle on={draft.afterHoursFlag} onChange={(v) => set('afterHoursFlag', v)} label="After-hours flag" /></div>
            <Field label="Storage locations" help="Comma separated"><input className="input" value={draft.storageLocations.join(', ')} onChange={(e) => set('storageLocations', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} /></Field>
            <div className="sub">Current limits: adjustments {inr(q.data.adjustmentApprovalAbove)} · POs {inr(q.data.poApprovalAbove)} · refunds {inr(q.data.refundApprovalAbove)}</div>
          </Card>
        ) : null)}</Async>
        <div className="stack">
          <Card tone="night" className="row">
            <Avatar initials={user.initials} bg="#14C79A" fg="#0A1633" size="lg" />
            <div className="grow"><div className="h2" style={{ color: '#fff' }}>{user.name}</div><div style={{ color: 'var(--night-muted)', fontSize: 13 }}>{user.email} · {user.phone}</div></div>
            <Btn tone="white" size="sm" icon={LogOut} onClick={signOut}>Sign out</Btn>
          </Card>
          <Card pad0>
            <div className="between" style={{ padding: '16px 18px 4px' }}><span className="h2">Sessions & security</span><Btn size="sm" tone="danger" disabled={busy} onClick={revokeOthers}>Sign out other devices</Btn></div>
            <Async q={ses}>{(d) => (
              <div className="list">
                {d.sessions.map((s) => (
                  <div key={s.id} className="li">
                    <span className={`tile sm ${s.current ? 't-cobalt' : 't-gray'}`}>{s.platform === 'web' ? <Laptop size={16} /> : <Smartphone size={16} />}</span>
                    <div className="grow"><div className="h3">{s.deviceName}</div><div className="meta">{s.location} · {s.current ? 'Active now' : ago(s.lastActiveAt)}</div></div>
                    {s.current ? <Chip tone="mint">This device</Chip> : <Btn size="sm" tone="ghost" disabled={busy} onClick={() => revoke(s.id)}>Sign out</Btn>}
                  </div>
                ))}
                {d.failedAttempts.length ? <div className="li"><Banner tone="coral">{d.failedAttempts.length} failed sign-in attempt(s) · last {dateTime(d.failedAttempts[0].createdAt)} · {d.failedAttempts[0].detail}</Banner></div> : null}
              </div>
            )}</Async>
          </Card>
          <Card><KV k="Access token lifetime" v="15 minutes (rotates)" /><KV k="Refresh token" v="7 days" /><KV k="Lockout" v="5 failed attempts → 15 min" /><KV k="Audit log" v="Append-only" /></Card>
          <span className="sub">Account created {date(user.createdAt, { year: 'numeric' })}</span>
        </div>
      </div>
    </>
  );
}
