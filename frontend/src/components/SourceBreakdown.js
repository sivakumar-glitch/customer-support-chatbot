import React from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { SOURCE_COLORS, SOURCE_LABELS, CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';

export default function SourceBreakdown({ sources }) {
  if (!sources || sources.length === 0) return null;

  const sourceBar = sources.map(s => ({
    name: SOURCE_LABELS[s.source] || s.source,
    total: s.total,
    color: SOURCE_COLORS[s.source] || '#6366f1',
  }));

  const SourceTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const src = sources.find(s => (SOURCE_LABELS[s.source] || s.source) === label);
      return (
        <div style={{
          background: '#1e1e2e', border: '1px solid #3a3a5c',
          borderRadius: '10px', padding: '12px 16px', fontSize: '12px'
        }}>
          <div style={{ fontWeight: '700', color: '#e8e8f0', marginBottom: '6px' }}>{label}</div>
          <div style={{ color: '#9ca3af' }}>Total: <strong style={{ color: '#e8e8f0' }}>{payload[0].value}</strong></div>
          {src && (
            <div style={{ marginTop: '6px' }}>
              {Object.entries(src.categories).slice(0, 4).map(([cat, cnt]) => (
                <div key={cat} style={{ color: '#6b7280', marginBottom: '2px' }}>
                  {CATEGORY_ICONS[cat]} {cat}: <strong style={{ color: CATEGORY_COLORS[cat] }}>{cnt}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      border: '1px solid #2a2a3e', borderRadius: '16px',
      padding: '24px', marginBottom: '24px',
    }}>
      <div style={{ fontSize: '15px', fontWeight: '700', color: '#e8e8f0', marginBottom: '20px' }}>
        📱 Queries by Platform / Source
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sourceBar}>
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<SourceTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {sourceBar.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sources.map(s => {
            const topCat = Object.entries(s.categories).sort((a, b) => b[1] - a[1])[0];
            return (
              <div key={s.source} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3e',
                borderRadius: '10px', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: SOURCE_COLORS[s.source] || '#6366f1', flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#e8e8f0' }}>
                    {SOURCE_LABELS[s.source] || s.source}
                  </div>
                  {topCat && (
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                      Top: {CATEGORY_ICONS[topCat[0]]} {topCat[0]}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: SOURCE_COLORS[s.source] || '#6366f1' }}>
                  {s.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
