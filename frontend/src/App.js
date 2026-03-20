import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import DistributionCharts from './components/DistributionCharts';
import TrendChart from './components/TrendChart';
import SourceBreakdown from './components/SourceBreakdown';
import AutomationOpportunities from './components/AutomationOpportunities';
import QueryTester from './components/QueryTester';
import QueryTable from './components/QueryTable';
import {
  getSummary, getDistribution, getBySource,
  getTrends, getAutomationOpportunities, getQueries
} from './api';

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'trends', label: '📅 Trends' },
  { id: 'automation', label: '🚀 Automation' },
  { id: 'tester', label: '🔬 Live Tester' },
  { id: 'queries', label: '📋 All Queries' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [summary, setSummary] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [sources, setSources] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [queries, setQueries] = useState([]);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const [sumRes, distRes, srcRes, trendRes, autoRes, qRes] = await Promise.all([
        getSummary(),
        getDistribution(),
        getBySource(),
        getTrends(),
        getAutomationOpportunities(),
        getQueries({ limit: 500 }),
      ]);
      setSummary(sumRes.data);
      setDistribution(distRes.data.distribution || []);
      setSources(srcRes.data.sources || []);
      setWeeks(trendRes.data.weeks || []);
      setOpportunities(autoRes.data.opportunities || []);
      setQueries(qRes.data.queries || []);
      setLastUpdated(new Date().toISOString());
    } catch (e) {
      setError('Cannot connect to the backend API. Please start the backend server (uvicorn main:app --reload) and refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const tabBar = {
    display: 'flex', gap: '4px', padding: '16px 24px 0',
    borderBottom: '1px solid #2a2a3e', background: '#0f0f13',
    overflowX: 'auto',
  };

  const tabBtn = (id) => ({
    background: activeTab === id ? 'rgba(99,102,241,0.15)' : 'transparent',
    border: activeTab === id ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
    borderBottom: activeTab === id ? '2px solid #6366f1' : '2px solid transparent',
    borderRadius: '8px 8px 0 0',
    color: activeTab === id ? '#a78bfa' : '#6b7280',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: activeTab === id ? '700' : '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '40px', animation: 'spin 1s linear infinite' }}>⚙️</div>
          <div style={{ color: '#9ca3af', fontSize: '14px' }}>Loading dashboard data…</div>
          <div style={{ color: '#4b5563', fontSize: '12px' }}>Classifying 100 sample queries with AI</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header lastUpdated={lastUpdated} />

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#fca5a5', padding: '12px 24px', fontSize: '13px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={fetchAll} style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px' }}>
            Retry
          </button>
        </div>
      )}

      {/* Tab navigation */}
      <div style={tabBar}>
        {TABS.map(t => (
          <button key={t.id} style={tabBtn(t.id)} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>

        {activeTab === 'overview' && (
          <>
            <SummaryCards summary={summary} />
            <DistributionCharts distribution={distribution} />
            <SourceBreakdown sources={sources} />
          </>
        )}

        {activeTab === 'trends' && (
          <>
            <TrendChart weeks={weeks} />
            {/* Weekly summary table */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: '1px solid #2a2a3e', borderRadius: '16px', padding: '24px',
            }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#e8e8f0', marginBottom: '16px' }}>
                📆 Weekly Summary Table
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      {['Week', 'Total', 'Order Tracking', 'Delivery Delay', 'Refund Request', 'Product Issue', 'Subscription', 'Payment Failure', 'General Q'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', borderBottom: '1px solid #2a2a3e', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map(w => (
                      <tr key={w.week} style={{ borderBottom: '1px solid #1e1e2e' }}>
                        <td style={{ padding: '8px 12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{w.week}</td>
                        <td style={{ padding: '8px 12px', color: '#6366f1', fontWeight: '700' }}>{w.total || 0}</td>
                        <td style={{ padding: '8px 12px', color: '#6b7280' }}>{w['Order Tracking'] || 0}</td>
                        <td style={{ padding: '8px 12px', color: '#6b7280' }}>{w['Delivery Delay'] || 0}</td>
                        <td style={{ padding: '8px 12px', color: '#6b7280' }}>{w['Refund Request'] || 0}</td>
                        <td style={{ padding: '8px 12px', color: '#6b7280' }}>{w['Product Issue'] || 0}</td>
                        <td style={{ padding: '8px 12px', color: '#6b7280' }}>{w['Subscription Issue'] || 0}</td>
                        <td style={{ padding: '8px 12px', color: '#6b7280' }}>{w['Payment Failure'] || 0}</td>
                        <td style={{ padding: '8px 12px', color: '#6b7280' }}>{w['General Product Question'] || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'automation' && (
          <AutomationOpportunities opportunities={opportunities} />
        )}

        {activeTab === 'tester' && (
          <QueryTester onNewQuery={fetchAll} />
        )}

        {activeTab === 'queries' && (
          <QueryTable queries={queries} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #2a2a3e', padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '12px', color: '#4b5563',
      }}>
        <span>🏋️ Beastlife Customer Intelligence Platform</span>
        <span>
          {summary?.total_queries} queries classified · {summary?.categories_count} categories ·{' '}
          AI: Keyword classifier + OpenAI GPT
        </span>
      </footer>
    </div>
  );
}
