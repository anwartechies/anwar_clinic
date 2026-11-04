import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Lock, TriangleAlert } from 'lucide-react';
import { Async, Avatar, Banner, Btn, Card, Chip, Drawer, Empty, Field, KV, Pills, Tile } from '../components/ui';
import { APPROVAL_META } from './Dashboard';
import { ago, dateTime, inr, monthYear, useAction, useFetch } from '../lib';
import api from '../api';
import { useAuth } from '../auth';

const STATUS = { pending: ['amber', 'Pending'], approved: ['mint', 'Approved'], rejected: ['coral', 'Rejected'] };

export function ApprovalDrawer({ id, onClose, onDone }) {
  const q = useFetch(`/approvals/${id}`);
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const [busy, run] = useAction();
  const a = q.data;
  const decide = (decision) => run(async () => { await api.post(`/approvals/${id}/decision`, { decision, note }); onDone(); onClose(); }, decision === 'approve' ? 'Approved and posted' : 'Rejected');
  const pending = a && a.status === 'pending' && a.makerId !== user.id;
  return (
    <Drawer title={a ? a.title : 'Approval'} subtitle={a ? a.code : ''} onClose={onClose} right={a ? <Chip tone={STATUS[a.status][0]}>{STATUS[a.status][1]}</Chip> : null}
      footer={pending ? <><Btn tone="danger" disabled={busy || !note.trim()} title={!note.trim() ? 'Add a checker note to reject' : ''} onClick={() => decide('reject')}>Reject</Btn><Btn icon={Check} className="grow" disabled={busy} onClick={() => decide('approve')}>Approve & post</Btn></> : null}>
      <Async q={q}>{() => (
        <>
          <Card className="stack">
            <div className="row">
              <Tile tone={APPROVAL_META[a.type][0]} icon={APPROVAL_META[a.type][1]} />
              <div className="grow"><div className="h3">{a.product ? a.product.name : a.subtitle}</div><div className="sub">{a.batch ? `Batch ${a.batch.batchNo} · exp ${monthYear(a.batch.expiryDate)} · ${a.batch.location || ''}` : a.reason}</div></div>
            </div>
            {['adjustment', 'wastage'].includes(a.type) ? (
              <div className="grid g3" style={{ gap: 8, textAlign: 'center' }}>
                <div style={{ background: 'var(--bg)', borderRadius: 14, padding: 10 }}><div className="num" style={{ fontSize: 24 }}>{a.systemQty}</div><div className="sub">System</div></div>
                <div style={{ background: a.qtyChange < 0 ? 'var(--coral-s)' : 'var(--mint-s)', borderRadius: 14, padding: 10 }}><div className="num" style={{ fontSize: 24, color: a.qtyChange < 0 ? 'var(--coral-t)' : 'var(--mint-t)' }}>{a.qtyChange > 0 ? '+' : '−'}{Math.abs(a.qtyChange)}</div><div className="sub">Change</div></div>
                <div style={{ background: 'var(--night)', color: '#fff', borderRadius: 14, padding: 10 }}><div className="num" style={{ fontSize: 24 }}>{a.systemQty + a.qtyChange}</div><div style={{ fontSize: 13, color: 'var(--night-muted)' }}>After</div></div>
              </div>
            ) : null}
            <div>
              <KV k="Reason" v={a.reason || '—'} />
              <KV k="Value impact" v={inr(a.valueImpact)} color={a.valueImpact < 0 ? 'var(--coral-t)' : undefined} />
              <KV k="Requested by" v={`${a.maker.name}${a.payload && a.payload.secondCounter ? ` + ${a.payload.secondCounter}` : ''}`} />
              <KV k="Requested" v={dateTime(a.createdAt)} />
              {a.payload && a.payload.countCode ? <KV k="Count session" v={a.payload.countCode} /> : null}
              {a.payload && a.payload.poNo ? <KV k="Purchase order" v={a.payload.poNo} /> : null}
              {a.note ? <KV k="Maker note" v={a.note} /> : null}
              {a.checker ? <KV k="Decided" v={`${a.checker.name} · ${dateTime(a.decidedAt)}`} /> : null}
              {a.checkerNote ? <KV k="Checker note" v={a.checkerNote} /> : null}
            </div>
          </Card>
          {a.type === 'write_off' && a.payload.batches ? (
            <Card pad0><div className="list">{a.payload.batches.map((b) => <div key={b.batchId} className="li"><div className="grow"><div className="h3">{b.product}</div><div className="meta">{b.batchNo} · {b.qty} units · exp {b.expiryDate}</div></div><b>{inr(b.value)}</b></div>)}</div></Card>
          ) : null}
          {a.pattern ? <Banner tone="amber" icon={TriangleAlert}><b>Pattern match: </b>{a.pattern}</Banner> : null}
          {a.movements && a.movements.length ? (
            <Card pad0>
              <div className="cap" style={{ padding: '14px 18px 0' }}>Batch movements · last 7 days</div>
              <div className="list">{a.movements.map((m) => <div key={m.id} className="li"><div className="grow"><div className="h3" style={{ fontSize: 14 }}>{m.type} {m.qty > 0 ? '+' : '−'}{Math.abs(m.qty)} {m.refNo ? `· ${m.refNo}` : ''}</div><div className="meta">{m.user ? m.user.name : 'System'} · {dateTime(m.createdAt)}</div></div>{m.afterHours ? <Chip tone="amber">After hours</Chip> : null}</div>)}</div>
            </Card>
          ) : null}
          {pending ? (
            <>
              <Field label="Checker note" help="Optional to approve, required to reject."><textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Approve. Flag batch for daily count for 2 weeks." /></Field>
              <div className="row sub" style={{ gap: 8 }}><Lock size={14} />Maker cannot approve own request. The decision is written to the audit log.</div>
            </>
          ) : a.status === 'pending' ? <Banner tone="amber" icon={Lock}>You raised this request, so another Super Admin must approve it.</Banner> : null}
        </>
      )}</Async>
    </Drawer>
  );
}

export default function Approvals() {
  const [params, setParams] = useSearchParams();
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('pending');
  const q = useFetch('/approvals', { type, status });
  const [open, setOpen] = useState(params.get('open'));
  const [busy, run] = useAction();
  useEffect(() => { if (params.get('open')) { setOpen(params.get('open')); setParams({}, { replace: true }); } }, [params, setParams]);
  const c = (q.data && q.data.counts) || {};

  const quickApprove = (a) => run(async () => { await api.post(`/approvals/${a.id}/decision`, { decision: 'approve' }); q.reload(); }, `${a.code} approved`);

  return (
    <>
      <div className="between wrap">
        <div><h1 className="h1">Approvals</h1><div className="sub">{status === 'pending' ? `${c.all || 0} waiting${q.data && q.data.oldestHours ? ` · oldest ${q.data.oldestHours} h` : ''}` : 'Decision history'}</div></div>
        <Pills value={status} onChange={setStatus} options={[{ key: 'pending', label: 'Pending' }, { key: 'all', label: 'History' }]} />
      </div>
      <Pills value={type} onChange={setType} options={[
        { key: 'all', label: 'All', n: c.all }, { key: 'adjustment', label: 'Adjust', n: c.adjustment || 0 }, { key: 'purchase', label: 'Purchase', n: c.purchase || 0 },
        { key: 'write_off', label: 'Write-off', n: c.write_off || 0 }, { key: 'wastage', label: 'Wastage', n: c.wastage || 0 }, { key: 'refund', label: 'Refund', n: c.refund || 0 },
      ]} />
      <Async q={q}>{(d) => (d.items.length ? (
        <div className="grid g3">
          {d.items.map((a) => {
            const [tone, Icon] = APPROVAL_META[a.type];
            return (
              <Card key={a.id} className="stack" style={{ gap: 12 }}>
                <div className="row">
                  <Tile tone={tone} icon={Icon} />
                  <div className="grow"><div className="h3">{a.title}</div><div className="sub ell">{a.subtitle}</div></div>
                  <b className="num" style={{ fontSize: 17, color: a.type === 'adjustment' && a.qtyChange < 0 ? 'var(--coral-t)' : 'var(--ink)' }}>{a.type === 'adjustment' ? `${a.qtyChange > 0 ? '+' : '−'}${Math.abs(a.qtyChange)}` : inr(Math.abs(a.valueImpact))}</b>
                </div>
                <div className="row sub" style={{ gap: 8, fontSize: 12.5 }}><Avatar name={a.maker.name} bg={a.maker.avatarBg} fg={a.maker.avatarFg} size="sm" /><span className="ell">{a.maker.name} · {a.reason || a.code} · {ago(a.createdAt)}</span></div>
                {a.status === 'pending' ? (
                  <div className="row" style={{ gap: 8 }}>
                    <Btn tone="ghost" size="sm" className="grow" onClick={() => setOpen(a.id)}>Review</Btn>
                    {a.type !== 'adjustment' ? <Btn size="sm" icon={Check} className="grow" disabled={busy} onClick={() => quickApprove(a)}>Approve</Btn> : null}
                  </div>
                ) : <div className="row" style={{ justifyContent: 'space-between' }}><Chip tone={STATUS[a.status][0]}>{STATUS[a.status][1]}</Chip><button type="button" className="link" onClick={() => setOpen(a.id)}>Details</button></div>}
              </Card>
            );
          })}
        </div>
      ) : <Empty title="Nothing to approve" body="Adjustments, purchases, write-offs and refunds that need a checker wait here." />)}</Async>
      {open ? <ApprovalDrawer id={open} onClose={() => setOpen(null)} onDone={q.reload} /> : null}
    </>
  );
}
