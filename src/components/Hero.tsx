import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { IMAGE_ASSET_PATHS } from '../data/images';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      <div className="absolute inset-0">
        <img
          src={IMAGE_ASSET_PATHS.hero_palace}
          alt="Golden hour view of Udaipur lakeside palace in Rajasthan, India"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-slate-950/40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-amber-300 mb-4">
            28 Indian States · 8 Union Territories · AI Trip Planner
          </p>

          <h1
            className="font-display font-bold tracking-tight text-white leading-[1.1] mb-5"
            style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)', textWrap: 'balance' }}
          >
            Discover India, One Journey at a Time.
          </h1>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mb-8">
            Explore destinations, plan your journey, and create unforgettable memories across
            India’s mountains, coastlines, heritage citadels, and living cultures.
          </p>

          <div className="mb-8">
            <SearchBar />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Explore Now</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white border border-white/35 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Build Smart Itinerary</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
