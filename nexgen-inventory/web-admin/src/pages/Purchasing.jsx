import React, { useState } from 'react';
import { Plus, Phone, Snowflake, Trash2, Truck } from 'lucide-react';
import { Async, Avatar, Banner, Bar, Btn, Card, Chip, Drawer, Empty, Field, KV, Modal, Pills } from '../components/ui';
import { date, dateTime, inr, inrShort, useAction, useFetch } from '../lib';
import api from '../api';

const STATUS = { approval: ['amber', 'Awaiting approval'], draft: ['gray', 'Draft'], ordered: ['cobalt', 'Ordered'], on_the_way: ['mint', 'On the way'], received: ['mint', 'Received'], closed: ['gray', 'Closed'], rejected: ['coral', 'Rejected'], cancelled: ['gray', 'Cancelled'] };

function NewOrder({ onClose, onSaved }) {
  const suppliers = useFetch('/suppliers');
  const products = useFetch('/products');
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([]);
  const [pick, setPick] = useState('');
  const [busy, run] = useAction();
  const add = () => {
    const p = products.data.items.find((x) => x.id === Number(pick));
    if (p && !items.find((i) => i.productId === p.id)) setItems([...items, { productId: p.id, name: p.name, unit: p.unit, qty: p.reorderQty, unitPrice: p.purchasePrice }]);
    if (p && !supplierId && p.preferredSupplierId) setSupplierId(String(p.preferredSupplierId));
    setPick('');
  };
  const total = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const save = (submit) => run(async () => { await api.post('/purchase-orders', { supplierId: Number(supplierId), items, submit }); onSaved(); onClose(); }, submit ? 'Order placed' : 'Draft saved');
  return (
    <Modal title="New purchase order" onClose={onClose} footer={<><Btn tone="ghost" disabled={busy || !supplierId || !items.length} onClick={() => save(false)}>Save draft</Btn><Btn disabled={busy || !supplierId || !items.length} onClick={() => save(true)}>Place order · {inr(total)}</Btn></>}>
      <Field label="Supplier"><select className="input" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}><option value="">Choose…</option>{(suppliers.data ? suppliers.data.items : []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
      <div className="row"><select className="input grow" value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Add product"><option value="">Add a product…</option>{(products.data ? products.data.items : []).map((p) => <option key={p.id} value={p.id}>{p.name} · {p.stock} in stock</option>)}</select><Btn icon={Plus} disabled={!pick} onClick={add}>Add</Btn></div>
      {items.map((i, k) => (
        <div key={i.productId} className="row">
          <div className="grow"><div className="h3">{i.name}</div><div className="sub">{inr(i.unitPrice, 2)} / {i.unit}</div></div>
          <input className="input" style={{ width: 90 }} type="number" min="1" value={i.qty} onChange={(e) => setItems(items.map((x, j) => (j === k ? { ...x, qty: Number(e.target.value) } : x)))} aria-label={`Quantity of ${i.name}`} />
          <button type="button" className="iconbtn" aria-label={`Remove ${i.name}`} onClick={() => setItems(items.filter((_, j) => j !== k))}><Trash2 size={16} /></button>
        </div>
      ))}
      <div className="between"><span className="h3">Total</span><b className="num" style={{ fontSize: 22 }}>{inr(total)}</b></div>
    </Modal>
  );
}

export function Orders() {
  const [tab, setTab] = useState('open');
  const q = useFetch('/purchase-orders', { tab });
  const [open, setOpen] = useState(null);
  const [creating, setCreating] = useState(false);
  const detail = useFetch(open ? `/purchase-orders/${open}` : null);
  const [busy, run] = useAction();
  const c = (q.data && q.data.counts) || {};
  const act = (fn, msg) => run(async () => { await fn(); q.reload(); detail.reload(); }, msg);
  return (
    <>
      <div className="between wrap">
        <div><h1 className="h1">Purchase orders</h1><div className="sub">{q.data ? `${c.open} open · ${inr(q.data.openValue)}` : ' '}</div></div>
        <Btn icon={Plus} onClick={() => setCreating(true)}>New order</Btn>
      </div>
      <Pills value={tab} onChange={setTab} options={[{ key: 'open', label: 'Open', n: c.open }, { key: 'approval', label: 'Approval', n: c.approval }, { key: 'draft', label: 'Draft', n: c.draft }, { key: 'closed', label: 'Closed', n: c.closed }]} />
      <Async q={q}>{(d) => (d.items.length ? (
        <Card pad0 className="table-wrap"><table className="t">
          <thead><tr><th>PO</th><th>Supplier</th><th>Lines</th><th>Placed</th><th>ETA</th><th className="num">Total</th><th>Status</th></tr></thead>
          <tbody>{d.items.map((po) => (
            <tr key={po.id} className="click" onClick={() => setOpen(po.id)}>
              <td className="h3">{po.poNo}</td><td>{po.supplier.name}{po.supplier.coldChain ? <Snowflake size={13} color="var(--cobalt)" style={{ marginLeft: 6 }} /> : null}</td><td className="ell" style={{ maxWidth: 220 }}>{po.summary}</td>
              <td>{date(po.placedAt || po.createdAt)}</td><td>{po.etaState ? <Chip tone={po.etaState.tone === 'late' ? 'coral' : po.etaState.tone === 'today' ? 'mint' : 'cobalt'}>{po.etaState.label}</Chip> : date(po.eta)}</td>
              <td className="num">{inr(po.total)}</td><td><Chip tone={STATUS[po.status][0]}>{STATUS[po.status][1]}</Chip></td>
            </tr>
          ))}</tbody>
        </table></Card>
      ) : <Empty title="No orders here" />)}</Async>
      {open ? (
        <Drawer title={detail.data ? detail.data.poNo : 'Order'} subtitle={detail.data ? detail.data.supplier.name : ''} onClose={() => setOpen(null)}
          footer={detail.data ? (
            <>
              {detail.data.status === 'draft' ? <Btn disabled={busy} onClick={() => act(() => api.post(`/purchase-orders/${open}/submit`), 'Order submitted')}>Submit order</Btn> : null}
              {['ordered', 'on_the_way'].includes(detail.data.status) ? <Btn tone="soft" disabled={busy} onClick={() => act(() => api.patch(`/purchase-orders/${open}`, { status: 'on_the_way' }), 'Marked on the way')}>Mark on the way</Btn> : null}
              {['draft', 'ordered'].includes(detail.data.status) ? <Btn tone="danger" disabled={busy} onClick={() => act(() => api.patch(`/purchase-orders/${open}`, { status: 'cancelled' }), 'Order cancelled')}>Cancel order</Btn> : null}
            </>
          ) : null}>
          <Async q={detail}>{(po) => (
            <>
              <Card><KV k="Status" v={STATUS[po.status][1]} /><KV k="Total" v={inr(po.total)} /><KV k="Placed" v={po.placedAt ? dateTime(po.placedAt) : '—'} /><KV k="ETA" v={po.eta ? date(po.eta, { year: 'numeric' }) : '—'} /><KV k="Raised by" v={po.creator ? po.creator.name : '—'} />{po.notes ? <KV k="Notes" v={po.notes} /> : null}</Card>
              <Card pad0><table className="t"><thead><tr><th>Item</th><th className="num">Ordered</th><th className="num">Received</th><th className="num">Rate</th></tr></thead>
                <tbody>{po.items.map((i) => <tr key={i.id}><td>{i.product.name}</td><td className="num">{i.qty}</td><td className="num">{i.receivedQty}</td><td className="num">{inr(i.unitPrice, 2)}</td></tr>)}</tbody></table></Card>
              {po.grns.length ? <Card>{po.grns.map((g) => <KV key={g.id} k={g.grnNo} v={`${g.status} · ${inr(g.receivedValue)}`} />)}</Card> : null}
              {['ordered', 'on_the_way'].includes(po.status) ? <Banner icon={Truck}>Goods are received against this PO from the Inventory Manager app (Receive tab).</Banner> : null}
              {po.supplier.phone ? <Btn tone="ghost" icon={Phone} onClick={() => { window.location.href = `tel:${po.supplier.phone.replace(/\s/g, '')}`; }}>Call {po.supplier.name}</Btn> : null}
            </>
          )}</Async>
        </Drawer>
      ) : null}
      {creating ? <NewOrder onClose={() => setCreating(false)} onSaved={q.reload} /> : null}
    </>
  );
}

export function Suppliers() {
  const q = useFetch('/suppliers');
  const [form, setForm] = useState(null);
  const [busy, run] = useAction();
  const RATING = { Top: 'mint', Good: 'cobalt', Watch: 'amber', 'At risk': 'coral' };
  const save = () => run(async () => { if (form.id) await api.put(`/suppliers/${form.id}`, form); else await api.post('/suppliers', form); setForm(null); q.reload(); }, 'Supplier saved');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <>
      <div className="between wrap"><div><h1 className="h1">Suppliers</h1><div className="sub">Ranked by on-time delivery</div></div><Btn icon={Plus} onClick={() => setForm({ name: '', city: '', categories: '', contactName: '', phone: '', email: '', gstin: '' })}>Add supplier</Btn></div>
      <Async q={q}>{(d) => (
        <>
          {d.insight ? <Banner tone="amber">{d.insight}</Banner> : null}
          <div className="grid g3">
            {d.items.map((s) => (
              <Card key={s.id} className="stack click" onClick={() => setForm(s)}>
                <div className="row"><Avatar initials={s.code || s.name.slice(0, 2).toUpperCase()} bg="var(--line2)" fg="var(--ink2)" /><div className="grow"><div className="h3">{s.name}</div><div className="sub ell">{s.city} · {s.categories}</div></div><Chip tone={RATING[s.rating]}>{s.rating}</Chip></div>
                <div className="grid g4" style={{ gap: 6 }}>
                  {[[`${s.onTimePct}%`, 'On time'], [`${s.fillRatePct}%`, 'Fill rate'], [`${s.leadDays}d`, 'Lead'], [inrShort(s.openValue), `${s.openPos} open`]].map(([v, l]) => <div key={l}><div className="num" style={{ fontSize: 17 }}>{v}</div><div className="sub" style={{ fontSize: 11.5 }}>{l}</div></div>)}
                </div>
                <Bar thin value={s.onTimePct} color={s.onTimePct >= 95 ? 'var(--mint)' : s.onTimePct >= 80 ? 'var(--cobalt)' : 'var(--coral)'} />
              </Card>
            ))}
          </div>
        </>
      )}</Async>
      {form ? (
        <Modal title={form.id ? 'Edit supplier' : 'New supplier'} onClose={() => setForm(null)} footer={<Btn disabled={busy || !form.name} onClick={save}>Save</Btn>}>
          <Field label="Name"><input className="input" value={form.name} onChange={set('name')} /></Field>
          <div className="grid g2" style={{ gap: 12 }}>
            <Field label="City"><input className="input" value={form.city || ''} onChange={set('city')} /></Field>
            <Field label="Contact"><input className="input" value={form.contactName || ''} onChange={set('contactName')} /></Field>
            <Field label="Phone"><input className="input" value={form.phone || ''} onChange={set('phone')} /></Field>
            <Field label="Email"><input className="input" value={form.email || ''} onChange={set('email')} /></Field>
            <Field label="GSTIN"><input className="input" value={form.gstin || ''} onChange={set('gstin')} /></Field>
            <Field label="Supplies"><input className="input" value={form.categories || ''} onChange={set('categories')} /></Field>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
