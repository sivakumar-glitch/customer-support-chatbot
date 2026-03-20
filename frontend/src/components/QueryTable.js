import React, { useState } from 'react';
import { CATEGORY_COLORS, CATEGORY_ICONS, SOURCE_LABELS } from '../constants';

const PAGE_SIZE = 10;

export default function QueryTable({ queries }) {
  const [page, setPage] = useState(0);
  const [filterCat, setFilterCat] = useState('');
  const [filterSrc, setFilterSrc] = useState('');
  const [search, setSearch] = useState('');

  const filtered = queries.filter(q => {
    if (filterCat && q.category !== filterCat) return false;
    if (filterSrc && q.source !== filterSrc) return false;
    if (search && !q.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const total = filtered.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const slice = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const allCats = [...new Set(queries.map(q => q.category))].sort();
  const allSrcs = [...new Set(queries.map(q => q.source))].sort();

  const selectStyle = {
    background: '#0f0f1a', border: '1px solid #3a3a5c', borderRadius: '8px',
    color: '#e8e8f0', padding: '7px 12px', fontSize: '12px', cursor: 'pointer', outline: 'none',
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      border: '1px solid #2a2a3e', borderRadius: '16px',
      padding: '24px', marginBottom: '24px',
    }}>
      <div style={{ fontSize: '15px', fontWeight: '700', color: '#e8e8f0', marginBottom: '16px' }}>
        📋 All Classified Queries ({total})
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search messages…"
          style={{
            ...selectStyle, flex: '1', minWidth: '180px',
            padding: '7px 12px',
          }}
        />
        <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(0); }} style={selectStyle}>
          <option value="">All Categories</option>
          {allCats.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
        </select>
        <select value={filterSrc} onChange={e => { setFilterSrc(e.target.value); setPage(0); }} style={selectStyle}>
          <option value="">All Sources</option>
          {allSrcs.map(s => <option key={s} value={s}>{SOURCE_LABELS[s] || s}</option>)}
        </select>
        {(filterCat || filterSrc || search) && (
          <button onClick={() => { setFilterCat(''); setFilterSrc(''); setSearch(''); setPage(0); }}
            style={{ ...selectStyle, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', cursor: 'pointer' }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['#', 'Message', 'Source', 'Category', 'Method', 'Time'].map(h => (
                <th key={h} style={{
                  padding: '10px 12px', textAlign: 'left',
                  color: '#6b7280', fontWeight: '600', fontSize: '11px',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  borderBottom: '1px solid #2a2a3e',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#4b5563' }}>
                  No queries match your filters.
                </td>
              </tr>
            )}
            {slice.map((q, i) => (
              <tr key={q.id} style={{ borderBottom: '1px solid #1e1e2e' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '10px 12px', color: '#4b5563', fontWeight: '600' }}>
                  {page * PAGE_SIZE + i + 1}
                </td>
                <td style={{ padding: '10px 12px', color: '#9ca3af', maxWidth: '320px' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={q.message}>
                    {q.message}
                  </div>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                    background: 'rgba(99,102,241,0.1)', color: '#a78bfa',
                    border: '1px solid rgba(99,102,241,0.2)',
                  }}>
                    {SOURCE_LABELS[q.source] || q.source}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                    background: `${CATEGORY_COLORS[q.category] || '#6366f1'}18`,
                    color: CATEGORY_COLORS[q.category] || '#6366f1',
                    border: `1px solid ${CATEGORY_COLORS[q.category] || '#6366f1'}33`,
                    whiteSpace: 'nowrap',
                  }}>
                    {CATEGORY_ICONS[q.category]} {q.category}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    fontSize: '11px', color: q.method === 'openai_gpt' ? '#22c55e' : '#6b7280',
                  }}>
                    {q.method === 'openai_gpt' ? '✨ GPT' : '⚡ KW'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: '#4b5563', fontSize: '11px', whiteSpace: 'nowrap' }}>
                  {new Date(q.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ background: '#1e1e2e', border: '1px solid #3a3a5c', color: '#9ca3af', borderRadius: '8px', padding: '6px 12px', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}>
            ← Prev
          </button>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>
            Page {page + 1} of {pages}
          </span>
          <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page === pages - 1}
            style={{ background: '#1e1e2e', border: '1px solid #3a3a5c', color: '#9ca3af', borderRadius: '8px', padding: '6px 12px', cursor: page === pages - 1 ? 'not-allowed' : 'pointer', opacity: page === pages - 1 ? 0.4 : 1 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
