'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CoachRecord, CertificationLevel } from '@/lib/types';
import CoachSearch from '@/components/coaches/CoachSearch';
import CoachDirectory from '@/components/coaches/CoachDirectory';
import { MOCK_COACHES } from '@/components/coaches/mock-data';

const CERT_LEVELS: CertificationLevel[] = ['CALC', 'PALC', 'SALC', 'MALC'];
const COUNTRIES = [...new Set(MOCK_COACHES.map((c) => c.location_country).filter((c): c is string => c !== null))].sort();

export default function CoachesPage() {
  const [searchResults, setSearchResults] = useState<(CoachRecord & { similarity?: number })[] | null>(null);
  const [certFilter, setCertFilter] = useState<CertificationLevel | ''>('');
  const [countryFilter, setCountryFilter] = useState('');

  const isSearchMode = searchResults !== null;

  const displayed = isSearchMode
    ? searchResults
    : MOCK_COACHES.filter((c) => {
        if (certFilter && c.certification_level !== certFilter) return false;
        if (countryFilter && c.location_country !== countryFilter) return false;
        return true;
      });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav
        style={{
          padding: '0 32px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--card)',
          borderBottom: '1px solid rgba(28,43,51,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Link href="/" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)', textDecoration: 'none' }}>
          WIAL
        </Link>
        <div style={{ display: 'flex', gap: 24, fontSize: '0.9rem' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Home</Link>
          <Link href="/coaches" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 600 }}>Coaches</Link>
          <Link href="/dashboard/coach" style={{ textDecoration: 'none', color: 'var(--muted)' }}>My Dashboard</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ margin: '0 0 6px', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Global Directory
          </p>
          <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', lineHeight: 1.1 }}>
            Find a WIAL Coach
          </h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '1rem', maxWidth: 600, lineHeight: 1.6 }}>
            Search in any language — our AI understands meaning across Portuguese, Spanish, English, French, and more.
          </p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 28 }}>
          <CoachSearch
            onResults={setSearchResults}
            onReset={() => setSearchResults(null)}
          />
        </div>

        {/* Filters — only in browse mode */}
        {!isSearchMode && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            <select
              value={certFilter}
              onChange={(e) => setCertFilter(e.target.value as CertificationLevel | '')}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1.5px solid rgba(28,43,51,0.15)',
                background: 'var(--card)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <option value="">All Cert Levels</option>
              {CERT_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1.5px solid rgba(28,43,51,0.15)',
                background: 'var(--card)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <option value="">All Countries</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {(certFilter || countryFilter) && (
              <button
                onClick={() => { setCertFilter(''); setCountryFilter(''); }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1.5px solid rgba(28,43,51,0.15)',
                  background: 'transparent',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Directory */}
        <CoachDirectory coaches={displayed} isSearchResult={isSearchMode} />
      </main>
    </div>
  );
}
