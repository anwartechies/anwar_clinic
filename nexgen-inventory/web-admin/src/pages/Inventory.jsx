import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Search, Snowflake, Trash2, Truck } from 'lucide-react';
import { Async, Banner, Btn, Card, Chip, Drawer, Empty, Field, KV, Modal, Pills, Toggle } from '../components/ui';
import { ago, date, dateTime, inr, inrShort, signed, useAction, useFetch } from '../lib';
import api from '../api';

const TYPES = [['medicine', 'Medicine'], ['consumable', 'Consumable'], ['prp', 'PRP / GFC'], ['instrument', 'Instrument'], ['ppe', 'PPE'], ['other', 'Other']];
const TYPE_LABEL = Object.fromEntries(TYPES);
const MOVE = { dispense: 'Dispensed', grn: 'Received', adjustment: 'Adjusted', return: 'Returned', wastage: 'Wastage', sale: 'Sold', sale_return: 'Sale return', write_off: 'Written off', reversal: 'Reversal' };

function ProductEditor({ id, onClose, onSaved }) {
  const existing = useFetch(id ? `/products/${id}` : null);
  const suppliers = useFetch('/suppliers');
  const [f, setF] = useState({ name: '', sku: '', barcode: '', type: 'medicine', category: '', unit: 'strip', packInfo: '', manufacturer: '', minLevel: 10, reorderQty: 30, purchasePrice: 0, sellingPrice: 0, gstRate: 12, rxRequired: false, coldChain: false, storage: '', location: '', preferredSupplierId: '' });
  const [busy, run] = useAction();
  useEffect(() => { if (existing.data) setF((x) => ({ ...x, ...Object.fromEntries(Object.entries(existing.data.product).map(([k, v]) => [k, v ?? ''])) })); }, [existing.data]);
  const set = (k) => (e) => setF({ ...f, [k]: e && e.target ? (e.target.type === 'number' ? Number(e.target.value) : e.target.value) : e });
  const save = () => run(async () => {
    const body = { ...f, preferredSupplierId: f.preferredSupplierId || null };
    if (id) await api.put(`/products/${id}`, body); else await api.post('/products', body);
    onSaved(); onClose();
  }, id ? 'Product updated' : 'Product created');
  const margin = Number(f.sellingPrice) - Number(f.purchasePrice);
  return (
    <Modal title={id ? 'Edit product' : 'New product'} onClose={onClose} footer={<><Btn tone="ghost" onClick={onClose}>Cancel</Btn><Btn disabled={busy || !f.name || !f.sku || f.minLevel < 1} onClick={save}>{id ? 'Save changes' : 'Create product'}</Btn></>}>
      <Field label="Product name"><input className="input" value={f.name} onChange={set('name')} /></Field>
      <div className="grid g2" style={{ gap: 12 }}>
        <Field label="SKU"><input className="input" value={f.sku} onChange={set('sku')} /></Field>
        <Field label="Barcode"><input className="input" value={f.barcode} onChange={set('barcode')} /></Field>
        <Field label="Type"><select className="input" value={f.type} onChange={set('type')}>{TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
        <Field label="Category"><input className="input" value={f.category} onChange={set('category')} /></Field>
        <Field label="Unit"><input className="input" value={f.unit} onChange={set('unit')} /></Field>
        <Field label="Pack"><input className="input" value={f.packInfo} onChange={set('packInfo')} /></Field>
        <Field label="Manufacturer"><input className="input" value={f.manufacturer} onChange={set('manufacturer')} /></Field>
        <Field label="Location"><input className="input" value={f.location} onChange={set('location')} /></Field>
        <Field label="Minimum level" help={f.minLevel < 1 ? 'Must be at least 1' : null}><input className="input" type="number" min="1" value={f.minLevel} onChange={set('minLevel')} /></Field>
        <Field label="Reorder qty"><input className="input" type="number" value={f.reorderQty} onChange={set('reorderQty')} /></Field>
        <Field label="Purchase price (₹)"><input className="input" type="number" step="0.01" value={f.purchasePrice} onChange={set('purchasePrice')} /></Field>
        <Field label="Selling price (₹)" help={`Margin ${inr(margin)} · ${f.sellingPrice ? Math.round((margin / f.sellingPrice) * 100) : 0}%`}><input className="input" type="number" step="0.01" value={f.sellingPrice} onChange={set('sellingPrice')} /></Field>
        <Field label="GST"><select className="input" value={f.gstRate} onChange={set('gstRate')}>{[5, 12, 18].map((g) => <option key={g} value={g}>{g}%</option>)}</select></Field>
        <Field label="Preferred supplier"><select className="input" value={f.preferredSupplierId} onChange={set('preferredSupplierId')}><option value="">—</option>{(suppliers.data ? suppliers.data.items : []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
      </div>
      <div className="between"><span className="h3">Prescription required</span><Toggle on={f.rxRequired} onChange={set('rxRequired')} label="Prescription required" /></div>
      <div className="between"><span className="h3">Cold chain (2–8 °C)</span><Toggle on={f.coldChain} onChange={set('coldChain')} label="Cold chain" /></div>
      <Field label="Storage instructions"><textarea className="input" value={f.storage} onChange={set('storage')} /></Field>
    </Modal>
  );
}

export function ProductDrawer({ id, onClose, onChanged }) {
  const q = useFetch(`/products/${id}`);
  const mv = useFetch(`/products/${id}/movements`);
  const [tab, setTab] = useState('batches');
  const [edit, setEdit] = useState(false);
  const [busy, run] = useAction();
  const toggleQuarantine = (b) => run(async () => {
    await api.patch(`/batches/${b.id}`, b.status === 'quarantined' ? { status: 'active', quarantineReason: null } : { status: 'quarantined', quarantineReason: 'Held for inspection' });
    q.reload(); if (onChanged) onChanged();
  }, b.status === 'quarantined' ? `${b.batchNo} released` : `${b.batchNo} quarantined`);
  const reorder = () => run(async () => {
    const p = q.data.product;
    const { data } = await api.post('/purchase-orders', { supplierId: p.preferredSupplierId, items: [{ productId: p.id, qty: p.reorderQty }], submit: true });
    return data;
  }, 'Purchase order placed');
  const p = q.data && q.data.product;
  return (
    <Drawer title={p ? p.name : 'Product'} subtitle={p ? `${p.sku} · ${p.packInfo || p.unit} · ${p.manufacturer || ''}` : ''} onClose={onClose}
      right={p ? <Btn tone="ghost" size="sm" icon={Pencil} onClick={() => setEdit(true)}>Edit</Btn> : null}
      footer={p && p.preferredSupplierId ? <Btn icon={Truck} block disabled={busy} onClick={reorder}>Reorder {p.reorderQty} {p.unit}s from preferred supplier</Btn> : null}>
      <Async q={q}>{(d) => (
        <>
          <div className="row wrap" style={{ gap: 6 }}><Chip tone="violet">{TYPE_LABEL[p.type]}</Chip>{p.rxRequired ? <Chip tone="coral">Rx required</Chip> : null}{p.coldChain ? <Chip tone="cobalt" icon={Snowflake}>Cold chain</Chip> : null}<Chip>{p.location}</Chip></div>
          <div className="grid g3" style={{ gap: 12 }}>
            <Card tone="night"><div className="num" style={{ fontSize: 26 }}>{d.stock}</div><div style={{ fontSize: 12, color: 'var(--night-muted)' }}>{p.unit}s usable</div></Card>
            <Card><div className="num" style={{ fontSize: 20 }}>{inr(d.valueAtCost)}</div><div className="sub">at cost</div></Card>
            <Card><div className="num" style={{ fontSize: 24 }}>{d.daysOfCover === null ? '—' : `${d.daysOfCover} d`}</div><div className="sub">cover</div></Card>
          </div>
          <Pills value={tab} onChange={setTab} options={[{ key: 'batches', label: `Batches · ${d.batches.length}` }, { key: 'movements', label: 'Movements' }, { key: 'details', label: 'Details' }]} />
          {tab === 'batches' && d.batches.map((b) => (
            <Card key={b.id} className="stack" style={{ gap: 6, ...(b.nextToDispense ? { boxShadow: 'inset 0 0 0 2px var(--mint)' } : {}), ...(b.status === 'quarantined' || b.expired ? { background: '#FFF5F2' } : {}) }}>
              <div className="between">
                <div className="row wrap" style={{ gap: 8 }}><b className="disp" style={{ fontSize: 15 }}>{b.batchNo}</b>{b.nextToDispense ? <Chip tone="mint">Next to dispense</Chip> : null}{b.status === 'quarantined' ? <Chip tone="coral">Quarantined</Chip> : null}{b.expired ? <Chip tone="coral">Expired</Chip> : null}</div>
                <b className="num" style={{ fontSize: 20 }}>{b.qty}</b>
              </div>
              <div className="sub" style={{ color: b.daysLeft <= 30 ? 'var(--coral-t)' : undefined }}>{b.status === 'quarantined' ? b.quarantineReason : `Exp ${date(b.expiryDate, { year: 'numeric' })} · ${b.daysLeft < 0 ? 'expired' : `${b.daysLeft} days`} · ${inr(b.costPrice, 2)} / ${p.unit}`}</div>
              <div className="between"><span className="sub" style={{ fontSize: 12 }}>Received {date(b.receivedAt, { year: 'numeric' })} · {b.supplier ? b.supplier.name : ''} · {b.location}</span>
                {!b.expired ? <button type="button" className="link" disabled={busy} onClick={() => toggleQuarantine(b)}>{b.status === 'quarantined' ? 'Release' : 'Quarantine'}</button> : null}</div>
            </Card>
          ))}
          {tab === 'movements' && (
            <Async q={mv}>{(rows) => (
              <Card pad0><table className="t"><thead><tr><th>When</th><th>Type</th><th>Batch</th><th className="num">Qty</th><th>By</th></tr></thead>
                <tbody>{rows.map((m) => <tr key={m.id}><td>{dateTime(m.createdAt)}</td><td>{MOVE[m.type]}{m.afterHours ? <Chip tone="amber" style={{ marginLeft: 6 }}>After hours</Chip> : null}</td><td>{m.batch ? m.batch.batchNo : ''}</td><td className="num" style={{ color: m.qty < 0 ? 'var(--coral-t)' : 'var(--mint-t)', fontWeight: 700 }}>{signed(m.qty)}</td><td>{m.user ? m.user.name : 'System'}</td></tr>)}</tbody>
              </table></Card>
            )}</Async>
          )}
          {tab === 'details' && (
            <Card>
              <KV k="Minimum level" v={`${p.minLevel} ${p.unit}s`} /><KV k="Reorder quantity" v={`${p.reorderQty} ${p.unit}s`} />
              <KV k="Purchase price" v={inr(p.purchasePrice, 2)} /><KV k="Selling price" v={`${inr(p.sellingPrice, 2)} + GST ${p.gstRate}%`} />
              <KV k="Preferred supplier" v={p.preferredSupplier ? p.preferredSupplier.name : '—'} /><KV k="Storage" v={p.storage || '—'} /><KV k="Barcode" v={p.barcode || '—'} />
            </Card>
          )}
        </>
      )}</Async>
      {edit ? <ProductEditor id={id} onClose={() => setEdit(false)} onSaved={() => { q.reload(); if (onChanged) onChanged(); }} /> : null}
    </Drawer>
  );
}

export default function Inventory() {
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const q = useFetch('/products', { type, search: search || undefined, stockStatus: stockStatus || undefined });
  const [open, setOpen] = useState(null);
  const [creating, setCreating] = useState(false);
  const c = (q.data && q.data.counts) || {};
  return (
    <>
      <div className="between wrap">
        <div><h1 className="h1">Catalogue</h1><div className="sub">{q.data ? `${c.all} products · ${inrShort(q.data.totalValue)} stock value at cost` : ' '}</div></div>
        <div className="row wrap">
          <label className="search"><Search size={18} /><input placeholder="Search name, SKU or barcode" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" /></label>
          <Btn icon={Plus} onClick={() => setCreating(true)}>New product</Btn>
        </div>
      </div>
      <div className="between wrap">
        <Pills value={type} onChange={setType} options={[{ key: 'all', label: 'All', n: c.all }, ...TYPES.filter(([k]) => c[k]).map(([k, l]) => ({ key: k, label: l, n: c[k] }))]} />
        <Pills value={stockStatus} onChange={setStockStatus} options={[{ key: '', label: 'Any stock' }, { key: 'low', label: 'Low' }, { key: 'out', label: 'Out' }]} />
      </div>
      <Async q={q}>{(d) => (d.items.length ? (
        <Card pad0 className="table-wrap">
          <table className="t">
            <thead><tr><th>Product</th><th>Type</th><th>Location</th><th className="num">Batches</th><th className="num">Min</th><th className="num">Stock</th><th className="num">Value</th><th className="num">Price</th></tr></thead>
            <tbody>
              {d.items.map((p) => (
                <tr key={p.id} className="click" onClick={() => setOpen(p.id)}>
                  <td><div className="h3">{p.name}{p.coldChain ? <Snowflake size={13} color="var(--cobalt)" style={{ marginLeft: 6 }} /> : null}</div><div className="sub" style={{ fontSize: 12 }}>{p.sku}{p.nearExpiryBatches ? ` · ${p.nearExpiryBatches} near expiry` : ''}</div></td>
                  <td><Chip tone={p.type === 'medicine' ? 'violet' : p.type === 'prp' ? 'coral' : p.type === 'ppe' ? 'mint' : 'cobalt'}>{TYPE_LABEL[p.type]}</Chip></td>
                  <td>{p.location}</td>
                  <td className="num">{p.batchCount}</td>
                  <td className="num">{p.minLevel}</td>
                  <td className="num">{p.stock === 0 ? <Chip tone="coral">Out</Chip> : <b style={{ color: p.stockStatus === 'low' ? 'var(--amber-t)' : undefined }}>{p.stock} <span className="sub">{p.unit}s</span></b>}</td>
                  <td className="num">{inr(p.value)}</td>
                  <td className="num">{inr(p.sellingPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : <Empty title="No products found" body="Try another search or filter." />)}</Async>
      {open ? <ProductDrawer id={open} onClose={() => setOpen(null)} onChanged={q.reload} /> : null}
      {creating ? <ProductEditor onClose={() => setCreating(false)} onSaved={q.reload} /> : null}
    </>
  );
}

export function Alerts() {
  const q = useFetch('/alerts');
  const [tab, setTab] = useState('exp');
  const [open, setOpen] = useState(null);
  const [busy, run] = useAction();
  const raiseAll = () => run(async () => { await api.post('/purchase-orders/from-low-stock', {}); q.reload(); }, 'Purchase requests raised');
  const writeOff = (ids) => run(async () => { await api.post('/write-offs', { batchIds: ids }); q.reload(); }, 'Write-off sent for approval');
  return (
    <>
      <div className="between wrap">
        <div><h1 className="h1">Stock alerts</h1><div className="sub">{q.data ? `Updated ${ago(q.data.updatedAt)} · auto-checks hourly` : ' '}</div></div>
        <Pills value={tab} onChange={setTab} options={[{ key: 'exp', label: 'Expiring', n: q.data && q.data.expiring.count }, { key: 'low', label: 'Low stock', n: q.data && q.data.low.count }, { key: 'dead', label: 'Expired', n: q.data && q.data.expired.count }]} />
      </div>
      <Async q={q}>{(d) => (
        <>
          {tab === 'exp' && (
            <div className="grid g2">
              {d.expiring.groups.filter((g) => g.count).map((g) => (
                <Card key={g.max} pad0>
                  <div className="between" style={{ padding: '16px 18px 8px' }}><span className="cap">{g.label} · {g.count}</span><b>{inr(g.value)}</b></div>
                  <div className="list">{g.items.map((e) => (
                    <div key={e.batchId} className="li click" onClick={() => setOpen(e.product.id)}>
                      <span className="tile" style={{ background: e.daysLeft <= 7 ? 'var(--coral-s)' : 'var(--amber-s)', color: e.daysLeft <= 7 ? 'var(--coral-t)' : 'var(--amber-t)', flexDirection: 'column', fontWeight: 800 }}><span className="num" style={{ fontSize: 16, lineHeight: 1 }}>{e.daysLeft}</span><span style={{ fontSize: 8 }}>DAYS</span></span>
                      <div className="grow"><div className="h3">{e.product.name}</div><div className="meta">{e.batchNo} · {e.qty} {e.product.unit}s · {e.location}</div></div>
                      {g.max <= 7 ? <Chip tone={e.action === 'Return' ? 'violet' : 'mint'}>{e.action}</Chip> : <span className="sub">{inr(e.value)}</span>}
                    </div>
                  ))}</div>
                </Card>
              ))}
            </div>
          )}
          {tab === 'low' && (
            <Card pad0>
              <table className="t"><thead><tr><th>Product</th><th className="num">Stock</th><th className="num">Minimum</th><th>On order</th><th>Status</th></tr></thead>
                <tbody>{d.low.items.map((l) => <tr key={l.product.id} className="click" onClick={() => setOpen(l.product.id)}><td className="h3">{l.product.name}</td><td className="num">{l.stock}</td><td className="num">{l.minLevel}</td><td>{l.openPo ? `${l.openPo.poNo} · ${l.openPo.status.replace('_', ' ')}` : '—'}</td><td><Chip tone={l.status === 'out' ? 'coral' : l.status === 'ordered' ? 'cobalt' : 'amber'}>{l.status === 'out' ? 'Out' : l.status === 'ordered' ? 'Ordered' : 'Low'}</Chip></td></tr>)}</tbody>
              </table>
              <div style={{ padding: 16 }}><Btn icon={Truck} disabled={busy || !d.low.items.some((l) => !l.openPo)} onClick={raiseAll}>Raise one request for all ({d.low.items.filter((l) => !l.openPo).length})</Btn></div>
            </Card>
          )}
          {tab === 'dead' && (
            <>
              <Banner tone="coral" icon={Trash2}>Expired batches are blocked from dispensing and sale automatically.</Banner>
              <Card pad0>
                <table className="t"><thead><tr><th>Product</th><th>Batch</th><th>Expired</th><th className="num">Qty</th><th className="num">Value</th><th>Status</th></tr></thead>
                  <tbody>{d.expired.items.map((e) => <tr key={e.batchId}><td className="h3">{e.product.name}</td><td>{e.batchNo}</td><td>{date(e.expiryDate)}</td><td className="num">{e.qty}</td><td className="num">{inr(e.value)}</td><td>{e.writeOffPending ? <Chip tone="amber">Write-off pending</Chip> : <Chip tone="coral">On shelf</Chip>}</td></tr>)}</tbody>
                </table>
                {d.expired.items.some((e) => !e.writeOffPending) ? <div style={{ padding: 16 }}><Btn tone="coral" icon={Trash2} disabled={busy} onClick={() => writeOff(d.expired.items.filter((e) => !e.writeOffPending).map((e) => e.batchId))}>Request write-off ({d.expired.items.filter((e) => !e.writeOffPending).length} batches)</Btn></div> : null}
              </Card>
            </>
          )}
        </>
      )}</Async>
      {open ? <ProductDrawer id={open} onClose={() => setOpen(null)} onChanged={q.reload} /> : null}
    </>
  );
}

export function Counts() {
  const q = useFetch('/stock-counts');
  const [open, setOpen] = useState(null);
  const rec = useFetch(open ? `/stock-counts/${open}/reconciliation` : null);
  const STATUS = { scheduled: ['cobalt', 'Scheduled'], in_progress: ['amber', 'Counting'], completed: ['violet', 'To reconcile'], submitted: ['mint', 'Submitted'] };
  return (
    <>
      <div><h1 className="h1">Stock counts</h1><div className="sub">Blind counts run from the Inventory Manager app · variances become approvals</div></div>
      <Async q={q}>{(rows) => (
        <Card pad0><table className="t"><thead><tr><th>Count</th><th>Area</th><th>Counters</th><th>Started</th><th>Status</th></tr></thead>
          <tbody>{rows.map((c) => <tr key={c.id} className="click" onClick={() => setOpen(c.id)}><td className="h3">{c.code}</td><td>{c.area}</td><td>{c.counter ? c.counter.name : ''}{c.secondCounter ? ` + ${c.secondCounter.name}` : ''}</td><td>{dateTime(c.startedAt || c.scheduledAt)}</td><td><Chip tone={STATUS[c.status][0]}>{STATUS[c.status][1]}</Chip></td></tr>)}</tbody>
        </table></Card>
      )}</Async>
      {open ? (
        <Drawer title="Reconciliation" subtitle={rec.data ? `${rec.data.count.code} · ${rec.data.count.area}` : ''} onClose={() => setOpen(null)}>
          <Async q={rec}>{(d) => (
            <>
              <Card tone={d.accuracy >= 98 ? 'mint' : d.accuracy >= 90 ? 'amber' : 'coral'}><div className="num" style={{ fontSize: 34 }}>{d.accuracy}%</div><div>Value accuracy · {d.matched} matched · {d.variances} variances · net {inr(d.netVariance)}</div></Card>
              <Card pad0><table className="t"><thead><tr><th>Item</th><th className="num">System</th><th className="num">Counted</th><th className="num">Var</th></tr></thead>
                <tbody>{d.lines.map((l) => <tr key={l.id}><td><div className="h3" style={{ fontSize: 13.5 }}>{l.product.name}</div><div className="sub" style={{ fontSize: 12 }}>{l.batch ? l.batch.batchNo : ''}</div></td><td className="num">{l.systemQty}</td><td className="num">{l.countedQty ?? '—'}</td><td className="num" style={{ fontWeight: 800, color: l.variance < 0 ? 'var(--coral-t)' : l.variance > 0 ? 'var(--mint-t)' : 'var(--muted)' }}>{l.countedQty === null ? '' : signed(l.variance)}</td></tr>)}</tbody>
              </table></Card>
            </>
          )}</Async>
        </Drawer>
      ) : null}
    </>
  );
}
