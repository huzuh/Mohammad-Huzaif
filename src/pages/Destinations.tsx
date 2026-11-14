import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, LocateFixed, Search, X } from 'lucide-react';
import { DestinationCard } from '../components/DestinationCard';
import { ALL_DESTINATIONS } from '../data/destinations';
import { INDIAN_STATES_AND_UTS } from '../data/states';
import { api } from '../services/api';
import {
  findNearestStartingPoint,
  formatCoordinatesLabel,
  haversineDistanceKm,
  requestBrowserCoordinates,
  type LiveLocationResult,
} from '../utils/locationUtils';
import { filterAndSortDestinations } from '../utils/travelLogic';
import type { BudgetTier, TravelCategory, TravelPreference } from '../types/travel';

const CATEGORIES: Array<TravelCategory | 'All'> = [
  'All',
  'Mountains',
  'Beaches',
  'Historical Places',
  'Wildlife',
  'Religious Places',
  'Adventure Tourism',
];

const PREFERENCES: Array<TravelPreference | 'All'> = [
  'All',
  'Adventure',
  'Nature',
  'Historical',
  'Beaches',
  'Family',
  'Spiritual',
  'Food and Culture',
];

const BUDGETS: Array<BudgetTier | 'All'> = ['All', 'Budget', 'Standard', 'Premium'];

export function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [stateSlug, setStateSlug] = useState(searchParams.get('state') || 'All');
  const [category, setCategory] = useState<TravelCategory | 'All'>(
    (searchParams.get('category') as TravelCategory) || 'All'
  );
  const [budgetTier, setBudgetTier] = useState<BudgetTier | 'All'>(
    (searchParams.get('budget') as BudgetTier) || 'All'
  );
  const [preference, setPreference] = useState<TravelPreference | 'All'>(
    (searchParams.get('pref') as TravelPreference) || 'All'
  );
  const [sortBy, setSortBy] = useState<
    'popular' | 'cost-asc' | 'cost-desc' | 'name-asc' | 'distance-asc'
  >(
    (searchParams.get('sort') as
      | 'popular'
      | 'cost-asc'
      | 'cost-desc'
      | 'name-asc'
      | 'distance-asc') || 'popular'
  );
  const [liveLocation, setLiveLocation] = useState<LiveLocationResult | null>(null);
  const [locatingLive, setLocatingLive] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category') as TravelCategory | null;
    if (q !== null) setQuery(q);
    if (cat) setCategory(cat);
  }, [searchParams]);

  const handleFetchLiveLocation = async () => {
    setLocatingLive(true);
    setLocationError(null);
    try {
      const { coordinates, accuracyMeters } = await requestBrowserCoordinates();
      let resolved: LiveLocationResult;
      try {
        const apiResult = await api.reverseGeocode(coordinates[0], coordinates[1]);
        resolved = { ...apiResult, accuracyMeters };
      } catch {
        const nearest = findNearestStartingPoint(coordinates);
        resolved = {
          coordinates,
          accuracyMeters,
          label: nearest.label,
          nearestDistrictOrCity: nearest.label,
          distanceToNearestKm: nearest.distanceKm,
          source: 'nearest-match',
          fetchedAt: new Date().toISOString(),
        };
      }
      setLiveLocation(resolved);
      setSortBy('distance-asc');
    } catch (err) {
      setLocationError((err as Error).message || 'Unable to fetch live location.');
    } finally {
      setLocatingLive(false);
    }
  };

  const handleClearLiveLocation = () => {
    setLiveLocation(null);
    setLocationError(null);
    if (sortBy === 'distance-asc') {
      setSortBy('popular');
    }
  };

  const results = useMemo(() => {
    const base = filterAndSortDestinations(ALL_DESTINATIONS, {
      query,
      stateSlug,
      category,
      budgetTier,
      preference,
      sortBy: sortBy === 'distance-asc' ? 'popular' : sortBy,
    });
    if (sortBy === 'distance-asc' && liveLocation) {
      return [...base].sort(
        (a, b) =>
          haversineDistanceKm(liveLocation.coordinates, a.coordinates) -
          haversineDistanceKm(liveLocation.coordinates, b.coordinates)
      );
    }
    return base;
  }, [query, stateSlug, category, budgetTier, preference, sortBy, liveLocation]);

  const resetAll = () => {
    setQuery('');
    setStateSlug('All');
    setCategory('All');
    setBudgetTier('All');
    setPreference('All');
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-3xl mb-10">
        <p className="text-xs font-semibold text-[#0F4C5C] mb-2">
          Pan-India Destination Directory
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4">
          Discover Tourist Places Across India
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Search by state, landmark, travel category, budget tier, or trip preference across{' '}
          {ALL_DESTINATIONS.length} curated destinations.
        </p>
      </div>

      {/* Filters Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus-within:border-[#0F4C5C] focus-within:bg-white">
            <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <label htmlFor="dest-search" className="sr-only">
              Search destinations
            </label>
            <input
              id="dest-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destination, city, landmark, or state..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="dest-state-filter" className="sr-only">
              Filter by state or union territory
            </label>
            <select
              id="dest-state-filter"
              value={stateSlug}
              onChange={(e) => setStateSlug(e.target.value)}
              className="w-full px-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
            >
              <option value="All">All 36 States &amp; UTs</option>
              {INDIAN_STATES_AND_UTS.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="dest-budget-filter" className="sr-only">
              Filter by budget tier
            </label>
            <select
              id="dest-budget-filter"
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value as BudgetTier | 'All')}
              className="w-full px-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
            >
              {BUDGETS.map((b) => (
                <option key={b} value={b}>
                  {b === 'All' ? 'Any Budget' : `${b} Tier`}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="dest-sort" className="sr-only">
              Sort destinations
            </label>
            <select
              id="dest-sort"
              value={sortBy}
              onChange={(e) => {
                const next = e.target.value as
                  | 'popular'
                  | 'cost-asc'
                  | 'cost-desc'
                  | 'name-asc'
                  | 'distance-asc';
                if (next === 'distance-asc' && !liveLocation) {
                  void handleFetchLiveLocation();
                  return;
                }
                setSortBy(next);
              }}
              className="w-full px-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
            >
              <option value="popular">Sort: Popular</option>
              <option value="distance-asc">Nearest to Me</option>
              <option value="cost-asc">Cost: Low to High</option>
              <option value="cost-desc">Cost: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleFetchLiveLocation}
              disabled={locatingLive}
              data-testid="destinations-live-location-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F4C5C] bg-[#0F4C5C]/8 border border-[#0F4C5C]/25 rounded-md hover:bg-[#0F4C5C] hover:text-white disabled:opacity-60 transition-colors cursor-pointer"
            >
              {locatingLive ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Fetching Live Location...</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{liveLocation ? 'Update Live Location' : 'Find Places Near Me'}</span>
                </>
              )}
            </button>
            {liveLocation && (
              <div
                data-testid="destinations-live-location-badge"
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-900"
              >
                <span>
                  Near <strong>{liveLocation.label}</strong> (
                  <span className="font-mono-num">
                    {formatCoordinatesLabel(liveLocation.coordinates)}
                  </span>
                  )
                </span>
                <button
                  type="button"
                  onClick={handleClearLiveLocation}
                  aria-label="Clear live location filter"
                  className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
          {locationError && (
            <p role="alert" className="text-xs text-rose-600">
              {locationError}
            </p>
          )}
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-500 mr-2">Category:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                category === cat
                  ? 'bg-[#0F4C5C] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Preference Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-500 mr-2">Preference:</span>
          {PREFERENCES.map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => setPreference(pref)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                preference === pref
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 text-sm text-slate-600">
        <p>
          Found <span className="font-mono-num font-semibold text-slate-900">{results.length}</span>{' '}
          {results.length === 1 ? 'destination' : 'destinations'}
        </p>
        {(query ||
          stateSlug !== 'All' ||
          category !== 'All' ||
          budgetTier !== 'All' ||
          preference !== 'All') && (
          <button
            type="button"
            onClick={resetAll}
            className="text-xs font-semibold text-[#0F4C5C] hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results or Empty State */}
      {results.length === 0 ? (
        <div
          data-testid="empty-destinations-state"
          className="bg-white border border-slate-200 rounded-xl p-12 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
            No destinations matched your filters
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            No tourist places match this combination of search keywords, category, and budget tier.
            Try broadening one filter or resetting to browse all places.
          </p>
          <button
            type="button"
            onClick={resetAll}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          data-testid="destinations-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {results.map((dest) => (
            <DestinationCard
              key={dest.slug}
              destination={dest}
              distanceKm={
                liveLocation
                  ? haversineDistanceKm(liveLocation.coordinates, dest.coordinates)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
