import React from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const LANG_COLORS = ['#00d4ff','#7c3aed','#10b981','#f59e0b','#ef4444','#ec4899','#3b82f6','#84cc16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontFamily: 'var(--mono)' }}>
      {label && <div style={{ color: 'var(--text2)', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => <div key={i} style={{ color: p.color || 'var(--accent)' }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

// Wrapper fixes the Recharts mobile glitch — explicit height div prevents collapse
const ChartWrap = ({ height = 160, children }) => (
  <div style={{ width: '100%', height }}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);

export function CommitChart({ data }) {
  return (
    <ChartWrap height={160}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <defs>
          <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text3)', fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false}
          tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="commits" stroke="#00d4ff" strokeWidth={2} fill="url(#commitGrad)" name="Commits" />
      </AreaChart>
    </ChartWrap>
  );
}

export function LanguageChart({ data }) {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ width: 130, height: 130, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={36} outerRadius={58} dataKey="percentage" paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((lang, i) => (
          <div key={lang.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: LANG_COLORS[i % LANG_COLORS.length], flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{lang.name}</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{lang.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContributorChart({ data }) {
  return (
    <ChartWrap height={160}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 20, left: -20 }} barSize={18}>
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text3)', fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="commits" name="Commits" radius={[4,4,0,0]}>
          {data.map((_, i) => <Cell key={i} fill={`hsl(${190 + i * 20}, 80%, 55%)`} />)}
        </Bar>
      </BarChart>
    </ChartWrap>
  );
}
