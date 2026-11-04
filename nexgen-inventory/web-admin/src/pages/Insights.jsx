import React, { useState } from 'react';
import { Download, FileText, Lock, Search } from 'lucide-react';
import { Async, Avatar, Banner, Bar, Btn, Card, Chip, Drawer, Empty, Field, KV, Pills, SecHead, Toggle } from '../components/ui';
import { Donut, GroupedBars, Legend, SERIES, TrendArea } from '../components/charts';
import { ago, date, dateTime, inr, iso, monthYear, signed, useAction, useFetch } from '../lib';
import api, { download } from '../api';

const TYPE_LABEL = { medicine: 'Medicines', consumable: 'Surgical consumables', prp: 'PRP / GFC supplies', instrument: 'Instruments', ppe: 'PPE & others', other: 'Other' };
const REASON = { expired: 'Expired', damage: 'Damaged', contaminated: 'Contaminated', dropped: 'Dropped', leaking: 'Leaking', other: 'Other' };

export function Analytics() {
  const [period, setPeriod] = useState('month');
  const q = useFetch('/analytics', { period });
  return (
    <>
      <div className="between wrap">
        <div><h1 className="h1">Analytics</h1><div className="sub">{period === 'month' ? monthYear(new Date()) : 'Rolling period'} · all locations</div></div>
        <Pills value={period} onChange={setPeriod} options={[{ key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }, { key: 'quarter', label: 'Quarter' }, { key: 'year', label: 'Year' }]} />
      </div>
      <Async q={q} rows={6}>{(d) => (
        <>
          <div className="grid g4">
            {[
              ['Gross margin', `${d.kpis.grossMargin.value}%`, d.kpis.grossMargin.delta, true, 'cobalt'],
              ['Wastage rate', `${d.kpis.wastageRate.value}%`, d.kpis.wastageRate.delta, false, 'coral'],
              ['Stock turnover', `${d.kpis.stockTurnover.value}×`, null, true, 'violet', 'annualised'],
              ['Days of cover', `${d.kpis.daysOfCover.value} d`, null, true, 'mint', 'at current usage'],
            ].map(([l, v, delta, upGood, tone, note]) => (
              <Card key={l} tone={tone} className="stack" style={{ gap: 8 }}>
                <span className="cap" style={{ color: 'inherit', opacity: 0.85 }}>{l}</span>
                <div className="num" style={{ fontSize: 32 }}>{v}</div>
                {delta !== null ? <span className="chip c-glass" style={tone === 'mint' ? { color: 'var(--ink)' } : null}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} pts {(delta >= 0) === upGood ? '· better' : '· worse'}</span> : <span style={{ fontSize: 13, opacity: 0.85 }}>{note}</span>}
              </Card>
            ))}
          </div>
          <div className="grid g4">
            <Card className="span3">
              <SecHead title={`Sales · ${inr(d.sales.total)}`} right={<Chip tone={d.sales.changePct >= 0 ? 'mint' : 'coral'}>{d.sales.changePct >= 0 ? '+' : '−'}{Math.abs(d.sales.changePct)}% vs prior period</Chip>} />
              <TrendArea data={d.sales.daily.map((x) => ({ x: x.date, sales: x.sales }))} dataKey="sales" name="Sales" xFmt={(v) => date(v)} height={260} />
            </Card>
            <Card tone="mint" className="stack">
              <span className="cap" style={{ color: 'var(--ink)' }}>FEFO saved</span>
              <div className="num" style={{ fontSize: 30 }}>{inr(d.fefoSaved)}</div>
              <div style={{ fontSize: 13 }}>Value of near-expiry stock (≤ 30 days) used before it could expire.</div>
            </Card>
          </div>
          <div className="grid g3">
            <Card>
              <SecHead title="Spend by category" />
              <div role="img" aria-label={d.spendByType.map((s) => `${TYPE_LABEL[s.type]} ${s.pct}%`).join(', ')}><Donut data={d.spendByType.map((s) => ({ name: TYPE_LABEL[s.type] || s.type, value: s.value }))} /></div>
              <div className="stack" style={{ gap: 6 }}>{d.spendByType.map((s, i) => <div key={s.type} className="between" style={{ fontSize: 13 }}><span className="row" style={{ gap: 8 }}><span className="dot" style={{ background: SERIES[i % SERIES.length], borderRadius: 2 }} />{TYPE_LABEL[s.type] || s.type}</span><b>{inr(s.value)} · {s.pct}%</b></div>)}</div>
            </Card>
            <Card pad0>
              <div style={{ padding: '18px 20px 6px' }}><SecHead title="Top revenue items" /></div>
              <table className="t"><tbody>{d.topItems.map((t, i) => <tr key={t.id}><td className="num" style={{ textAlign: 'left', color: 'var(--muted)', width: 24 }}>{i + 1}</td><td><div className="h3">{t.name}</div><div className="sub" style={{ fontSize: 12 }}>{t.units} {t.unit}s</div></td><td className="num"><b>{inr(t.revenue)}</b></td></tr>)}</tbody></table>
            </Card>
            <Card>
              <SecHead title="Wastage reasons · 6 months" />
              <div className="stack" style={{ gap: 12 }}>
                {d.wastageReasons.map((w, i) => <div key={w.reason} className="col" style={{ gap: 6 }}><div className="between" style={{ fontSize: 13 }}><span>{REASON[w.reason] || w.reason}</span><b>{w.pct}% · {inr(w.value)}</b></div><Bar thin value={w.pct} color={SERIES[(i + 4) % SERIES.length]} /></div>)}
                {!d.wastageReasons.length ? <span className="sub">No wastage recorded.</span> : null}
              </div>
            </Card>
          </div>
        </>
      )}</Async>
    </>
  );
}

export function Discrepancies() {
  const [view, setView] = useState('product');
  const q = useFetch('/discrepancies');
  const RES = { open: ['coral', 'Open'], checking: ['amber', 'Checking'], resolved: ['mint', 'Resolved'] };
  return (
    <>
      <div className="between wrap">
        <div><h1 className="h1">Discrepancies</h1><div className="sub">{q.data ? `${date(q.data.from)} – ${date(q.data.to)}` : ' '}</div></div>
        <Pills value={view} onChange={setView} options={[{ key: 'product', label: 'By product' }, { key: 'staff', label: 'By staff' }, { key: 'date', label: 'By date' }]} />
      </div>
      <Async q={q}>{(d) => (
        <>
          <div className="grid g3">
            <Card tone="coral"><div className="num" style={{ fontSize: 30 }}>{d.summary.open}</div><div>Open variances</div></Card>
            <Card tone="night"><div className="num" style={{ fontSize: 30 }}>{inr(d.summary.unexplained)}</div><div style={{ color: 'var(--night-muted)' }}>Unexplained shortage</div></Card>
            <Card tone="mint"><div className="num" style={{ fontSize: 30 }}>{d.summary.resolved}</div><div>Resolved</div></Card>
          </div>
          <Banner tone="gray">These are signals, not accusations. Check movements and context before acting on any variance.</Banner>
          {view === 'product' && (d.products.length ? (
            <Card pad0 className="table-wrap"><table className="t"><thead><tr><th>Product</th><th>Batch</th><th>Count</th><th className="num">Expected</th><th className="num">Counted</th><th className="num">Variance</th><th className="num">Value</th><th>Status</th></tr></thead>
              <tbody>{d.products.map((r) => <tr key={r.id}><td className="h3">{r.name}</td><td>{r.batch_no}</td><td>{r.count_code}</td><td className="num">{r.system_qty}</td><td className="num">{r.counted_qty}</td><td className="num" style={{ fontWeight: 800, color: r.variance < 0 ? 'var(--coral-t)' : 'var(--mint-t)' }}>{signed(r.variance)}</td><td className="num">{inr(r.value)}</td><td><Chip tone={RES[r.resolution][0]}>{RES[r.resolution][1]}</Chip></td></tr>)}</tbody></table></Card>
          ) : <Empty title="No variances in the last 30 days" />)}
          {view === 'staff' && (
            <Card className="stack">
              {d.staff.map((s) => (
                <div key={s.id} className="col" style={{ gap: 6 }}>
                  <div className="row"><Avatar name={s.name} size="sm" /><span className="grow"><b>{s.name}</b> <span className="sub">· {s.handlings} handlings</span></span><b className="num">{inr(s.variance)}</b></div>
                  <Bar thin value={(s.variance / (d.staff[0].variance || 1)) * 100} color={s.variance === d.staff[0].variance ? 'var(--coral)' : 'var(--cobalt)'} />
                </div>
              ))}
              <span className="sub">Share of variance on batches each person touched between counts.</span>
            </Card>
          )}
          {view === 'date' && (
            <Card>
              <GroupedBars data={d.dates.map((x) => ({ label: date(x.date), shortage: Math.abs(Math.min(0, x.value)), surplus: Math.max(0, x.value) }))} keys={[['shortage', 'Shortage', SERIES[4]], ['surplus', 'Surplus', SERIES[3]]]} />
              <Legend items={[['Shortage', SERIES[4]], ['Surplus', SERIES[3]]]} />
            </Card>
          )}
        </>
      )}</Async>
    </>
  );
}

export function Activity() {
  const [cat, setCat] = useState('all');
  const q = useFetch('/audit', { category: cat, limit: 150 });
  const [busy, run] = useAction();
  return (
    <>
      <div className="between wrap">
        <div><h1 className="h1">Activity log</h1><div className="row" style={{ gap: 6, color: 'var(--mint-t)', fontWeight: 600, fontSize: 13 }}><Lock size={14} />Append-only · cannot be edited or deleted</div></div>
        <Btn tone="ghost" icon={Download} disabled={busy} onClick={() => run(() => download('/reports/movement_ledger/export?format=xlsx'))}>Export ledger</Btn>
      </div>
      <Pills value={cat} onChange={setCat} options={['all', 'stock', 'approvals', 'billing', 'security', 'staff', 'system'].map((k) => ({ key: k, label: k[0].toUpperCase() + k.slice(1) }))} />
      <Async q={q}>{(rows) => (
        <Card pad0 className="table-wrap"><table className="t"><thead><tr><th>When</th><th>Who</th><th>What</th><th>Detail</th><th>Category</th></tr></thead>
          <tbody>{rows.map((a) => (
            <tr key={a.id}>
              <td style={{ whiteSpace: 'nowrap' }}>{dateTime(a.createdAt)}</td>
              <td><div className="row" style={{ gap: 8 }}>{a.user ? <Avatar name={a.user.name} bg={a.user.avatarBg} fg={a.user.avatarFg} size="sm" /> : null}<span className="ell">{a.user ? a.user.name : 'System'}</span></div></td>
              <td><b>{a.message}</b>{a.flag ? <Chip tone={a.flag === 'blocked' ? 'coral' : 'amber'} style={{ marginLeft: 6 }}>{a.flag === 'after_hours' ? 'After hours' : a.flag}</Chip> : null}</td>
              <td className="sub">{a.detail}</td>
              <td><Chip>{a.category}</Chip></td>
            </tr>
          ))}</tbody></table></Card>
      )}</Async>
    </>
  );
}

const INV = { paid: ['mint', 'Paid'], due: ['amber', 'Due'], claim: ['cobalt', 'Claim'], part_return: ['violet', 'Part return'], returned: ['gray', 'Returned'] };
export function Invoices() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const q = useFetch('/invoices', { tab, search: search || undefined, limit: 100 });
  const [open, setOpen] = useState(null);
  const inv = useFetch(open ? `/invoices/${open}` : null);
  const [busy, run] = useAction();
  return (
    <>
      <div className="between wrap">
        <div><h1 className="h1">Invoices</h1><div className="sub">{q.data ? `${monthYear(new Date())} · ${q.data.month.count} invoices · ${inr(q.data.month.total)}` : ' '}</div></div>
        <label className="search"><Search size={18} /><input placeholder="Invoice number" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search invoices" /></label>
      </div>
      <Pills value={tab} onChange={setTab} options={[{ key: 'all', label: 'All' }, { key: 'paid', label: 'Paid' }, { key: 'due', label: 'Due', n: q.data && q.data.dueCount }, { key: 'returned', label: 'Returned' }]} />
      <Async q={q}>{(d) => (
        <Card pad0 className="table-wrap"><table className="t"><thead><tr><th>Invoice</th><th>Date</th><th>Patient</th><th>Mode</th><th className="num">Items</th><th className="num">Total</th><th>Status</th></tr></thead>
          <tbody>{d.items.map((i) => <tr key={i.id} className="click" onClick={() => setOpen(i.id)}><td className="h3">{i.invNo}</td><td>{dateTime(i.issuedAt)}</td><td>{i.patient ? `${i.patient.name} · ${i.patient.code}` : 'Walk-in'}</td><td>{(i.paymentMethod || '').toUpperCase()}</td><td className="num">{i.itemCount}</td><td className="num"><b>{inr(i.total)}</b></td><td><Chip tone={INV[i.status][0]}>{i.status === 'due' ? `${inr(i.total - i.paidAmount)} due` : INV[i.status][1]}</Chip></td></tr>)}</tbody></table></Card>
      )}</Async>
      {open ? (
        <Drawer title={inv.data ? inv.data.invNo : 'Invoice'} subtitle={inv.data ? dateTime(inv.data.issuedAt) : ''} onClose={() => setOpen(null)}
          footer={<Btn icon={FileText} block disabled={busy} onClick={() => run(() => download(`/invoices/${open}/pdf`))}>Open PDF</Btn>}>
          <Async q={inv}>{(x) => (
            <>
              <Card><KV k="Billed to" v={x.patient ? `${x.patient.name} · ${x.patient.code}` : 'Walk-in'} /><KV k="Reference" v={x.prescription ? `${x.prescription.rxNo}${x.dispense ? ` · ${x.dispense.code}` : ''}` : 'Counter sale'} /><KV k="Created by" v={x.creator ? x.creator.name : '—'} /><KV k="Status" v={INV[x.status][1]} /></Card>
              <Card pad0><table className="t"><thead><tr><th>Item</th><th>Batch</th><th className="num">Qty</th><th className="num">Amount</th></tr></thead><tbody>{x.items.map((i) => <tr key={i.id}><td>{i.product.name}{i.returnedQty ? <Chip tone="violet" style={{ marginLeft: 6 }}>{i.returnedQty} returned</Chip> : null}</td><td>{i.batch ? i.batch.batchNo : ''}</td><td className="num">{i.qty}</td><td className="num">{inr(i.amount)}</td></tr>)}</tbody></table></Card>
              <Card><KV k="Subtotal" v={inr(x.subtotal, 2)} /><KV k="CGST + SGST" v={inr(x.gstAmount, 2)} /><KV k="Round off" v={inr(x.roundOff, 2)} /><div className="between" style={{ paddingTop: 8 }}><span className="h3">Total</span><b className="num" style={{ fontSize: 24 }}>{inr(x.total)}</b></div>
                {x.payments.map((p) => <div key={p.id} className="sub">{p.method.toUpperCase()} · {inr(p.amount)} · {dateTime(p.createdAt)}</div>)}</Card>
              {x.returns.map((r) => <Banner key={r.id} tone="gray">{r.code} · {inr(r.amount)} · {r.reason} · {r.status.replace('_', ' ')}</Banner>)}
            </>
          )}</Async>
        </Drawer>
      ) : null}
    </>
  );
}

export function Reports() {
  const q = useFetch('/reports');
  const [type, setType] = useState('stock_valuation');
  const [from, setFrom] = useState(iso(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [to, setTo] = useState(iso(new Date()));
  const [groupBy, setGroupBy] = useState('product');
  const [busy, run] = useAction();
  const gen = (format) => run(async () => { await download(`/reports/${type}/export?format=${format}&from=${from}&to=${to}&groupBy=${groupBy}`); setTimeout(q.reload, 1500); });
  const weekly = (enabled) => run(async () => { await api.put('/settings', { weeklyReportEmail: { ...q.data.weeklyEmail, enabled } }); q.reload(); }, 'Saved');
  return (
    <>
      <div><h1 className="h1">Reports & export</h1><div className="sub">PDF for sharing, Excel/CSV for your accountant</div></div>
      <Async q={q}>{(d) => (
        <div className="grid g3">
          <Card className="span2 stack">
            <div className="grid g3" style={{ gap: 10 }}>
              {d.catalogue.map((c) => <button key={c.type} type="button" className={`btn ${c.type === type ? 'b-night' : 'b-ghost'}`} onClick={() => setType(c.type)}>{c.label}</button>)}
            </div>
            <div className="grid g3" style={{ gap: 12 }}>
              <Field label="From"><input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
              <Field label="To"><input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
              {type === 'stock_valuation' ? <Field label="Group by"><select className="input" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}><option value="product">Product</option><option value="batch">Batch</option><option value="category">Category</option></select></Field> : <div />}
            </div>
            <div className="row wrap">
              <Btn icon={Download} disabled={busy} onClick={() => gen('pdf')}>PDF</Btn>
              <Btn tone="mint" icon={Download} disabled={busy} onClick={() => gen('xlsx')}>Excel</Btn>
              <Btn tone="ghost" icon={Download} disabled={busy} onClick={() => gen('csv')}>CSV</Btn>
            </div>
          </Card>
          <Card className="stack">
            <div className="between"><div><div className="h3">Email every Monday</div><div className="sub">{d.weeklyEmail.time} to {d.weeklyEmail.to}</div></div><Toggle on={d.weeklyEmail.enabled} onChange={weekly} label="Weekly email" /></div>
            <span className="cap">Recent exports</span>
            {d.recent.map((r) => <div key={r.id} className="row"><FileText size={16} color="var(--muted)" /><div className="grow"><div className="ell" style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div><div className="sub" style={{ fontSize: 12 }}>{ago(r.createdAt)} · {Math.round(r.sizeBytes / 1024)} KB</div></div></div>)}
          </Card>
        </div>
      )}</Async>
    </>
  );
}

export function Notifications() {
  const q = useFetch('/notifications');
  const [busy, run] = useAction();
  const TONE = { critical: 'coral', approval: 'amber', info: 'cobalt' };
  return (
    <>
      <div className="between wrap"><div><h1 className="h1">Notifications</h1><div className="sub">{q.data ? `${q.data.unread} unread` : ' '}</div></div><Btn tone="ghost" disabled={busy} onClick={() => run(async () => { await api.post('/notifications/read-all'); q.reload(); }, 'All marked read')}>Mark all read</Btn></div>
      <Async q={q}>{(d) => (
        <Card pad0><div className="list">{d.items.map((n) => (
          <div key={n.id} className="li">
            <span className={`tile sm t-${TONE[n.type]}`} aria-hidden="true">{n.type === 'critical' ? '!' : n.type === 'approval' ? '✓' : 'i'}</span>
            <div className="grow"><div className="h3" style={{ fontWeight: n.readAt ? 600 : 800 }}>{n.title}</div><div className="meta">{n.body}</div></div>
            <span className="sub">{ago(n.createdAt)}</span>{!n.readAt ? <span className="dot" style={{ background: 'var(--cobalt)' }} /> : null}
          </div>
        ))}</div></Card>
      )}</Async>
    </>
  );
}
