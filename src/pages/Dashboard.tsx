import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Calendar, Heart, LogOut, Trash2, User } from 'lucide-react';
import { DestinationCard } from '../components/DestinationCard';
import { useAuth } from '../context/AuthContext';
import { ALL_DESTINATIONS } from '../data/destinations';
import { formatINR } from '../utils/travelLogic';
import type { TravelPreference } from '../types/travel';

const PREFERENCES: TravelPreference[] = [
  'Adventure',
  'Nature',
  'Historical',
  'Beaches',
  'Family',
  'Spiritual',
  'Food and Culture',
];

export function Dashboard() {
  const {
    dashboard,
    loading,
    isAuthenticated,
    logout,
    updateProfile,
    deleteItinerary,
  } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(dashboard?.user.name || '');
  const [homeCity, setHomeCity] = useState(dashboard?.user.homeCity || '');
  const [preferredStyle, setPreferredStyle] = useState<TravelPreference>(
    dashboard?.user.preferredStyle || 'Historical'
  );
  const [profileSaved, setProfileSaved] = useState(false);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading your traveler dashboard...
      </div>
    );
  }

  if (!isAuthenticated || !dashboard) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10">
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">
            Sign in to View Your Dashboard
          </h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Access saved Indian destinations, favorite places, customizable trip itineraries, and
            your demonstration trip history.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47]"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const savedDestObjects = ALL_DESTINATIONS.filter((d) =>
    dashboard.savedDestinations.includes(d.slug)
  );
  const favoriteDestObjects = ALL_DESTINATIONS.filter((d) =>
    dashboard.favoritePlaces.includes(d.slug)
  );

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: name.trim() || dashboard.user.name,
      homeCity: homeCity.trim() || dashboard.user.homeCity,
      preferredStyle,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold text-[#0F4C5C] mb-1">Traveler Account</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
            Welcome back, {dashboard.user.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {dashboard.user.email} <span aria-hidden="true">·</span> Home City:{' '}
            {dashboard.user.homeCity}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs text-slate-500 block">Saved Destinations</span>
          <span className="font-mono-num text-2xl font-bold text-slate-900 mt-1 block">
            {savedDestObjects.length}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs text-slate-500 block">Favorite Places</span>
          <span className="font-mono-num text-2xl font-bold text-slate-900 mt-1 block">
            {favoriteDestObjects.length}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs text-slate-500 block">Saved Itineraries</span>
          <span className="font-mono-num text-2xl font-bold text-slate-900 mt-1 block">
            {dashboard.savedItineraries.length}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs text-slate-500 block">Demo Trip Records</span>
          <span className="font-mono-num text-2xl font-bold text-slate-900 mt-1 block">
            {dashboard.bookingHistory.length}
          </span>
        </div>
      </div>

      {/* Profile Settings */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0F4C5C] mb-1">
          <User className="w-4 h-4" aria-hidden="true" />
          <span>Traveler Profile</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">
          Profile Preferences
        </h2>

        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="profile-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name || dashboard.user.name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="profile-city" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Home City
            </label>
            <input
              id="profile-city"
              type="text"
              value={homeCity || dashboard.user.homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="profile-style" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Preferred Travel Style
            </label>
            <select
              id="profile-style"
              value={preferredStyle}
              onChange={(e) => setPreferredStyle(e.target.value as TravelPreference)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {PREFERENCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47] cursor-pointer"
          >
            {profileSaved ? 'Profile Updated' : 'Update Profile'}
          </button>
        </form>
      </section>

      {/* Saved Trip Itineraries */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0F4C5C]" aria-hidden="true" />
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Saved Trip Itineraries
            </h2>
          </div>
          <Link to="/planner" className="text-xs font-semibold text-[#0F4C5C] hover:underline">
            + Plan New Trip
          </Link>
        </div>

        {dashboard.savedItineraries.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
            You have no saved itineraries yet. Open the{' '}
            <Link to="/planner" className="text-[#0F4C5C] font-semibold underline">
              Smart Trip Planner
            </Link>{' '}
            to generate and save one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {dashboard.savedItineraries.map((it) => (
              <article
                key={it.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-display text-xl font-bold text-slate-900">{it.title}</h3>
                    <button
                      type="button"
                      onClick={() => deleteItinerary(it.id)}
                      aria-label={`Delete saved itinerary ${it.title}`}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    From {it.input.startingLocation} <span aria-hidden="true">·</span>{' '}
                    {it.input.days} Days <span aria-hidden="true">·</span> {it.input.travelers}{' '}
                    Travelers <span aria-hidden="true">·</span> {it.input.budgetCategory}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{it.summary}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {it.days.reduce((acc, d) => acc + d.activities.length, 0)} planned activities
                  </span>
                  <Link
                    to={`/planner?destination=${encodeURIComponent(
                      it.input.destinationName
                    )}&slug=${encodeURIComponent(it.input.destinationSlug || '')}`}
                    className="font-semibold text-[#0F4C5C] hover:underline"
                  >
                    Open in Planner
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Saved Destinations */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[#0F4C5C]" aria-hidden="true" />
          <h2 className="font-display text-2xl font-bold text-slate-900">Saved Destinations</h2>
        </div>
        {savedDestObjects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
            No saved destinations yet. Click the bookmark button on any place while browsing.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedDestObjects.map((d) => (
              <DestinationCard key={d.slug} destination={d} />
            ))}
          </div>
        )}
      </section>

      {/* Favorite Tourist Places */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-600" aria-hidden="true" />
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Favorite Tourist Places
          </h2>
        </div>
        {favoriteDestObjects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
            No favorite tourist places yet. Tap the heart icon on any place you love.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteDestObjects.map((d) => (
              <DestinationCard key={d.slug} destination={d} />
            ))}
          </div>
        )}
      </section>

      {/* Demonstration Trip History */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Trip &amp; Demonstration Booking History
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Clearly labelled demonstration trip records for itinerary budgeting (not live commercial
            bookings).
          </p>
        </div>
        {dashboard.bookingHistory.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
            No demonstration trip records yet.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                <tr>
                  <th className="py-3 px-4 font-semibold">Destination</th>
                  <th className="py-3 px-4 font-semibold">Dates</th>
                  <th className="py-3 px-4 font-semibold">Travelers</th>
                  <th className="py-3 px-4 font-semibold">Tier</th>
                  <th className="py-3 px-4 font-semibold text-right">Est. Budget</th>
                  <th className="py-3 px-4 font-semibold">Record Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard.bookingHistory.map((bk) => (
                  <tr key={bk.id}>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {bk.destinationName}
                      <span className="block text-xs font-normal text-slate-500">
                        {bk.stateName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-num text-xs text-slate-600">
                      {bk.checkIn} to {bk.checkOut}
                    </td>
                    <td className="py-3 px-4 font-mono-num text-slate-700">{bk.travelers}</td>
                    <td className="py-3 px-4 text-slate-700">{bk.budgetTier}</td>
                    <td className="py-3 px-4 font-mono-num font-semibold text-slate-900 text-right">
                      {formatINR(bk.estimatedTotal)}
                    </td>
                    <td className="py-3 px-4 text-xs text-amber-800 font-medium">{bk.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
