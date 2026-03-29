'use client';

import { useState } from 'react';
import type { CoachRecord } from '@/lib/types';

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

    const res = await fetch('/api/ai/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const json = await res.json();

    if (!json.ok) {
      setLoading(false);
      return;
    }

    const results = json.data.results;
    const parsed = json.data.parsed;
    setLastQuery(query);
    setParsedInfo(
      `Detected language: ${parsed.original_language ?? 'unknown'} · Semantic query: "${parsed.semantic_query}" · ${results.length} match${results.length !== 1 ? 'es' : ''} found`
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
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search in any language — try "Preciso de um coach para equipes de liderança em organizações governamentais"'
            className="form-input"
            style={{ paddingLeft: 42 }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="button-primary"
          style={{ opacity: loading || !query.trim() ? 0.6 : 1, cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
        >
          {loading ? 'Searching…' : 'AI Search'}
        </button>
        {lastQuery && (
          <button type="button" onClick={handleReset} className="button-secondary">
            Clear
          </button>
        )}
      </form>

      {parsedInfo && (
        <div className="search-info" style={{ marginTop: '0.625rem', background: 'rgba(15,138,153,0.07)', border: '1px solid rgba(15,138,153,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: '0.8rem', color: 'var(--accent)' }}>
          ✨ <strong>AI processed:</strong> "{lastQuery}" · {parsedInfo}
        </div>
      )}

      {loading && (
        <div className="search-loading">
          🤖 Parsing query language → Generating embedding vector → Running cosine similarity search…
        </div>
      )}
    </div>
  );
}
