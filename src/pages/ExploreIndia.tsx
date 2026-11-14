import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { StateCard } from '../components/StateCard';
import { INDIAN_STATES_AND_UTS } from '../data/states';
import { getDestinationsByState } from '../data/destinations';
import { filterAndSortStates } from '../utils/travelLogic';
import type { IndiaZone, RegionType } from '../types/travel';

const TYPES: Array<RegionType | 'All'> = ['All', 'State', 'Union Territory'];
const ZONES: Array<IndiaZone | 'All'> = [
  'All',
  'North',
  'South',
  'East',
  'West',
  'Central',
  'Northeast',
  'Islands',
];

export function ExploreIndia() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<RegionType | 'All'>('All');
  const [zoneFilter, setZoneFilter] = useState<IndiaZone | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name-asc' | 'budget-asc' | 'budget-desc'>('name-asc');

  const regions = useMemo(
    () =>
      filterAndSortStates(INDIAN_STATES_AND_UTS, {
        query,
        type: typeFilter,
        zone: zoneFilter,
        sortBy,
      }),
    [query, typeFilter, zoneFilter, sortBy]
  );

  const resetFilters = () => {
    setQuery('');
    setTypeFilter('All');
    setZoneFilter('All');
    setSortBy('name-asc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-3xl mb-10">
        <p className="text-xs font-semibold text-[#0F4C5C] mb-2">
          28 States &amp; 8 Union Territories
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4">
          Explore Every State &amp; Union Territory of India
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Select any Indian state or union territory to view regional cuisine, cultural traditions,
          daily budget estimates, interactive maps, and curated tourist destinations.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 mb-10 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="flex-1 flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus-within:border-[#0F4C5C] focus-within:bg-white">
            <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <label htmlFor="state-search-input" className="sr-only">
              Search states or union territories
            </label>
            <input
              id="state-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by state, capital, attraction, or dish (e.g., Ladakh, Hampi, Biryani)"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    typeFilter === t
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t === 'All' ? 'All (36)' : t === 'State' ? 'States (28)' : 'Union Territories (8)'}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="state-sort-select" className="sr-only">
                Sort states
              </label>
              <select
                id="state-sort-select"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'name-asc' | 'budget-asc' | 'budget-desc')
                }
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
              >
                <option value="name-asc">Sort: Alphabetical (A–Z)</option>
                <option value="budget-asc">Sort: Daily Budget (Low–High)</option>
                <option value="budget-desc">Sort: Daily Budget (High–Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Zone tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-500 mr-2">Region:</span>
          {ZONES.map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setZoneFilter(z)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                zoneFilter === z
                  ? 'bg-[#0F4C5C] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6 text-sm text-slate-600">
        <p>
          Showing <span className="font-mono-num font-semibold text-slate-900">{regions.length}</span>{' '}
          of 36 Indian States &amp; Union Territories
        </p>
        {(query || typeFilter !== 'All' || zoneFilter !== 'All') && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-[#0F4C5C] hover:underline cursor-pointer"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Grid or Friendly Empty State */}
      {regions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
            No matching states or territories found
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            Try clearing your search keyword or switching back to all regions across India.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47] cursor-pointer"
          >
            Show All 36 States &amp; UTs
          </button>
        </div>
      ) : (
        <div
          data-testid="states-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {regions.map((region) => (
            <StateCard
              key={region.slug}
              region={region}
              destinationCount={getDestinationsByState(region.slug).length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
