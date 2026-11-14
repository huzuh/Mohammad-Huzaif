import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Compass, MapPin, Utensils } from 'lucide-react';
import { DestinationCard } from '../components/DestinationCard';
import { MapView } from '../components/MapView';
import { ResilientImage } from '../components/ResilientImage';
import { getDestinationsByState } from '../data/destinations';
import { KARNATAKA_DISTRICTS, type KarnatakaRegion } from '../data/karnatakaDistricts';
import { INDIAN_STATES_AND_UTS } from '../data/states';
import { formatINR } from '../utils/travelLogic';

const KARNATAKA_REGIONS: Array<KarnatakaRegion | 'All'> = [
  'All',
  'Southern Karnataka',
  'Coastal & Malnad',
  'Kittur Karnataka',
  'Kalyana Karnataka',
];

export function StateDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [districtRegion, setDistrictRegion] = useState<KarnatakaRegion | 'All'>('All');
  const region = INDIAN_STATES_AND_UTS.find((s) => s.slug === slug);
  const destinations = useMemo(
    () => (region ? getDestinationsByState(region.slug) : []),
    [region]
  );
  const filteredDistricts = useMemo(
    () =>
      districtRegion === 'All'
        ? KARNATAKA_DISTRICTS
        : KARNATAKA_DISTRICTS.filter((d) => d.region === districtRegion),
    [districtRegion]
  );

  if (!region) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">
          State or Territory Not Found
        </h1>
        <p className="text-slate-600 mb-6">
          We could not locate that region. Browse all 28 Indian states and 8 union territories.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F4C5C] rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Explore India</span>
        </Link>
      </div>
    );
  }

  const mapMarkers = destinations.map((d, idx) => ({
    name: d.name,
    coordinates: d.coordinates,
    subtitle: `${d.category} · ${formatINR(d.estimatedVisitingCost)}/day`,
    primary: idx === 0,
  }));

  return (
    <div>
      {/* State Hero Banner */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <ResilientImage
            imageKey={region.imageKey}
            cropPosition={region.cropPosition}
            alt={`${region.name} scenic landscape`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-slate-950/35" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/85 hover:text-white mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>All 28 States &amp; 8 Union Territories</span>
          </Link>

          <p className="text-xs font-semibold text-amber-300 mb-2">
            {region.type} <span aria-hidden="true">·</span> {region.zone} India{' '}
            <span aria-hidden="true">·</span> Capital: {region.capital}
          </p>

          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            {region.name}
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-3xl leading-relaxed">
            {region.description}
          </p>
        </div>
      </section>

      {/* State Quick Facts & Cultural Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0F4C5C] mb-1">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    <span>Best Time to Visit</span>
                  </div>
                  <p className="text-base font-semibold text-slate-900">{region.bestTimeToVisit}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0F4C5C] mb-1">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    <span>Estimated Daily Budget</span>
                  </div>
                  <p className="font-mono-num text-sm text-slate-700">
                    Budget {formatINR(region.dailyBudget.budget)} · Standard{' '}
                    <strong className="text-slate-900">
                      {formatINR(region.dailyBudget.standard)}
                    </strong>{' '}
                    · Premium {formatINR(region.dailyBudget.premium)}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F4C5C] mb-2">
                  <Utensils className="w-4 h-4" aria-hidden="true" />
                  <span>Famous Local Food</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {region.famousFood.join(' · ')}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F4C5C] mb-2">
                  <Compass className="w-4 h-4" aria-hidden="true" />
                  <span>Local Culture &amp; Traditions</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {region.cultureAndTraditions}
                </p>
              </div>

              <div>
                <h2 className="text-xs font-semibold text-[#0F4C5C] mb-2">Popular Activities</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                  {region.popularActivities.map((act) => (
                    <li key={act} className="flex items-start gap-2">
                      <span className="text-[#0F4C5C] font-bold" aria-hidden="true">
                        —
                      </span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {region.name} Destinations Map
            </h2>
            <MapView
              center={region.coordinates}
              zoom={7}
              markers={mapMarkers}
              heightClass="h-80 lg:h-[360px]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-500">
                Click any pin to inspect destination highlights and daily cost estimates.
              </p>
              <Link
                to={`/planner?destination=${encodeURIComponent(
                  destinations[0]?.name || region.name
                )}&slug=${encodeURIComponent(destinations[0]?.slug || '')}`}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47] transition-colors whitespace-nowrap shrink-0"
              >
                Plan a Trip to {region.name}
              </Link>
            </div>
          </div>
        </div>

        {/* Destinations in this State */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-[#0F4C5C] mb-1">
                {destinations.length} Curated Places
              </p>
              <h2 className="font-display text-3xl font-bold text-slate-900">
                Famous Tourist Destinations in {region.name}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <DestinationCard key={dest.slug} destination={dest} />
            ))}
          </div>
        </div>

        {/* All 31 Districts Directory for Karnataka */}
        {region.slug === 'karnataka' && (
          <div className="mt-16 pt-12 border-t border-slate-200" data-testid="karnataka-districts-section">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold text-[#0F4C5C] mb-1">
                  Complete District Atlas · {KARNATAKA_DISTRICTS.length} Districts
                </p>
                <h2 className="font-display text-3xl font-bold text-slate-900">
                  All 31 Districts of Karnataka
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                  Browse every district across Southern Karnataka, Coastal &amp; Malnad, Kittur
                  Karnataka, and Kalyana Karnataka—and launch a trip starting directly from any
                  district.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {KARNATAKA_REGIONS.map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setDistrictRegion(reg)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      districtRegion === reg
                        ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {reg === 'All' ? `All (${KARNATAKA_DISTRICTS.length})` : reg}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDistricts.map((dist) => (
                <article
                  key={dist.slug}
                  data-testid="karnataka-district-card"
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-[#0F4C5C]/40 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        {dist.name}
                      </h3>
                      <span className="font-mono-num text-[11px] text-slate-500 shrink-0">
                        {dist.coordinates[0].toFixed(2)}°N, {dist.coordinates[1].toFixed(2)}°E
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#0F4C5C] mb-2">
                      {dist.region}
                      {dist.headquarters !== dist.name ? ` · HQ: ${dist.headquarters}` : ''}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {dist.highlight}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/planner?origin=${encodeURIComponent(dist.originLabel)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F4C5C] hover:underline"
                    >
                      <span>Plan Trip from {dist.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
