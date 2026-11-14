import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
  Heart,
  MapPin,
} from 'lucide-react';
import { MapView } from '../components/MapView';
import { ResilientImage } from '../components/ResilientImage';
import { DestinationCard } from '../components/DestinationCard';
import { useAuth } from '../context/AuthContext';
import { getDestinationBySlug, getDestinationsByState } from '../data/destinations';
import { formatINR } from '../utils/travelLogic';

export function DestinationDetails() {
  const { slug } = useParams<{ slug: string }>();
  const destination = slug ? getDestinationBySlug(slug) : undefined;
  const { isAuthenticated, dashboard, toggleSavedDestination, toggleFavoritePlace } = useAuth();
  const navigate = useNavigate();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const sameStateDestinations = useMemo(
    () =>
      destination
        ? getDestinationsByState(destination.stateSlug).filter((d) => d.slug !== destination.slug)
        : [],
    [destination]
  );

  if (!destination) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">
          Destination Not Found
        </h1>
        <p className="text-slate-600 mb-6">
          Explore all curated Indian destinations or search by state.
        </p>
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F4C5C] rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Browse All Destinations</span>
        </Link>
      </div>
    );
  }

  const gallery = destination.galleryKeys.length > 0 ? destination.galleryKeys : [destination.imageKey];
  const currentImageKey = gallery[activePhotoIndex % gallery.length];
  const isSaved = Boolean(dashboard?.savedDestinations.includes(destination.slug));
  const isFav = Boolean(dashboard?.favoritePlaces.includes(destination.slug));

  const mapMarkers = [
    {
      name: destination.name,
      coordinates: destination.coordinates,
      subtitle: `${destination.location} · Primary Destination`,
      primary: true,
    },
    ...sameStateDestinations.slice(0, 4).map((d) => ({
      name: d.name,
      coordinates: d.coordinates,
      subtitle: `${d.category} · Nearby in ${d.stateName}`,
      primary: false,
    })),
  ];

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleSavedDestination(destination.slug);
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleFavoritePlace(destination.slug);
  };

  const costRows = [
    { label: 'Estimated Accommodation (per night)', value: destination.costEstimate.accommodationPerNight },
    { label: 'Estimated Food Expenses (per day)', value: destination.costEstimate.foodPerDay },
    { label: 'Estimated Local Transport (per day)', value: destination.costEstimate.localTransportPerDay },
    { label: 'Estimated Entry Fees (total trip)', value: destination.costEstimate.entryFeesTotal },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-6">
        <Link to="/" className="hover:text-slate-900">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={`/state/${destination.stateSlug}`} className="hover:text-slate-900">
          {destination.stateName}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-900 font-medium">{destination.name}</span>
      </div>

      {/* Header + Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-semibold text-[#0F4C5C] mb-2">
            {destination.stateName} <span aria-hidden="true">·</span> {destination.category}{' '}
            <span aria-hidden="true">·</span> {destination.preferences.join(' / ')}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 leading-tight">
            {destination.name}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-slate-600 mt-2">
            <MapPin className="w-4 h-4 text-[#0F4C5C]" aria-hidden="true" />
            <span>{destination.location}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleFavorite}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              isFav
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} aria-hidden="true" />
            <span>{isFav ? 'Favorited' : 'Favorite'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              isSaved
                ? 'bg-[#0F4C5C]/10 border-[#0F4C5C]/30 text-[#0F4C5C]'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
            <span>{isSaved ? 'Saved' : 'Save Destination'}</span>
          </button>

          <Link
            to={`/planner?destination=${encodeURIComponent(destination.name)}&slug=${encodeURIComponent(
              destination.slug
            )}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Plan a Trip Here</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12">
        <div className="lg:col-span-9 relative aspect-16/9 rounded-xl overflow-hidden bg-slate-200 border border-slate-200">
          <ResilientImage
            imageKey={currentImageKey}
            cropPosition={destination.cropPosition}
            alt={`${destination.name} gallery view ${activePhotoIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="lg:col-span-3 grid grid-cols-3 lg:grid-cols-1 gap-3">
          {gallery.map((key, idx) => (
            <button
              key={`${key}-${idx}`}
              type="button"
              onClick={() => setActivePhotoIndex(idx)}
              aria-label={`View gallery photo ${idx + 1} for ${destination.name}`}
              className={`relative aspect-4/3 lg:aspect-auto lg:h-full rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                activePhotoIndex === idx
                  ? 'border-[#0F4C5C] ring-2 ring-[#0F4C5C]/25'
                  : 'border-slate-200 opacity-80 hover:opacity-100'
              }`}
            >
              <ResilientImage
                imageKey={key}
                alt={`${destination.name} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">
              About {destination.name}
            </h2>
            <p className="text-base text-slate-700 leading-relaxed mb-6">
              {destination.detailedIntro}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div>
                <h3 className="text-xs font-semibold text-[#0F4C5C] mb-2.5">Famous Attractions</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  {destination.famousAttractions.map((attr) => (
                    <li key={attr} className="flex items-start gap-2">
                      <span className="text-[#0F4C5C] font-bold" aria-hidden="true">
                        —
                      </span>
                      <span>{attr}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-[#0F4C5C] mb-2.5">Things to Do</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  {destination.thingsToDo.map((todo) => (
                    <li key={todo} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold" aria-hidden="true">
                        —
                      </span>
                      <span>{todo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F4C5C] mb-1">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Best Time to Visit</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {destination.bestTimeToVisit}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#0F4C5C] mb-1">Nearby Tourist Places</h3>
                <p className="text-sm text-slate-700">{destination.nearbyPlaces.join(' · ')}</p>
              </div>
            </div>
          </section>

          {/* Map */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Location &amp; Nearby Destinations Map
              </h2>
              <span className="font-mono-num text-xs text-slate-500">
                {destination.coordinates[0].toFixed(3)}°N, {destination.coordinates[1].toFixed(3)}°E
              </span>
            </div>
            <MapView
              center={destination.coordinates}
              zoom={9}
              markers={mapMarkers}
              heightClass="h-80 sm:h-96"
            />
          </section>
        </div>

        {/* Right Sidebar: Expense Estimates & Quick Plan CTA */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-1">
              Estimated Travel Expenses
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Sample standard-tier daily cost estimates (not live market quotes)
            </p>

            <div className="divide-y divide-slate-100">
              {costRows.map((row) => (
                <div key={row.label} className="py-3.5 flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-700">{row.label}</span>
                  <span className="font-mono-num text-sm font-semibold text-slate-900 shrink-0">
                    {formatINR(row.value)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                Typical Total Daily Cost
              </span>
              <span className="font-mono-num text-xl font-bold text-[#0F4C5C]">
                {formatINR(destination.estimatedVisitingCost)}
              </span>
            </div>

            <Link
              to={`/planner?destination=${encodeURIComponent(destination.name)}&slug=${encodeURIComponent(
                destination.slug
              )}`}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47] transition-colors"
            >
              <span>Plan a Trip Here</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>

      {/* More in State */}
      {sameStateDestinations.length > 0 && (
        <section className="pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              More Places in {destination.stateName}
            </h2>
            <Link
              to={`/state/${destination.stateSlug}`}
              className="text-sm font-semibold text-[#0F4C5C] hover:underline"
            >
              View full state guide
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sameStateDestinations.slice(0, 3).map((d) => (
              <DestinationCard key={d.slug} destination={d} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
