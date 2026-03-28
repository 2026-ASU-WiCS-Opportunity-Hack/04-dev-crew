'use client';

import { useState } from 'react';
import type { CoachRecord } from '@/lib/types';
import { mockSearch } from './mock-data';

interface CoachSearchProps {
  onResults: (coaches: (CoachRecord & { similarity?: number })[]) => void;
  onReset: () => void;
}

export default function CoachSearch({ onResults, onReset }: CoachSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [parsedInfo, setParsedInfo] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setParsedInfo(null);

    // Simulate AI processing delay
    await new Promise((r) => setTimeout(r, 1500));

    // Use mock search — swap for real API call when backend is ready:
    // const res = await fetch('/api/ai/search', { method: 'POST', body: JSON.stringify({ query }) });
    // const json = await res.json();
    // onResults(json.data.results);
    const results = mockSearch(query);
    setLastQuery(query);
    setParsedInfo(
      `Detected language: ${/[àáãâéêíóôõúüç]/i.test(query) ? 'Portuguese' : 'English'} · Semantic query processed · ${results.length} match${results.length !== 1 ? 'es' : ''} found`
    );
    onResults(results);
    setLoading(false);
  }

  function handleReset() {
    setQuery('');
    setLastQuery('');
    setParsedInfo(null);
    onReset();
  }

  return (
    <div style={{ width: '100%' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.1rem',
            }}
          >
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search in any language — try "Preciso de um coach para equipes de liderança em organizações governamentais"'
            style={{
              width: '100%',
              padding: '12px 14px 12px 42px',
              borderRadius: 12,
              border: '1.5px solid rgba(28,43,51,0.15)',
              background: 'var(--card)',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(28,43,51,0.15)')}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            padding: '12px 24px',
            borderRadius: 12,
            border: 'none',
            background: loading ? '#94a3b8' : 'var(--accent)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Searching…' : 'AI Search'}
        </button>
        {lastQuery && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              border: '1.5px solid rgba(28,43,51,0.15)',
              background: 'transparent',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </form>

      {/* AI parsing info */}
      {parsedInfo && (
        <div
          style={{
            marginTop: 10,
            padding: '8px 14px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            fontSize: '0.8rem',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>✨</span>
          <span>
            <strong>AI processed:</strong> "{lastQuery}" · {parsedInfo}
          </span>
        </div>
      )}

      {/* Loading animation */}
      {loading && (
        <div
          style={{
            marginTop: 10,
            padding: '10px 14px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            fontSize: '0.82rem',
            color: '#1d4ed8',
          }}
        >
          🤖 Parsing query language → Generating embedding vector → Running cosine similarity search across 15 coaches…
        </div>
      )}
    </div>
  );
}
