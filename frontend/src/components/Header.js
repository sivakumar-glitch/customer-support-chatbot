import React from 'react';

const styles = {
  header: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
    borderBottom: '1px solid #2a2a3e',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    width: '38px',
    height: '38px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    boxShadow: '0 0 20px rgba(99,102,241,0.4)',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '800',
    background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '1px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  badge: {
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    color: '#a78bfa',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: '12px',
    color: '#4b5563',
  },
};

export default function Header({ lastUpdated }) {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <div style={styles.logo}>💪</div>
        <div>
          <div style={styles.brandName}>Beastlife</div>
          <div style={styles.subtitle}>Customer Intelligence Dashboard</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={styles.badge}>🤖 AI Powered</span>
        {lastUpdated && (
          <span style={styles.timestamp}>
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>
    </header>
  );
}
