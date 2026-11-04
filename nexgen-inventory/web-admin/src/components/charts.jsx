import React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { inr, inrShort } from '../lib';

// Categorical order validated with the dataviz palette checker (light surface).
export const SERIES = ['#2747F5', '#D98A00', '#7A4DFF', '#0FA884', '#E8452A'];
const AXIS = { fontSize: 11.5, fill: '#5D6785', fontFamily: 'Inter' };

function Tip({ active, payload, label, money = true, labelFmt }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: '#0A1633', color: '#fff', borderRadius: 12, padding: '10px 12px', fontSize: 12.5, boxShadow: '0 10px 30px -10px rgba(10,22,51,.5)' }}>
      <div style={{ color: '#AEB8D8', marginBottom: 4 }}>{labelFmt ? labelFmt(label) : label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color || p.payload.fill }} />
          <span>{p.name}</span><b style={{ marginLeft: 'auto', paddingLeft: 12 }}>{money ? inr(p.value) : p.value}</b>
        </div>
      ))}
    </div>
  );
}

export function Legend({ items }) {
  return (
    <div className="row wrap" style={{ gap: 14, fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>
      {items.map(([label, color]) => <span key={label} className="row" style={{ gap: 6 }}><span className="dot" style={{ background: color, borderRadius: 2 }} />{label}</span>)}
    </div>
  );
}

export function GroupedBars({ data, keys, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barGap={2} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke="#EEF1F7" />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={inrShort} width={64} />
        <Tooltip content={<Tip />} cursor={{ fill: 'rgba(39,71,245,.06)' }} />
        {keys.map(([k, name, color]) => <Bar key={k} dataKey={k} name={name} fill={color} radius={[4, 4, 0, 0]} maxBarSize={28} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendArea({ data, dataKey, name, color = '#2747F5', height = 220, xFmt }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#EEF1F7" />
        <XAxis dataKey="x" tick={AXIS} axisLine={false} tickLine={false} tickFormatter={xFmt} minTickGap={24} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={inrShort} width={64} />
        <Tooltip content={<Tip labelFmt={xFmt} />} cursor={{ stroke: '#0A1633', strokeDasharray: '3 3' }} />
        <Area type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2} fill={`url(#g-${dataKey})`} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Spark({ values, height = 70 }) {
  const data = values.map((v, i) => ({ x: i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barCategoryGap="18%">
        <YAxis hide domain={[(min) => min * 0.92, 'auto']} />
        <Bar dataKey="v" radius={[5, 5, 2, 2]} isAnimationActive={false}>
          {data.map((d, i) => <Cell key={i} fill={i === data.length - 1 ? '#14C79A' : '#2747F5'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="#fff" strokeWidth={2}>
          {data.map((d, i) => <Cell key={d.name} fill={SERIES[i % SERIES.length]} />)}
        </Pie>
        <Tooltip content={<Tip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StackedSegments({ parts }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div className="bar seg" role="img" aria-label={parts.map((p) => `${p.label}: ${p.value}`).join(', ')}>
      {parts.filter((p) => p.value > 0).map((p) => <i key={p.label} title={`${p.label}: ${p.value}`} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />)}
    </div>
  );
}
