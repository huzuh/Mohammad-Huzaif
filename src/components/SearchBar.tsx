import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { TravelCategory } from '../types/travel';

const CATEGORIES: Array<TravelCategory | 'All'> = [
  'All',
  'Mountains',
  'Beaches',
  'Historical Places',
  'Wildlife',
  'Religious Places',
  'Adventure Tourism',
];

interface SearchBarProps {
  initialQuery?: string;
  initialCategory?: TravelCategory | 'All';
  compact?: boolean;
  onSearch?: (query: string, category: TravelCategory | 'All') => void;
}

export function SearchBar({
  initialQuery = '',
  initialCategory = 'All',
  compact = false,
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<TravelCategory | 'All'>(initialCategory);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query, category);
      return;
    }
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category !== 'All') params.set('category', category);
    navigate(`/destinations?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full bg-white border border-slate-200 rounded-xl shadow-sm ${
        compact ? 'p-2' : 'p-2.5 sm:p-3'
      }`}
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        <div className="flex-1 flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50/70 border border-slate-200/80 focus-within:border-[#0F4C5C] focus-within:bg-white transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          <label htmlFor="hero-destination-search" className="sr-only">
            Search Indian destinations, states, or attractions
          </label>
          <input
            id="hero-destination-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destination, state, or landmark (e.g., Ladakh, Goa, Hampi)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="md:w-52">
          <label htmlFor="hero-category-select" className="sr-only">
            Filter by travel category
          </label>
          <select
            id="hero-category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as TravelCategory | 'All')}
            className="w-full px-3 py-2.5 text-sm text-slate-700 bg-slate-50/70 border border-slate-200/80 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Search Destinations
        </button>
      </div>
    </form>
  );
}
