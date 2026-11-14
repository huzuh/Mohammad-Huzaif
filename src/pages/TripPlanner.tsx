import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookmarkCheck,
  Calendar,
  Check,
  Edit3,
  Loader2,
  LocateFixed,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { BudgetCalculator } from '../components/BudgetCalculator';
import { MapView } from '../components/MapView';
import { useAuth } from '../context/AuthContext';
import { ALL_DESTINATIONS } from '../data/destinations';
import {
  KARNATAKA_DISTRICTS,
  MAJOR_INDIAN_STARTING_CITIES,
  resolveOriginCoordinates,
} from '../data/karnatakaDistricts';
import { INDIAN_STATES_AND_UTS } from '../data/states';
import { api } from '../services/api';
import type {
  BudgetTier,
  GeneratedItinerary,
  ItineraryActivity,
  TravelPreference,
  TripPlannerInput,
} from '../types/travel';
import {
  buildFallbackItinerary,
  calculateTripBudget,
  formatINR,
  validateTripPlannerInput,
} from '../utils/travelLogic';
import {
  findNearestStartingPoint,
  formatCoordinatesLabel,
  requestBrowserCoordinates,
  type LiveLocationResult,
} from '../utils/locationUtils';

const DEFAULT_ORIGIN = 'Bengaluru Urban (Bengaluru), Karnataka';

const PREFERENCES: TravelPreference[] = [
  'Adventure',
  'Nature',
  'Historical',
  'Beaches',
  'Family',
  'Spiritual',
  'Food and Culture',
];

const BUDGET_TIERS: BudgetTier[] = ['Budget', 'Standard', 'Premium'];

function addDaysIso(startIso: string, add: number): string {
  const d = new Date(startIso);
  if (Number.isNaN(d.getTime())) return '2026-12-15';
  d.setDate(d.getDate() + add);
  return d.toISOString().slice(0, 10);
}

export function TripPlanner() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, saveItinerary, recordDemoBooking } = useAuth();

  const initialDestSlug = searchParams.get('slug') || 'jaipur-amber-fort';
  const matchedInitial =
    ALL_DESTINATIONS.find((d) => d.slug === initialDestSlug) ||
    ALL_DESTINATIONS.find(
      (d) => d.name.toLowerCase() === (searchParams.get('destination') || '').toLowerCase()
    ) ||
    ALL_DESTINATIONS.find((d) => d.slug === 'jaipur-amber-fort');

  const initialOrigin = searchParams.get('origin') || DEFAULT_ORIGIN;
  const [startingLocation, setStartingLocation] = useState(initialOrigin);
  const [selectedSlug, setSelectedSlug] = useState(matchedInitial?.slug || 'jaipur-amber-fort');
  const [destinationName, setDestinationName] = useState(
    searchParams.get('destination') || matchedInitial?.name || 'Jaipur — Amber Fort & Pink City'
  );
  const [startDate, setStartDate] = useState('2026-12-10');
  const [endDate, setEndDate] = useState('2026-12-12');
  const [days, setDays] = useState(3);
  const [travelers, setTravelers] = useState(2);
  const [preferences, setPreferences] = useState<TravelPreference[]>([
    'Historical',
    'Food and Culture',
  ]);
  const [budgetCategory, setBudgetCategory] = useState<BudgetTier>('Standard');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(() => {
    const dest = matchedInitial;
    const state = dest ? INDIAN_STATES_AND_UTS.find((s) => s.slug === dest.stateSlug) : undefined;
    return buildFallbackItinerary(
      {
        startingLocation: initialOrigin,
        destinationName: dest?.name || 'Jaipur — Amber Fort & Pink City',
        destinationSlug: dest?.slug,
        startDate: '2026-12-10',
        endDate: '2026-12-12',
        travelers: 2,
        days: 3,
        preferences: ['Historical', 'Food and Culture'],
        budgetCategory: 'Standard',
      },
      dest,
      state
    );
  });

  // Activity editing / adding state
  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [newActTime, setNewActTime] = useState<'Morning' | 'Afternoon' | 'Evening'>('Afternoon');
  const [newActTitle, setNewActTitle] = useState('');
  const [newActDesc, setNewActDesc] = useState('');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [liveLocation, setLiveLocation] = useState<LiveLocationResult | null>(null);
  const [locatingLive, setLocatingLive] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const paramOrigin = searchParams.get('origin');
    const paramDest = searchParams.get('destination');
    const paramSlug = searchParams.get('slug');
    if (paramOrigin) {
      setStartingLocation(paramOrigin);
    }
    if (paramSlug) {
      const found = ALL_DESTINATIONS.find((d) => d.slug === paramSlug);
      if (found) {
        setSelectedSlug(found.slug);
        setDestinationName(found.name);
      }
    } else if (paramDest) {
      setDestinationName(paramDest);
    }
  }, [searchParams]);

  const activeDestination = useMemo(
    () =>
      ALL_DESTINATIONS.find(
        (d) => d.slug === selectedSlug || d.name.toLowerCase() === destinationName.toLowerCase()
      ),
    [selectedSlug, destinationName]
  );

  const handleSelectDestination = (slug: string) => {
    setSelectedSlug(slug);
    const found = ALL_DESTINATIONS.find((d) => d.slug === slug);
    if (found) {
      setDestinationName(found.name);
    }
  };

  const handleDateChange = (nextStart: string, nextEnd: string) => {
    setStartDate(nextStart);
    setEndDate(nextEnd);
    const s = new Date(nextStart);
    const e = new Date(nextEnd);
    if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && e >= s) {
      const diffDays = Math.min(21, Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1));
      setDays(diffDays);
    }
  };

  const handleDaysAdjust = (nextDays: number) => {
    const clamped = Math.max(1, Math.min(21, nextDays));
    setDays(clamped);
    if (startDate) {
      setEndDate(addDaysIso(startDate, clamped - 1));
    }
  };

  const togglePreference = (pref: TravelPreference) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

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
      setStartingLocation(resolved.label);
      setFormErrors((prev) => {
        if (!prev.startingLocation) return prev;
        const next = { ...prev };
        delete next.startingLocation;
        return next;
      });
    } catch (err) {
      setLocationError((err as Error).message || 'Could not fetch live location.');
    } finally {
      setLocatingLive(false);
    }
  };

  const handleClearLiveLocation = () => {
    setLiveLocation(null);
    setLocationError(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);
    setBookingMessage(null);

    const payload: TripPlannerInput = {
      startingLocation: startingLocation.trim(),
      destinationName: destinationName.trim(),
      destinationSlug: activeDestination?.slug,
      startDate,
      endDate,
      travelers,
      days,
      preferences,
      budgetCategory,
    };

    const validation = validateTripPlannerInput(payload);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setGenerating(true);
    try {
      const generated = await api.generateItinerary(payload);
      setItinerary(generated);
    } catch {
      const state = activeDestination
        ? INDIAN_STATES_AND_UTS.find((s) => s.slug === activeDestination.stateSlug)
        : undefined;
      setItinerary(buildFallbackItinerary(payload, activeDestination, state));
    } finally {
      setGenerating(false);
    }
  };

  const handleRemoveActivity = (dayNumber: number, activityId: string) => {
    if (!itinerary) return;
    setItinerary({
      ...itinerary,
      days: itinerary.days.map((d) =>
        d.day === dayNumber
          ? { ...d, activities: d.activities.filter((a) => a.id !== activityId) }
          : d
      ),
    });
  };

  const startEditActivity = (act: ItineraryActivity) => {
    setEditingActivityId(act.id);
    setEditTitle(act.title);
    setEditDesc(act.description);
  };

  const saveEditActivity = (dayNumber: number, activityId: string) => {
    if (!itinerary || !editTitle.trim()) return;
    setItinerary({
      ...itinerary,
      days: itinerary.days.map((d) =>
        d.day === dayNumber
          ? {
              ...d,
              activities: d.activities.map((a) =>
                a.id === activityId
                  ? { ...a, title: editTitle.trim(), description: editDesc.trim() }
                  : a
              ),
            }
          : d
      ),
    });
    setEditingActivityId(null);
  };

  const handleAddActivity = (dayNumber: number) => {
    if (!itinerary || !newActTitle.trim()) return;
    const newItem: ItineraryActivity = {
      id: `custom-${Date.now()}`,
      timeOfDay: newActTime,
      title: newActTitle.trim(),
      description: newActDesc.trim() || 'Custom planned stop.',
    };
    setItinerary({
      ...itinerary,
      days: itinerary.days.map((d) =>
        d.day === dayNumber ? { ...d, activities: [...d.activities, newItem] } : d
      ),
    });
    setNewActTitle('');
    setNewActDesc('');
    setAddingDay(null);
  };

  const handleSaveToDashboard = async () => {
    if (!itinerary) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await saveItinerary(itinerary);
    setSaveMessage('Itinerary saved to your traveler dashboard.');
  };

  const handleDemoBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const estimate = calculateTripBudget({
      days,
      travelers,
      budgetTier: budgetCategory,
      destination: activeDestination,
    });
    await recordDemoBooking({
      destinationName,
      stateName: activeDestination?.stateName || 'India',
      checkIn: startDate,
      checkOut: endDate,
      travelers,
      budgetTier: budgetCategory,
      estimatedTotal: estimate.totalCost,
    });
    setBookingMessage(
      'Demonstration trip reservation recorded in your Dashboard Trip History (no live payment or external booking made).'
    );
  };

  const usingLiveOrigin = Boolean(
    liveLocation && startingLocation.trim() === liveLocation.label.trim()
  );
  const originCoords = usingLiveOrigin && liveLocation
    ? liveLocation.coordinates
    : resolveOriginCoordinates(startingLocation);
  const destCoords: [number, number] = activeDestination?.coordinates || [26.9124, 75.7873];
  const mapMarkers = [
    {
      name: startingLocation || 'Origin',
      coordinates: originCoords,
      subtitle:
        usingLiveOrigin && liveLocation
          ? `Live GPS Origin (${formatCoordinatesLabel(liveLocation.coordinates)})`
          : 'Starting Point',
      primary: false,
    },
    {
      name: destinationName,
      coordinates: destCoords,
      subtitle: activeDestination
        ? `${activeDestination.stateName} · ${activeDestination.category}`
        : 'Selected Destination',
      primary: true,
    },
  ];

  const allOriginOptions = [
    ...KARNATAKA_DISTRICTS.map((d) => d.originLabel),
    ...MAJOR_INDIAN_STARTING_CITIES.map((c) => c.label),
  ];
  const selectedOriginDropdownValue = allOriginOptions.includes(startingLocation)
    ? startingLocation
    : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-3xl mb-10">
        <p className="text-xs font-semibold text-[#0F4C5C] mb-2">
          AI-Powered Indian Itinerary Engine
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4">
          Smart Trip Planner &amp; Budget Estimator
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Enter your origin city, destination, travel dates, group size, and style preferences to
          build a customizable day-by-day Indian itinerary with live cost estimates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Planner Configuration Form */}
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-5"
        >
          <h2 className="font-display text-2xl font-bold text-slate-900 pb-3 border-b border-slate-100">
            Trip Parameters
          </h2>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label
                htmlFor="planner-origin-select"
                className="block text-xs font-semibold text-slate-700"
              >
                Starting Location (Karnataka Districts &amp; Major Cities)
              </label>
              <button
                type="button"
                onClick={handleFetchLiveLocation}
                disabled={locatingLive}
                data-testid="fetch-live-location-btn"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#0F4C5C] bg-[#0F4C5C]/8 border border-[#0F4C5C]/25 rounded-md hover:bg-[#0F4C5C] hover:text-white disabled:opacity-60 transition-colors cursor-pointer"
              >
                {locatingLive ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    <span>Fetching Location...</span>
                  </>
                ) : (
                  <>
                    <LocateFixed className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{usingLiveOrigin ? 'Refresh Live Location' : 'Use Live Location'}</span>
                  </>
                )}
              </button>
            </div>
            <select
              id="planner-origin-select"
              value={selectedOriginDropdownValue}
              onChange={(e) => {
                if (e.target.value) setStartingLocation(e.target.value);
              }}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0F4C5C] mb-2"
            >
              {!selectedOriginDropdownValue && (
                <option value="">
                  {usingLiveOrigin ? `Live GPS: ${startingLocation}` : 'Custom Starting Location'}
                </option>
              )}
              <optgroup label="Karnataka — All 31 Districts">
                {KARNATAKA_DISTRICTS.map((d) => (
                  <option key={d.slug} value={d.originLabel}>
                    {d.name}
                    {d.headquarters !== d.name ? ` (${d.headquarters})` : ''} — {d.region}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Major Indian Cities">
                {MAJOR_INDIAN_STARTING_CITIES.map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
            </select>
            <label htmlFor="planner-origin" className="sr-only">
              Or type a custom starting city or district
            </label>
            <input
              id="planner-origin"
              list="indian-origin-cities"
              value={startingLocation}
              onChange={(e) => setStartingLocation(e.target.value)}
              placeholder="Or type any starting district or city (e.g., Mysuru, Udupi, Mumbai)"
              className="w-full px-3.5 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
            />
            <datalist id="indian-origin-cities">
              {KARNATAKA_DISTRICTS.map((d) => (
                <option key={d.slug} value={d.originLabel} />
              ))}
              {MAJOR_INDIAN_STARTING_CITIES.map((c) => (
                <option key={c.label} value={c.label} />
              ))}
            </datalist>

            {usingLiveOrigin && liveLocation && (
              <div
                data-testid="live-location-status"
                className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start justify-between gap-2"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="font-semibold">
                    Live Location Active · {liveLocation.label}
                  </p>
                  <p className="font-mono-num text-[11px] text-emerald-800">
                    {formatCoordinatesLabel(liveLocation.coordinates)}
                    {typeof liveLocation.accuracyMeters === 'number'
                      ? ` (±${liveLocation.accuracyMeters} m)`
                      : ''}
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Nearest hub: {liveLocation.nearestDistrictOrCity} (
                    {liveLocation.distanceToNearestKm} km)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearLiveLocation}
                  aria-label="Clear live location indicator"
                  className="p-1 text-emerald-700 hover:text-emerald-950 rounded cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}

            {locationError && (
              <p
                role="alert"
                data-testid="live-location-error"
                className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700"
              >
                {locationError}
              </p>
            )}

            {formErrors.startingLocation && (
              <p className="text-xs text-rose-600 mt-1">{formErrors.startingLocation}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="planner-destination-select"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Choose Destination across India
            </label>
            <select
              id="planner-destination-select"
              value={selectedSlug}
              onChange={(e) => handleSelectDestination(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0F4C5C] mb-2"
            >
              {ALL_DESTINATIONS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name} ({d.stateName})
                </option>
              ))}
            </select>
            <label htmlFor="planner-destination-custom" className="sr-only">
              Or type a custom destination name
            </label>
            <input
              id="planner-destination-custom"
              type="text"
              value={destinationName}
              onChange={(e) => setDestinationName(e.target.value)}
              placeholder="Or type any destination name"
              className="w-full px-3.5 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
            />
            {formErrors.destinationName && (
              <p className="text-xs text-rose-600 mt-1">{formErrors.destinationName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="planner-start-date"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Travel Start Date
              </label>
              <input
                id="planner-start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange(e.target.value, endDate)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
              />
              {formErrors.startDate && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.startDate}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="planner-end-date"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Travel End Date
              </label>
              <input
                id="planner-end-date"
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange(startDate, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
              />
              {formErrors.endDate && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.endDate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="planner-travelers"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Number of Travelers
              </label>
              <input
                id="planner-travelers"
                type="number"
                min={1}
                max={20}
                value={travelers}
                onChange={(e) => setTravelers(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                className="w-full font-mono-num px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
              />
            </div>
            <div>
              <label
                htmlFor="planner-days"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Number of Days
              </label>
              <input
                id="planner-days"
                type="number"
                min={1}
                max={21}
                value={days}
                onChange={(e) => handleDaysAdjust(Number(e.target.value) || 1)}
                className="w-full font-mono-num px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-2">
              Budget Category
            </span>
            <div className="grid grid-cols-3 gap-2">
              {BUDGET_TIERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setBudgetCategory(tier)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    budgetCategory === tier
                      ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-2">
              Travel Preferences
            </span>
            <div className="flex flex-wrap gap-2">
              {PREFERENCES.map((pref) => {
                const active = preferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => togglePreference(pref)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47] disabled:opacity-60 transition-colors cursor-pointer"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Generating Itinerary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Generate Itinerary</span>
              </>
            )}
          </button>
        </form>

        {/* Right: Editable Day-by-Day Itinerary */}
        <div className="lg:col-span-7 space-y-8">
          {itinerary && (
            <section
              aria-labelledby="generated-itinerary-heading"
              className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-[#0F4C5C] mb-1">
                    {itinerary.generatedBy === 'ai'
                      ? 'AI-Tailored Route Plan'
                      : 'Curated Route Plan'}{' '}
                    <span aria-hidden="true">·</span> Best Season: {itinerary.bestSeasonNote}
                  </p>
                  <h2
                    id="generated-itinerary-heading"
                    className="font-display text-2xl sm:text-3xl font-bold text-slate-900"
                  >
                    {itinerary.title}
                  </h2>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {itinerary.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSaveToDashboard}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
                    <span>Save Itinerary</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDemoBooking}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-amber-100 border border-amber-300 rounded-lg hover:bg-amber-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    <span>Demo Trip Record</span>
                  </button>
                </div>
              </div>

              {saveMessage && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3">
                  <span>{saveMessage}</span>
                  <Link to="/dashboard" className="font-semibold underline">
                    Open Dashboard
                  </Link>
                </div>
              )}

              {bookingMessage && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                  <span>{bookingMessage}</span>
                  <Link to="/dashboard" className="font-semibold underline">
                    View History
                  </Link>
                </div>
              )}

              {/* Day by Day Cards */}
              <div className="mt-6 space-y-6" data-testid="itinerary-days-list">
                {itinerary.days.map((dayObj) => (
                  <div
                    key={dayObj.day}
                    className="border border-slate-200 rounded-xl p-5 bg-slate-50/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200">
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        Day {dayObj.day}: {dayObj.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setAddingDay(addingDay === dayObj.day ? null : dayObj.day)
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F4C5C] hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Add Activity to Day {dayObj.day}</span>
                      </button>
                    </div>

                    {/* Add new activity inline drawer */}
                    {addingDay === dayObj.day && (
                      <div className="mb-4 p-4 bg-white border border-slate-200 rounded-lg space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <select
                            aria-label="Time of day"
                            value={newActTime}
                            onChange={(e) =>
                              setNewActTime(
                                e.target.value as 'Morning' | 'Afternoon' | 'Evening'
                              )
                            }
                            className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                          >
                            <option value="Morning">Morning</option>
                            <option value="Afternoon">Afternoon</option>
                            <option value="Evening">Evening</option>
                          </select>
                          <input
                            type="text"
                            value={newActTitle}
                            onChange={(e) => setNewActTitle(e.target.value)}
                            placeholder="Activity title (e.g., Sunrise at Nahargarh Fort)"
                            aria-label="New activity title"
                            className="sm:col-span-2 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                          />
                        </div>
                        <input
                          type="text"
                          value={newActDesc}
                          onChange={(e) => setNewActDesc(e.target.value)}
                          placeholder="Short description or food note"
                          aria-label="New activity description"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setAddingDay(null)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddActivity(dayObj.day)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47] cursor-pointer"
                          >
                            Add Activity
                          </button>
                        </div>
                      </div>
                    )}

                    <ul className="space-y-3">
                      {dayObj.activities.length === 0 ? (
                        <li className="text-xs text-slate-500 italic py-2">
                          No activities scheduled for Day {dayObj.day}. Click “Add Activity” above
                          to add one.
                        </li>
                      ) : (
                        dayObj.activities.map((act) => (
                          <li
                            key={act.id}
                            className="bg-white border border-slate-200/80 rounded-lg p-3.5"
                          >
                            {editingActivityId === act.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  aria-label="Edit activity title"
                                  className="w-full px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-md"
                                />
                                <textarea
                                  rows={2}
                                  value={editDesc}
                                  onChange={(e) => setEditDesc(e.target.value)}
                                  aria-label="Edit activity description"
                                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingActivityId(null)}
                                    className="px-2.5 py-1 text-xs text-slate-600 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => saveEditActivity(dayObj.day, act.id)}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#0F4C5C] rounded-md cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>Save</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-[11px] font-semibold text-[#0F4C5C]">
                                    {act.timeOfDay}
                                  </p>
                                  <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                                    {act.title}
                                  </h4>
                                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    {act.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => startEditActivity(act)}
                                    aria-label={`Edit "${act.title}"`}
                                    className="p-1.5 text-slate-400 hover:text-[#0F4C5C] rounded-md hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveActivity(dayObj.day, act.id)}
                                    aria-label={`Remove "${act.title}"`}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Synced Budget Calculator */}
          <BudgetCalculator
            destination={activeDestination}
            initialDays={days}
            initialTravelers={travelers}
            initialTier={budgetCategory}
            onDaysChange={handleDaysAdjust}
            onTravelersChange={setTravelers}
            onTierChange={setBudgetCategory}
          />

          {/* Route Map */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0F4C5C]" aria-hidden="true" />
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  Route Map: {startingLocation} to {destinationName}
                </h2>
              </div>
              <span className="font-mono-num text-xs text-slate-500">
                {formatINR(
                  calculateTripBudget({
                    days,
                    travelers,
                    budgetTier: budgetCategory,
                    destination: activeDestination,
                  }).totalCost
                )}{' '}
                est.
              </span>
            </div>
            <MapView
              center={destCoords}
              zoom={6}
              markers={mapMarkers}
              routePoints={[originCoords, destCoords]}
              heightClass="h-80"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
