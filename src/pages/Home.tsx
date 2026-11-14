import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  Landmark,
  Mountain,
  Palmtree,
  Sparkles,
  Trees,
  Waves,
} from 'lucide-react';
import { Hero } from '../components/Hero';
import { DestinationCard } from '../components/DestinationCard';
import { StateCard } from '../components/StateCard';
import {
  getFeaturedDestinations,
  getPopularDestinations,
  getTrendingDestinations,
  getDestinationsByState,
} from '../data/destinations';
import { INDIAN_STATES_AND_UTS } from '../data/states';
import type { TravelCategory } from '../types/travel';

const CATEGORY_CARDS: Array<{
  category: TravelCategory;
  subtitle: string;
  icon: typeof Mountain;
}> = [
  {
    category: 'Mountains',
    subtitle: 'Himalayan passes, tea ridges & alpine lakes',
    icon: Mountain,
  },
  {
    category: 'Beaches',
    subtitle: 'Arabian Sea coves, backwaters & coral atolls',
    icon: Waves,
  },
  {
    category: 'Historical Places',
    subtitle: 'Rajput forts, rock-cut caves & UNESCO cities',
    icon: Landmark,
  },
  {
    category: 'Wildlife',
    subtitle: 'Tiger reserves, rhino floodplains & bird wetlands',
    icon: Trees,
  },
  {
    category: 'Religious Places',
    subtitle: 'Sacred river ghats, hill shrines & monasteries',
    icon: Sparkles,
  },
  {
    category: 'Adventure Tourism',
    subtitle: 'High-altitude treks, rafting rapids & paragliding',
    icon: Compass,
  },
];

const TESTIMONIALS = [
  {
    name: 'Ananya Deshmukh',
    role: 'Product Architect, Pune',
    trip: '8-Day Meghalaya & Assam Circuit',
    quote:
      'Before Plan My Trip India, estimating jeep transfers between Shillong, Cherrapunji, and Kaziranga took three spreadsheets. The itinerary builder and budget breakdown got our group of four within 6% of actual spend.',
  },
  {
    name: 'Rohan Kulkarni',
    role: 'Documentary Photographer, Bengaluru',
    trip: '5-Day Hampi & Badami Heritage Loop',
    quote:
      'Having real coordinates on the OpenStreetMap view next to regional food tips and entry fee estimates let us sequence sunrise shoots across Hampi and Anegundi without backtracking.',
  },
  {
    name: 'Meera Iyer',
    role: 'University Lecturer, Chennai',
    trip: '6-Day Ladakh & Nubra Family Journey',
    quote:
      'Being able to edit Day 2 and Day 3 activities directly after generating the draft—and saving everything to our dashboard—made planning our family trip across Leh and Nubra effortless.',
  },
];

export function Home() {
  const featured = getFeaturedDestinations().slice(0, 3);
  const popular = getPopularDestinations().slice(0, 6);
  const trending = getTrendingDestinations().slice(0, 3);
  const spotlightStates = ['rajasthan', 'kerala', 'himachal-pradesh', 'meghalaya']
    .map((slug) => INDIAN_STATES_AND_UTS.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div>
      <Hero />

      {/* Travel Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold text-[#0F4C5C] mb-1.5">Curated Experiences</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
              Explore India by Travel Style
            </h2>
          </div>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F4C5C] hover:text-[#0B3B47] whitespace-nowrap shrink-0"
          >
            <span>Browse all destinations</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_CARDS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.category}
                to={`/destinations?category=${encodeURIComponent(item.category)}`}
                className="group bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 hover:border-[#0F4C5C]/50 hover:shadow-sm transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-lg bg-[#0F4C5C]/8 text-[#0F4C5C] flex items-center justify-center shrink-0 group-hover:bg-[#0F4C5C] group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#0F4C5C] transition-colors">
                    {item.category}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5 leading-snug">{item.subtitle}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="bg-white border-y border-slate-200/80 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold text-[#0F4C5C] mb-1.5">Editor’s Selection</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
                Featured Destinations
              </h2>
            </div>
            <Link
              to="/planner"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F4C5C] hover:text-[#0B3B47] whitespace-nowrap shrink-0"
            >
              <span>Plan custom itinerary</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((dest) => (
              <DestinationCard key={dest.slug} destination={dest} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tourist Places */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold text-[#0F4C5C] mb-1.5">Traveler Favorites</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
              Popular Tourist Places
            </h2>
          </div>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F4C5C] hover:text-[#0B3B47] whitespace-nowrap shrink-0"
          >
            <span>See all 184 destinations</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popular.map((dest) => (
            <DestinationCard key={dest.slug} destination={dest} />
          ))}
        </div>
      </section>

      {/* Explore All 28 States & 8 UTs Preview */}
      <section className="bg-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-amber-300 mb-2">
                Complete Pan-India Atlas
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                Explore All 28 States &amp; 8 Union Territories
              </h2>
              <p className="text-slate-300 mt-3 text-sm sm:text-base leading-relaxed">
                From Ladakh’s 17,000-foot passes and Meghalaya’s living root bridges to Kerala’s
                backwater canals and Andaman coral reefs—every region includes curated places, local
                food, culture, and daily cost guides.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto"
            >
              <span>Explore All 36 Regions</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-900">
            {spotlightStates.map((region) => (
              <StateCard
                key={region.slug}
                region={region}
                destinationCount={getDestinationsByState(region.slug).length}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold text-[#0F4C5C] mb-1.5">This Season</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
              Trending Travel Destinations
            </h2>
          </div>
          <Link
            to="/destinations?sort=popular"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F4C5C] hover:text-[#0B3B47] whitespace-nowrap shrink-0"
          >
            <span>View trending routes</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trending.map((dest) => (
            <DestinationCard key={dest.slug} destination={dest} />
          ))}
        </div>
      </section>

      {/* Why Choose Plan My Trip India */}
      <section className="bg-white border-y border-slate-200/80 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold text-[#0F4C5C] mb-2">
                Why Choose Plan My Trip India
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
                Built specifically for India’s regional diversity and real trip logistics.
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Planning across India means juggling mountain pass seasons, regional rail links,
                multi-tier stays, and varied entry fees. We bring every state, cost breakdown, and
                route map into one workspace.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <span className="font-mono-num text-2xl font-bold text-slate-900 block">
                    36
                  </span>
                  <span className="text-xs text-slate-500">States &amp; Union Territories</span>
                </div>
                <div>
                  <span className="font-mono-num text-2xl font-bold text-slate-900 block">
                    184
                  </span>
                  <span className="text-xs text-slate-500">Curated Tourist Places</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 divide-y divide-slate-200 border-y border-slate-200">
              <div className="py-5 flex items-start gap-5">
                <span className="font-mono-num text-sm font-semibold text-[#0F4C5C] pt-0.5">
                  01.
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Complete Coverage Across Every State &amp; UT
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Every state and union territory includes 5–6 authentic destinations with local
                    food, traditions, ideal travel months, and realistic cost guides.
                  </p>
                </div>
              </div>
              <div className="py-5 flex items-start gap-5">
                <span className="font-mono-num text-sm font-semibold text-[#0F4C5C] pt-0.5">
                  02.
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Editable Day-by-Day Smart Trip Planner
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Generate customized day-wise itineraries from your departure city, then add,
                    edit, or remove activities and save directly to your traveler dashboard.
                  </p>
                </div>
              </div>
              <div className="py-5 flex items-start gap-5">
                <span className="font-mono-num text-sm font-semibold text-[#0F4C5C] pt-0.5">
                  03.
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Transparent Sample Budget Estimator &amp; OpenStreetMap Views
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Adjust traveler counts, duration, and Budget/Standard/Premium tiers dynamically
                    alongside interactive geographic maps with real coordinates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold text-[#0F4C5C] mb-1.5">Traveler Stories</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
            How Travelers Plan Across India
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <blockquote
              key={item.name}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
            >
              <p className="text-sm text-slate-700 leading-relaxed mb-6">“{item.quote}”</p>
              <footer className="pt-4 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.role} <span aria-hidden="true">·</span> {item.trip}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-14 bg-[#0F4C5C] text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold mb-2">
              <Palmtree className="w-4 h-4" aria-hidden="true" />
              <span>Ready to map your route?</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Craft your next Indian itinerary in minutes.
            </h2>
          </div>
          <Link
            to="/planner"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Open Trip Planner</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
