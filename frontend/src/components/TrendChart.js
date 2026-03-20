import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';

const CATEGORIES = [
  'Order Tracking', 'Delivery Delay', 'Refund Request',
  'Product Issue', 'Subscription Issue', 'Payment Failure',
  'General Product Question'
];

const TrendTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1e1e2e', border: '1px solid #3a3a5c',
        borderRadius: '10px', padding: '12px 16px', fontSize: '12px'
      }}>
        <div style={{ fontWeight: '700', color: '#e8e8f0', marginBottom: '8px' }}>{label}</div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ color: '#9ca3af', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span>{CATEGORY_ICONS[p.dataKey] || ''} {p.dataKey}</span>
            <strong style={{ color: p.stroke }}>{p.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrendChart({ weeks }) {
  if (!weeks || weeks.length === 0) return null;

  const activeCategories = CATEGORIES.filter(cat =>
    weeks.some(w => (w[cat] || 0) > 0)
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      border: '1px solid #2a2a3e', borderRadius: '16px',
      padding: '24px', marginBottom: '24px',
    }}>
      <div style={{ fontSize: '15px', fontWeight: '700', color: '#e8e8f0', marginBottom: '20px' }}>
        📅 Weekly Query Trends by Category
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={weeks} margin={{ left: 0, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
          <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<TrendTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#9ca3af', paddingTop: '12px' }}
            formatter={(value) => `${CATEGORY_ICONS[value] || ''} ${value}`}
          />
          {activeCategories.map(cat => (
            <Line
              key={cat}
              type="monotone"
              dataKey={cat}
              stroke={CATEGORY_COLORS[cat]}
              strokeWidth={2}
              dot={{ r: 4, fill: CATEGORY_COLORS[cat], strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
