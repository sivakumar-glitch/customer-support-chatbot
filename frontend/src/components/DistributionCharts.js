import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';

const card = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  border: '1px solid #2a2a3e',
  borderRadius: '16px',
  padding: '24px',
};

const title = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#e8e8f0',
  marginBottom: '20px',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: '#1e1e2e',
        border: '1px solid #3a3a5c',
        borderRadius: '10px',
        padding: '12px 16px',
        fontSize: '13px',
      }}>
        <div style={{ fontWeight: '700', marginBottom: '4px', color: payload[0].fill }}>
          {CATEGORY_ICONS[d.category] || '📌'} {d.category}
        </div>
        <div style={{ color: '#9ca3af' }}>{d.count} queries — <strong style={{ color: '#e8e8f0' }}>{d.percentage}%</strong></div>
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1e1e2e',
        border: '1px solid #3a3a5c',
        borderRadius: '10px',
        padding: '12px 16px',
        fontSize: '13px',
        maxWidth: '220px',
      }}>
        <div style={{ fontWeight: '700', color: '#e8e8f0', marginBottom: '6px' }}>
          {CATEGORY_ICONS[label] || '📌'} {label}
        </div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ color: '#9ca3af', marginBottom: '2px' }}>
            {p.dataKey}: <strong style={{ color: p.fill }}>{p.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) {
  if (percentage < 4) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize="11" fontWeight="700">
      {`${percentage}%`}
    </text>
  );
}

export default function DistributionCharts({ distribution }) {
  if (!distribution || distribution.length === 0) return null;

  const pieData = distribution.filter(d => d.count > 0);
  const barData = distribution.filter(d => d.count > 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
      {/* Pie Chart */}
      <div style={card}>
        <div style={title}>📊 Issue Distribution (% of Total Queries)</div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="percentage"
              nameKey="category"
              cx="50%" cy="50%"
              outerRadius={110}
              innerRadius={50}
              labelLine={false}
              label={renderCustomLabel}
            >
              {pieData.map((entry) => (
                <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#6366f1'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
          {pieData.map(d => (
            <div key={d.category} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: CATEGORY_COLORS[d.category], flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', flex: 1 }}>{d.category}</span>
              <span style={{ fontWeight: '700', color: '#e8e8f0' }}>{d.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div style={card}>
        <div style={title}>📈 Query Volume by Category</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="category"
              width={140}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${CATEGORY_ICONS[v] || ''} ${v.length > 18 ? v.slice(0, 16) + '…' : v}`}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {barData.map((entry) => (
                <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
