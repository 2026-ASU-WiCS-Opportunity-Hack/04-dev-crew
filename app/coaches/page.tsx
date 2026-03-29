'use client';

import { useState, useEffect } from 'react';
import type { CoachRecord, CertificationLevel } from '@/lib/types';
import CoachSearch from '@/components/coaches/CoachSearch';
import CoachDirectory from '@/components/coaches/CoachDirectory';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const CERT_LEVELS: CertificationLevel[] = ['CALC', 'PALC', 'SALC', 'MALC'];

type CoachWithChapter = CoachRecord & { similarity?: number; chapter_name?: string };

export default function CoachesPage() {
  const [allCoaches, setAllCoaches] = useState<CoachWithChapter[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [searchResults, setSearchResults] = useState<CoachWithChapter[] | null>(null);
  const [certFilter, setCertFilter] = useState<CertificationLevel | ''>('');
  const [countryFilter, setCountryFilter] = useState('');
  const [chapterFilter, setChapterFilter] = useState('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase
      .from('coaches')
      .select('*, chapters(name, slug)')
      .eq('is_approved', true)
      .order('full_name')
      .then(({ data, error }) => {
        if (error) console.error(error);
        const coaches = (data ?? []).map((c: any) => ({
          ...c,
          chapter_name: c.chapters?.name ?? null,
        }));
        setAllCoaches(coaches);
        setLoadingCoaches(false);
      });
  }, []);

  const countries = [...new Set(allCoaches.map((c) => c.location_country).filter((c): c is string => !!c))].sort();
  const chapters = [...new Map(
    allCoaches
      .filter((c) => c.chapter_name)
      .map((c) => [c.chapter_id, c.chapter_name])
  ).entries()].sort((a, b) => (a[1] ?? '').localeCompare(b[1] ?? ''));

  const isSearchMode = searchResults !== null;
  const hasFilters = !!(certFilter || countryFilter || chapterFilter);

  const displayed = isSearchMode
    ? searchResults
    : allCoaches.filter((c) => {
        if (certFilter && c.certification_level !== certFilter) return false;
        if (countryFilter && c.location_country !== countryFilter) return false;
        if (chapterFilter && c.chapter_id !== chapterFilter) return false;
        return true;
      });

  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Global Directory</span>
          <h1 className="section-title" style={{ marginTop: '0.75rem' }}>Find a WIAL Coach</h1>
          <p className="section-copy">
            Search in any language — our AI understands meaning across Portuguese, Spanish, English, French, and more.
          </p>
        </div>
      </section>

      <div className="page-divider" />

      <section className="section">
        <div className="container">
          {/* Search */}
          <div style={{ marginBottom: '1.75rem' }}>
            <CoachSearch onResults={setSearchResults} onReset={() => setSearchResults(null)} />
          </div>

          {/* Filters — only in browse mode */}
          {!isSearchMode && (
            <div className="coaches-filters">
              <select className="coaches-filter-select" value={certFilter} onChange={(e) => setCertFilter(e.target.value as CertificationLevel | '')}>
                <option value="">All Cert Levels</option>
                {CERT_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <select className="coaches-filter-select" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
                <option value="">All Countries</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="coaches-filter-select" value={chapterFilter} onChange={(e) => setChapterFilter(e.target.value)}>
                <option value="">All Chapters</option>
                {chapters.map(([id, name]) => <option key={id ?? ''} value={id ?? ''}>{name}</option>)}
              </select>
              {hasFilters && (
                <button className="button-secondary" onClick={() => { setCertFilter(''); setCountryFilter(''); setChapterFilter(''); }}>
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Loading state */}
          {loadingCoaches && !isSearchMode && (
            <div className="search-loading">Loading coaches from database…</div>
          )}

          {/* Directory */}
          {!loadingCoaches && <CoachDirectory coaches={displayed} isSearchResult={isSearchMode} />}
        </div>
      </section>
    </>
  );
}
