import React from 'react';
import { CATEGORY_COLORS, CATEGORY_ICONS, PRIORITY_COLORS } from '../constants';

export default function AutomationOpportunities({ opportunities }) {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      border: '1px solid #2a2a3e', borderRadius: '16px',
      padding: '24px', marginBottom: '24px',
    }}>
      <div style={{ fontSize: '15px', fontWeight: '700', color: '#e8e8f0', marginBottom: '4px' }}>
        🚀 Automation Opportunities
      </div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>
        AI-driven solutions ranked by query volume impact
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
        {opportunities.map(opp => (
          <div key={opp.category} style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${CATEGORY_COLORS[opp.category] || '#2a2a3e'}40`,
            borderLeft: `3px solid ${CATEGORY_COLORS[opp.category] || '#6366f1'}`,
            borderRadius: '12px', padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#e8e8f0' }}>
                {CATEGORY_ICONS[opp.category]} {opp.category}
              </div>
              <span style={{
                fontSize: '11px', fontWeight: '700', padding: '2px 8px',
                borderRadius: '20px', background: `${PRIORITY_COLORS[opp.priority]}22`,
                color: PRIORITY_COLORS[opp.priority],
                border: `1px solid ${PRIORITY_COLORS[opp.priority]}44`,
              }}>{opp.priority}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: CATEGORY_COLORS[opp.category] }}>
                  {opp.current_volume_pct}%
                </div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>of queries</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#22c55e' }}>
                  {opp.estimated_reduction}%
                </div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>auto-solvable</div>
              </div>
            </div>

            <div style={{
              fontSize: '11px', fontWeight: '600', color: '#a78bfa',
              textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px'
            }}>
              {opp.automation_type}
            </div>
            <div style={{ fontSize: '12px', color: '#97a1b3', lineHeight: '1.5' }}>
              {opp.solution}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
