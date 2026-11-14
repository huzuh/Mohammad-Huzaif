import test from 'node:test';
import assert from 'node:assert/strict';
import { INDIAN_STATES_AND_UTS } from '../data/states';
import { ALL_DESTINATIONS, getDestinationsByState } from '../data/destinations';
import { KARNATAKA_DISTRICTS, resolveOriginCoordinates } from '../data/karnatakaDistricts';
import {
  buildLocationLabelFromReverseGeocode,
  findNearestStartingPoint,
  formatCoordinatesLabel,
  haversineDistanceKm,
  sortDestinationsByDistance,
} from './locationUtils';
import {
  buildFallbackItinerary,
  calculateTripBudget,
  filterAndSortDestinations,
  filterAndSortStates,
  validateContactForm,
  validateTripPlannerInput,
} from './travelLogic';

test('dataset includes all 28 Indian states and 8 union territories with 5+ destinations each', () => {
  const states = INDIAN_STATES_AND_UTS.filter((s) => s.type === 'State');
  const uts = INDIAN_STATES_AND_UTS.filter((s) => s.type === 'Union Territory');
  assert.equal(states.length, 28);
  assert.equal(uts.length, 8);
  assert.equal(INDIAN_STATES_AND_UTS.length, 36);

  for (const region of INDIAN_STATES_AND_UTS) {
    const places = getDestinationsByState(region.slug);
    assert.ok(
      places.length >= 5,
      `Expected at least 5 destinations for ${region.name}, found ${places.length}`
    );
  }
});

test('calculateTripBudget scales correctly across budget tiers and travelers', () => {
  const jaipur = ALL_DESTINATIONS.find((d) => d.slug === 'jaipur-amber-fort');
  assert.ok(jaipur);

  const std2 = calculateTripBudget({
    days: 3,
    travelers: 2,
    budgetTier: 'Standard',
    destination: jaipur,
  });
  const prem4 = calculateTripBudget({
    days: 3,
    travelers: 4,
    budgetTier: 'Premium',
    destination: jaipur,
  });

  assert.equal(std2.totalCost, std2.transportation + std2.accommodation + std2.food + std2.localTravel + std2.entryTickets + std2.otherExpenses);
  assert.equal(std2.perPersonCost, Math.round(std2.totalCost / 2));
  assert.equal(std2.dailyCost, Math.round(std2.totalCost / 3));
  assert.ok(prem4.totalCost > std2.totalCost * 2);
});

test('filterAndSortDestinations filters by query, category, and state cleanly', () => {
  const rajasthanHistorical = filterAndSortDestinations(ALL_DESTINATIONS, {
    stateSlug: 'rajasthan',
    category: 'Historical Places',
  });
  assert.ok(rajasthanHistorical.length >= 3);
  assert.ok(rajasthanHistorical.every((d) => d.stateSlug === 'rajasthan'));

  const emptySearch = filterAndSortDestinations(ALL_DESTINATIONS, {
    query: 'zzzz_nonexistent_place_xyz',
  });
  assert.equal(emptySearch.length, 0);
});

test('filterAndSortStates separates States and Union Territories', () => {
  const onlyUts = filterAndSortStates(INDIAN_STATES_AND_UTS, { type: 'Union Territory' });
  assert.equal(onlyUts.length, 8);
  const ladakhMatch = filterAndSortStates(INDIAN_STATES_AND_UTS, { query: 'Pangong' });
  assert.ok(ladakhMatch.some((s) => s.slug === 'ladakh'));
});

test('buildFallbackItinerary creates matching number of days and editable activities', () => {
  const itinerary = buildFallbackItinerary({
    startingLocation: 'Mumbai',
    destinationName: 'Jaipur — Amber Fort & Pink City',
    destinationSlug: 'jaipur-amber-fort',
    startDate: '2026-12-10',
    endDate: '2026-12-13',
    travelers: 2,
    days: 4,
    preferences: ['Historical', 'Food and Culture'],
    budgetCategory: 'Standard',
  });

  assert.equal(itinerary.days.length, 4);
  assert.ok(itinerary.days.every((day) => day.activities.length === 3));
  assert.ok(itinerary.days[0].activities[0].title.includes('Mumbai'));
});

test('form validations catch missing/invalid inputs and accept valid submissions', () => {
  const badContact = validateContactForm({ name: 'A', email: 'bad', subject: 'Hi', message: 'Short' });
  assert.equal(badContact.valid, false);
  assert.ok(badContact.errors.name && badContact.errors.email && badContact.errors.message);

  const goodContact = validateContactForm({
    name: 'Priya Nair',
    email: 'priya@example.com',
    subject: 'Kerala 5-day custom trip',
    message: 'Looking for recommendations between Munnar and Alleppey in December.',
  });
  assert.equal(goodContact.valid, true);

  const badPlanner = validateTripPlannerInput({
    startingLocation: '',
    destinationName: 'Goa',
    startDate: '2026-12-15',
    endDate: '2026-12-12',
    travelers: 2,
    days: 3,
    preferences: [],
    budgetCategory: 'Standard',
  });
  assert.equal(badPlanner.valid, false);
  assert.ok(badPlanner.errors.startingLocation && badPlanner.errors.endDate);
});

test('includes all 31 Karnataka districts with valid coordinates and origin lookup', () => {
  assert.equal(KARNATAKA_DISTRICTS.length, 31);
  const uniqueNames = new Set(KARNATAKA_DISTRICTS.map((d) => d.name));
  assert.equal(uniqueNames.size, 31);

  for (const dist of KARNATAKA_DISTRICTS) {
    assert.ok(
      dist.coordinates[0] >= 11.5 && dist.coordinates[0] <= 18.5,
      `Latitude out of Karnataka range for ${dist.name}`
    );
    assert.ok(
      dist.coordinates[1] >= 74.0 && dist.coordinates[1] <= 78.7,
      `Longitude out of Karnataka range for ${dist.name}`
    );
    const resolved = resolveOriginCoordinates(dist.originLabel);
    assert.deepEqual(resolved, dist.coordinates);
  }

  assert.deepEqual(resolveOriginCoordinates('Mangaluru'), [12.9141, 74.856]);
  assert.deepEqual(resolveOriginCoordinates('Mumbai'), [19.076, 72.8777]);
});

test('live location utilities calculate distances, nearest districts/cities, and sort destinations', () => {
  assert.equal(haversineDistanceKm([12.9716, 77.5946], [12.9716, 77.5946]), 0);
  const blrToMys = haversineDistanceKm([12.9716, 77.5946], [12.2958, 76.6394]);
  assert.ok(blrToMys > 120 && blrToMys < 140);

  const nearUdupi = findNearestStartingPoint([13.352, 74.786]);
  assert.equal(nearUdupi.name, 'Udupi');
  assert.equal(nearUdupi.isKarnatakaDistrict, true);
  assert.ok(nearUdupi.distanceKm < 10);

  const nearMumbai = findNearestStartingPoint([19.08, 72.88]);
  assert.equal(nearMumbai.label, 'Mumbai');

  assert.equal(formatCoordinatesLabel([13.3409, 74.7421]), '13.3409° N, 74.7421° E');
  assert.equal(
    buildLocationLabelFromReverseGeocode({ city: 'Mysuru', state: 'Karnataka' }, [12.2958, 76.6394]),
    'Mysuru, Karnataka'
  );
  assert.equal(
    buildLocationLabelFromReverseGeocode(
      { county: 'Udupi district', state: 'Karnataka' },
      [13.3409, 74.7421]
    ),
    'Udupi, Karnataka'
  );

  const sortedFromBengaluru = sortDestinationsByDistance(ALL_DESTINATIONS, [12.9716, 77.5946]);
  assert.equal(sortedFromBengaluru.length, ALL_DESTINATIONS.length);
  assert.ok(sortedFromBengaluru[0].distanceKm <= sortedFromBengaluru[1].distanceKm);
  assert.ok(sortedFromBengaluru[0].distanceKm < 150);

  const sortedFromMysuru = sortDestinationsByDistance(ALL_DESTINATIONS, [12.2958, 76.6394]);
  assert.equal(sortedFromMysuru[0].destination.stateSlug, 'karnataka');
  assert.ok(sortedFromMysuru[0].distanceKm < 10);
});
