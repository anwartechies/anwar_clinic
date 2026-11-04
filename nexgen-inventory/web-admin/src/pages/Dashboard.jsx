import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Pill, Receipt, SlidersHorizontal, Trash2, Truck, TrendingDown, TrendingUp, Undo2, IndianRupee } from 'lucide-react';
import { Async, Avatar, Bar, Card, Chip, Pills, SecHead, Tile } from '../components/ui';
import { Donut, GroupedBars, Legend, SERIES, Spark, StackedSegments, TrendArea } from '../components/charts';
import { useAuth } from '../auth';
import { date, inr, num, useFetch } from '../lib';

export const APPROVAL_META = {
  adjustment: ['amber', SlidersHorizontal], purchase: ['cobalt', Truck], write_off: ['coral', Trash2], wastage: ['violet', Undo2], refund: ['mint', IndianRupee],
};
const SIGNAL = { high: 'var(--coral)', medium: 'var(--amber)', info: 'var(--violet)' };
const RANGE = { today: 'Today', '7d': 'Last 7 days', '30d': 'Last 30 days' };
const TYPE_LABEL = { medicine: 'Medicines', consumable: 'Surgical consumables', prp: 'PRP / GFC', instrument: 'Instruments', ppe: 'PPE & others', other: 'Other' };

function greeting() {
  const h = Number(new Date().toLocaleString('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function Kpi({ tone, icon, value, label, onClick }) {
  const dark = ['cobalt', 'coral', 'violet', 'night'].includes(tone);
  return (
    <Card tone={tone} onClick={onClick} className="stack" style={{ gap: 12 }}>
      <Tile tone={dark ? 'white' : tone ? 'night' : 'violet'} icon={icon} size="sm" />
      <div className="num" style={{ fontSize: 28 }}>{value}</div>
      <div style={{ fontSize: 13, opacity: dark ? 0.9 : 1, color: tone ? undefined : 'var(--muted)' }}>{label}</div>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [range, setRange] = useState('today');
  const q = useFetch('/dashboard/admin', { range });
  const trend = useFetch('/analytics', { period: 'month' });

  return (
    <>
      <div className="between wrap">
        <div><div className="sub">Super Admin dashboard</div><h1 className="h1">{greeting()}, {user.name.split(' ').slice(0, 2).join(' ')}</h1></div>
        <Pills value={range} onChange={setRange} options={[{ key: 'today', label: 'Today' }, { key: '7d', label: '7 days' }, { key: '30d', label: '30 days' }]} />
      </div>
      <Async q={q} rows={6}>{(d) => (
        <>
          <div className="grid g4">
            <Card tone="night" className="span2 stack" style={{ position: 'relative', overflow: 'hidden', gap: 14 }}>
              <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'var(--night2)', right: -60, top: -80 }} />
              <div className="between" style={{ position: 'relative' }}>
                <span className="cap" style={{ color: 'var(--night-muted)' }}>Inventory valuation</span>
                <span className={`chip ${d.valuation.changePct >= 0 ? 'c-solid-mint' : 'c-coral'}`}>{d.valuation.changePct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{Math.abs(d.valuation.changePct)}% vs 30 d</span>
              </div>
              <div className="num" style={{ fontSize: 44, lineHeight: 1, position: 'relative' }}>{inr(d.valuation.value)}</div>
              <div role="img" aria-label="Weekly inventory valuation, last 12 weeks" style={{ position: 'relative' }}><Spark values={d.valuation.spark} /></div>
              <div className="grid g3" style={{ gap: 8, position: 'relative' }}>
                {[[d.valuation.totalSkus, 'Total SKUs'], [d.valuation.activeSkus, 'Active'], [num(d.valuation.units), 'Units in stock']].map(([v, l]) => (
                  <div key={l}><div className="num" style={{ fontSize: 22 }}>{v}</div><div style={{ fontSize: 12, color: 'var(--night-muted)' }}>{l}</div></div>
                ))}
              </div>
            </Card>
            <Kpi tone="cobalt" icon={Truck} value={inr(d.period.purchases.value)} label={`Purchases · ${d.period.purchases.n} GRN${d.period.purchases.n === 1 ? '' : 's'} · ${RANGE[range].toLowerCase()}`} onClick={() => nav('/orders')} />
            <Kpi tone="mint" icon={Pill} value={`${num(d.period.dispensed.units)} units`} label={`Dispensed · ${d.period.dispensed.rx} Rx`} />
            <Kpi icon={Receipt} value={inr(d.period.sales.value)} label={`Sales · ${d.period.sales.n} invoices`} onClick={() => nav('/invoices')} />
            <Kpi tone="amber" icon={Undo2} value={d.period.returns.n} label={`Returns · ${inr(d.period.returns.value)}`} />
            <Card tone="coral" className="span2 stack" style={{ gap: 12 }} onClick={() => nav('/discrepancies')}>
              <div className="between"><span className="cap" style={{ color: '#FFE8E2' }}>Losses · this month</span><span className="row" style={{ gap: 4, fontWeight: 700, fontSize: 13 }}>Investigate <ArrowUpRight size={15} /></span></div>
              <div className="num" style={{ fontSize: 36, lineHeight: 1 }}>{inr(d.losses.total)}</div>
              <div className="grid g2" style={{ gap: 10 }}>
                <div style={{ background: 'rgba(255,255,255,.16)', borderRadius: 14, padding: '10px 12px' }}><div className="num" style={{ fontSize: 18 }}>{inr(d.losses.approved)}</div><div style={{ fontSize: 12 }}>Approved write-offs</div></div>
                <div style={{ background: '#fff', color: 'var(--ink)', borderRadius: 14, padding: '10px 12px' }}><div className="num" style={{ fontSize: 18, color: 'var(--coral-t)' }}>{inr(d.losses.unexplained)}</div><div style={{ fontSize: 12 }}>Unexplained</div></div>
              </div>
            </Card>
          </div>

          <div className="grid g4">
            <Card className="span2">
              <SecHead title="Spend vs sales" right={<Legend items={[['Expenditure', SERIES[0]], ['Sales', SERIES[3]]]} />} />
              <GroupedBars data={d.spendVsSales} keys={[['spend', 'Expenditure', SERIES[0]], ['sales', 'Sales', SERIES[3]]]} />
            </Card>
            <Card className="span2">
              <Async q={trend} rows={2}>{(t) => (
                <>
                  <SecHead title="Daily sales · this month" right={<span className={`chip ${t.sales.changePct >= 0 ? 'c-mint' : 'c-coral'}`}>{t.sales.changePct >= 0 ? '+' : '−'}{Math.abs(t.sales.changePct)}% vs prior period</span>} />
                  <TrendArea data={t.sales.daily.map((x) => ({ x: x.date, sales: x.sales }))} dataKey="sales" name="Sales" xFmt={(v) => date(v)} />
                </>
              )}</Async>
            </Card>
          </div>

          <div className="grid g4">
            <Card pad0 className="span2">
              <div style={{ padding: '18px 20px 0' }}><SecHead title="Stock health" action="Open alerts" onAction={() => nav('/alerts')} /></div>
              <div className="grid g4" style={{ gap: 0 }}>
                {[[d.stockHealth.low, 'Low stock', 'var(--amber-t)'], [d.stockHealth.out, 'Out of stock', 'var(--coral-t)'], [d.stockHealth.expired, 'Expired', 'var(--coral-t)'], [d.stockHealth.quarantine, 'Quarantine', 'var(--violet-t)']].map(([v, l, c], i) => (
                  <button key={l} type="button" onClick={() => nav('/alerts')} style={{ textAlign: 'left', border: 0, background: 'none', cursor: 'pointer', padding: '14px 20px', borderRight: i < 3 ? '1px solid var(--line2)' : 0 }}>
                    <div className="num" style={{ fontSize: 30, color: c }}>{v}</div><div className="sub" style={{ fontWeight: 600 }}>{l}</div>
                  </button>
                ))}
              </div>
              <div style={{ padding: '16px 20px 20px', borderTop: '1px solid var(--line2)' }} className="stack">
                <div className="between"><span className="h3">Expiring batches</span><span className="sub">{d.stockHealth.expiring.count} batches · {inr(d.stockHealth.expiring.value)}</span></div>
                <StackedSegments parts={d.stockHealth.expiring.buckets.map((b, i) => ({ label: `≤ ${b.days} days`, value: b.count, color: ['#E8452A', '#D98A00', '#2747F5', '#A9B6FF'][i] }))} />
                <div className="grid g4" style={{ gap: 8 }}>
                  {d.stockHealth.expiring.buckets.map((b, i) => (
                    <div key={b.days} className="row" style={{ gap: 8 }}><span className="dot" style={{ background: ['#E8452A', '#D98A00', '#2747F5', '#A9B6FF'][i], borderRadius: 2 }} /><div><b className="num" style={{ fontSize: 17 }}>{b.count}</b><div className="sub" style={{ fontSize: 12 }}>≤ {b.days} days</div></div></div>
                  ))}
                </div>
              </div>
            </Card>
            <Card pad0 className="span2">
              <div style={{ padding: '18px 20px 0' }}><SecHead title="Needs your approval" action={`See all ${d.approvals.count}`} onAction={() => nav('/approvals')} /></div>
              <div className="list">
                {d.approvals.top.map((a) => {
                  const [tone, Icon] = APPROVAL_META[a.type];
                  return (
                    <div key={a.id} className="li click" onClick={() => nav(`/approvals?open=${a.id}`)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && nav(`/approvals?open=${a.id}`)}>
                      <Tile tone={tone} icon={Icon} />
                      <div className="grow"><div className="h3">{a.title} · {a.type === 'adjustment' ? `${a.qtyChange > 0 ? '+' : '−'}${Math.abs(a.qtyChange)} units` : inr(Math.abs(a.valueImpact))}</div><div className="meta ell">{a.subtitle} · by {a.maker.name}</div></div>
                      <Chip tone={tone}>Review</Chip>
                    </div>
                  );
                })}
                {!d.approvals.top.length ? <div className="li sub">Nothing waiting.</div> : null}
              </div>
            </Card>
          </div>

          <div className="grid g3">
            <Card>
              <SecHead title="Discrepancy alerts" action="Report" onAction={() => nav('/discrepancies')} />
              <div className="stack" style={{ gap: 12 }}>
                {d.signals.map((s, i) => (
                  <div key={i} className="row" style={{ alignItems: 'flex-start' }}><span className="dot" style={{ background: SIGNAL[s.severity], marginTop: 6 }} /><div className="grow"><div className="h3">{s.title}</div><div className="sub">{s.detail}</div></div></div>
                ))}
                {!d.signals.length ? <span className="sub">No unusual patterns detected.</span> : null}
              </div>
            </Card>
            <Card pad0>
              <div style={{ padding: '18px 20px 0' }}><SecHead title="Staff activity · today" action="Directory" onAction={() => nav('/staff')} /></div>
              <div className="list">
                {d.staffActivity.map((s) => (
                  <div key={s.id} className="li">
                    <Avatar name={s.name} bg={s.avatarBg} fg={s.avatarFg} size="sm" />
                    <div className="grow"><div className="h3">{s.name}</div><div className="meta">{s.role === 'inventory_manager' ? `Inventory · ${s.grns} GRN received` : `Dispensing · ${s.rx} Rx${s.adjustments ? ` · ${s.adjustments} adjustments` : ''}`}</div></div>
                    {s.flagged ? <Chip tone="amber">Flag</Chip> : <div className="right"><b className="num">{s.role === 'inventory_manager' ? s.units_in : s.units}</b><div className="meta">{s.role === 'inventory_manager' ? 'units in' : 'units'}</div></div>}
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <SecHead title="Suppliers" action="All" onAction={() => nav('/suppliers')} />
              <div className="between" style={{ marginBottom: 12 }}><span className="sub">Open purchase orders</span><b className="num">{d.suppliers.openPos} · {inr(d.suppliers.openValue)}</b></div>
              <div className="stack" style={{ gap: 12 }}>
                {d.suppliers.list.slice(0, 5).map((s) => (
                  <div key={s.id} className="col" style={{ gap: 6 }}>
                    <div className="between" style={{ fontSize: 13 }}><span className="ell">{s.name}</span><b style={{ color: s.onTimePct < 75 ? 'var(--coral-t)' : 'var(--ink)' }}>{s.onTimePct}%</b></div>
                    <Bar thin value={s.onTimePct} color={s.onTimePct >= 95 ? 'var(--mint)' : s.onTimePct >= 80 ? 'var(--cobalt)' : 'var(--coral)'} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid g3">
            {[['Fast movers · 30 days', TrendingUp, 'var(--mint-t)', d.fastMovers], ['Slow movers · 30 days', TrendingDown, 'var(--coral-t)', d.slowMovers]].map(([t, Icon, c, list]) => (
              <Card key={t}>
                <div className="row" style={{ gap: 6, marginBottom: 12 }}><Icon size={16} color={c} /><span className="cap">{t}</span></div>
                <div className="stack" style={{ gap: 10 }}>
                  {list.map((p) => {
                    const max = Math.max(...d.fastMovers.map((x) => x.units), 1);
                    return (
                      <div key={p.id} className="col" style={{ gap: 5 }}>
                        <div className="between" style={{ fontSize: 13 }}><span className="ell">{p.name}</span><b className="num">{p.units}</b></div>
                        <Bar thin value={(p.units / max) * 100} color={c} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
            <Card>
              <Async q={trend} rows={2}>{(t) => (
                <>
                  <SecHead title="Spend by category" />
                  <div role="img" aria-label={t.spendByType.map((s) => `${TYPE_LABEL[s.type]} ${s.pct}%`).join(', ')}><Donut data={t.spendByType.map((s) => ({ name: TYPE_LABEL[s.type] || s.type, value: s.value }))} height={170} /></div>
                  <div className="stack" style={{ gap: 6, marginTop: 8 }}>
                    {t.spendByType.map((s, i) => <div key={s.type} className="between" style={{ fontSize: 12.5 }}><span className="row" style={{ gap: 8 }}><span className="dot" style={{ background: SERIES[i % SERIES.length], borderRadius: 2 }} />{TYPE_LABEL[s.type] || s.type}</span><b>{inr(s.value)} · {s.pct}%</b></div>)}
                  </div>
                </>
              )}</Async>
            </Card>
          </div>
        </>
      )}</Async>
    </>
  );
}
