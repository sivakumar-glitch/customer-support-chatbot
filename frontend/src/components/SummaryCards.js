import React from 'react';

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  card: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    border: '1px solid #2a2a3e',
    borderRadius: '16px',
    padding: '20px 24px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  glow: {
    position: 'absolute',
    top: '-20px',
    right: '-20px',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    opacity: 0.15,
  },
  label: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  value: {
    fontSize: '32px',
    fontWeight: '800',
    lineHeight: 1,
    marginBottom: '6px',
  },
  sub: {
    fontSize: '12px',
    color: '#6b7280',
  },
};

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.glow, background: color }} />
      <div style={styles.label}>{icon} {label}</div>
      <div style={{ ...styles.value, color }}>{value}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
    </div>
  );
}

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  return (
    <div style={styles.grid}>
      <StatCard
        label="Total Queries"
        value={summary.total_queries?.toLocaleString()}
        sub="All platforms combined"
        color="#6366f1"
        icon="📊"
      />
      <StatCard
        label="Top Issue"
        value={summary.top_issue || '—'}
        sub={`${summary.top_issue_count} queries (${summary.total_queries > 0 ? Math.round(summary.top_issue_count / summary.total_queries * 100) : 0}%)`}
        color="#f59e0b"
        icon="🔥"
      />
      <StatCard
        label="Auto-Resolvable"
        value={`${summary.auto_resolvable_rate}%`}
        sub="Can be handled by AI"
        color="#22c55e"
        icon="🤖"
      />
      <StatCard
        label="Escalation Rate"
        value={`${summary.escalation_rate}%`}
        sub="Need human support"
        color="#ef4444"
        icon="🚨"
      />
    </div>
  );
}
