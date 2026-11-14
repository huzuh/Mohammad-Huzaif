import type {
  BudgetBreakdown,
  BudgetTier,
  Destination,
  GeneratedItinerary,
  IndiaZone,
  ItineraryDay,
  RegionType,
  StateRegion,
  TravelCategory,
  TravelPreference,
  TripPlannerInput,
} from '../types/travel';

export const TIER_MULTIPLIERS: Record<BudgetTier, number> = {
  Budget: 0.75,
  Standard: 1.0,
  Premium: 2.1,
};

export const INTERCITY_TRANSPORT_PER_PERSON: Record<BudgetTier, number> = {
  Budget: 2400,
  Standard: 5200,
  Premium: 11800,
};

export interface BudgetCalculationParams {
  days: number;
  travelers: number;
  budgetTier: BudgetTier;
  destination?: Destination;
  customIntercityPerPerson?: number;
}

export function calculateTripBudget(params: BudgetCalculationParams): BudgetBreakdown {
  const days = Math.max(1, Math.min(30, Math.round(params.days || 1)));
  const travelers = Math.max(1, Math.min(20, Math.round(params.travelers || 1)));
  const multiplier = TIER_MULTIPLIERS[params.budgetTier];

  const baseCost = params.destination?.costEstimate ?? {
    accommodationPerNight: 2000,
    foodPerDay: 750,
    localTransportPerDay: 650,
    entryFeesTotal: 200,
  };

  const rooms = Math.ceil(travelers / 2);
  const nights = Math.max(1, days - 1);
  const vehicleUnits = Math.ceil(travelers / 4);

  const intercityPerPerson =
    typeof params.customIntercityPerPerson === 'number' && params.customIntercityPerPerson >= 0
      ? params.customIntercityPerPerson
      : INTERCITY_TRANSPORT_PER_PERSON[params.budgetTier];

  const transportation = Math.round(travelers * intercityPerPerson);
  const accommodation = Math.round(rooms * nights * baseCost.accommodationPerNight * multiplier);
  const food = Math.round(travelers * days * baseCost.foodPerDay * multiplier);
  const localTravel = Math.round(days * baseCost.localTransportPerDay * vehicleUnits * multiplier);
  const entryTickets = Math.round(
    travelers * baseCost.entryFeesTotal * Math.max(1, Math.ceil(days / 3))
  );
  const otherExpenses = Math.round((food + localTravel) * 0.12);

  const totalCost =
    transportation + accommodation + food + localTravel + entryTickets + otherExpenses;
  const perPersonCost = Math.round(totalCost / travelers);
  const dailyCost = Math.round(totalCost / days);

  return {
    transportation,
    accommodation,
    food,
    localTravel,
    entryTickets,
    otherExpenses,
    totalCost,
    perPersonCost,
    dailyCost,
    tierMultiplier: multiplier,
  };
}

export interface DestinationFilterOptions {
  query?: string;
  stateSlug?: string;
  category?: TravelCategory | 'All';
  budgetTier?: BudgetTier | 'All';
  preference?: TravelPreference | 'All';
  sortBy?: 'popular' | 'cost-asc' | 'cost-desc' | 'name-asc';
}

export function filterAndSortDestinations(
  destinations: Destination[],
  options: DestinationFilterOptions
): Destination[] {
  const q = (options.query ?? '').trim().toLowerCase();
  const stateSlug = options.stateSlug && options.stateSlug !== 'All' ? options.stateSlug : null;
  const category = options.category && options.category !== 'All' ? options.category : null;
  const budgetTier = options.budgetTier && options.budgetTier !== 'All' ? options.budgetTier : null;
  const preference = options.preference && options.preference !== 'All' ? options.preference : null;

  const filtered = destinations.filter((dest) => {
    if (stateSlug && dest.stateSlug !== stateSlug) return false;
    if (category && dest.category !== category) return false;
    if (preference && !dest.preferences.includes(preference)) return false;

    if (budgetTier === 'Budget' && dest.estimatedVisitingCost > 3200) return false;
    if (
      budgetTier === 'Standard' &&
      (dest.estimatedVisitingCost < 2600 || dest.estimatedVisitingCost > 4800)
    ) {
      return false;
    }
    if (budgetTier === 'Premium' && dest.estimatedVisitingCost < 4000) return false;

    if (q) {
      const haystack = [
        dest.name,
        dest.stateName,
        dest.location,
        dest.category,
        dest.shortDescription,
        ...dest.famousAttractions,
        ...dest.preferences,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const sortBy = options.sortBy ?? 'popular';
  return [...filtered].sort((a, b) => {
    if (sortBy === 'cost-asc') return a.estimatedVisitingCost - b.estimatedVisitingCost;
    if (sortBy === 'cost-desc') return b.estimatedVisitingCost - a.estimatedVisitingCost;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    const scoreA = (a.featured ? 4 : 0) + (a.popular ? 2 : 0) + (a.trending ? 1 : 0);
    const scoreB = (b.featured ? 4 : 0) + (b.popular ? 2 : 0) + (b.trending ? 1 : 0);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });
}

export interface StateFilterOptions {
  query?: string;
  type?: RegionType | 'All';
  zone?: IndiaZone | 'All';
  sortBy?: 'name-asc' | 'budget-asc' | 'budget-desc';
}

export function filterAndSortStates(
  states: StateRegion[],
  options: StateFilterOptions
): StateRegion[] {
  const q = (options.query ?? '').trim().toLowerCase();
  const type = options.type && options.type !== 'All' ? options.type : null;
  const zone = options.zone && options.zone !== 'All' ? options.zone : null;

  const filtered = states.filter((st) => {
    if (type && st.type !== type) return false;
    if (zone && st.zone !== zone) return false;
    if (q) {
      const haystack = [
        st.name,
        st.capital,
        st.tagline,
        st.zone,
        ...st.highlights,
        ...st.famousFood,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sortBy = options.sortBy ?? 'name-asc';
  return [...filtered].sort((a, b) => {
    if (sortBy === 'budget-asc') return a.dailyBudget.standard - b.dailyBudget.standard;
    if (sortBy === 'budget-desc') return b.dailyBudget.standard - a.dailyBudget.standard;
    return a.name.localeCompare(b.name);
  });
}

export function buildFallbackItinerary(
  input: TripPlannerInput,
  destination?: Destination,
  state?: StateRegion
): GeneratedItinerary {
  const totalDays = Math.max(1, Math.min(14, Math.round(input.days || 3)));
  const destName = destination?.name ?? input.destinationName;
  const attractions = destination?.famousAttractions ?? [
    `${destName} Heritage Quarter`,
    `${destName} Scenic Viewpoint`,
    `${destName} Local Bazaar`,
  ];
  const thingsToDo = destination?.thingsToDo ?? [
    `Explore signature landmarks in ${destName}`,
    `Sample authentic regional dishes`,
    `Evening heritage walk`,
  ];
  const nearby = destination?.nearbyPlaces ?? ['Nearby scenic lookout', 'Regional craft village'];
  const foods = state?.famousFood ?? ['Regional Thali', 'Local Street Delicacies'];
  const tierLabel = input.budgetCategory;
  const prefLine =
    input.preferences.length > 0 ? input.preferences.join(', ') : 'Sightseeing & Culture';

  const days: ItineraryDay[] = [];

  for (let d = 1; d <= totalDays; d++) {
    const dayPrefix = `d${d}`;
    if (d === 1) {
      days.push({
        day: 1,
        title: `Arrival in ${destName} & First Impressions`,
        activities: [
          {
            id: `${dayPrefix}-1`,
            timeOfDay: 'Morning',
            title: `Arrival from ${input.startingLocation} & ${tierLabel} Check-in`,
            description: `Arrive in ${destName}, transfer to your ${tierLabel.toLowerCase()} stay, and freshen up for an unhurried afternoon.`,
          },
          {
            id: `${dayPrefix}-2`,
            timeOfDay: 'Afternoon',
            title: `Visit ${attractions[0] ?? destName}`,
            description: `Begin exploring ${destName} with its signature highlight (${attractions[0] ?? 'central precinct'}) tailored for ${prefLine}.`,
          },
          {
            id: `${dayPrefix}-3`,
            timeOfDay: 'Evening',
            title: `Welcome Regional Dinner (${foods[0] ?? 'Local Specialties'})`,
            description: `Evening orientation stroll and dinner featuring authentic ${foods.slice(0, 2).join(' and ')}.`,
          },
        ],
      });
    } else if (d === totalDays) {
      days.push({
        day: d,
        title: `Artisan Markets & Return to ${input.startingLocation}`,
        activities: [
          {
            id: `${dayPrefix}-1`,
            timeOfDay: 'Morning',
            title: `Morning Visit to ${nearby[0] ?? attractions[attractions.length - 1] ?? destName}`,
            description: `Catch tranquil early-morning light around ${nearby[0] ?? destName} before checking out.`,
          },
          {
            id: `${dayPrefix}-2`,
            timeOfDay: 'Afternoon',
            title: 'Local Crafts Shopping & Farewell Lunch',
            description: `Pick up regional handicrafts and enjoy a farewell meal (${foods[1] ?? foods[0] ?? 'local feast'}).`,
          },
          {
            id: `${dayPrefix}-3`,
            timeOfDay: 'Evening',
            title: `Departure Back to ${input.startingLocation}`,
            description: `Transfer to station or airport for your onward journey home to ${input.startingLocation}.`,
          },
        ],
      });
    } else {
      const attrIndex = (d - 1) % attractions.length;
      const todoIndex = (d - 2) % thingsToDo.length;
      const nearbyIndex = (d - 2) % nearby.length;
      days.push({
        day: d,
        title: `${attractions[attrIndex] ?? destName} & Local Experiences`,
        activities: [
          {
            id: `${dayPrefix}-1`,
            timeOfDay: 'Morning',
            title: `Explore ${attractions[attrIndex] ?? destName}`,
            description: `Beat midday crowds with an early start at ${attractions[attrIndex] ?? destName}.`,
          },
          {
            id: `${dayPrefix}-2`,
            timeOfDay: 'Afternoon',
            title: thingsToDo[todoIndex] ?? `Guided Sightseeing in ${destName}`,
            description: `Focused ${prefLine.toLowerCase()} experience plus excursion toward ${nearby[nearbyIndex] ?? 'scenic viewpoints'}.`,
          },
          {
            id: `${dayPrefix}-3`,
            timeOfDay: 'Evening',
            title: `Sunset Viewpoint & ${foods[d % foods.length] ?? 'Cultural Evening'}`,
            description: `Unwind at sunset and sample evening regional specialties in town.`,
          },
        ],
      });
    }
  }

  return {
    id: `itinerary-${Date.now()}`,
    title: `${totalDays}-Day ${destName} ${tierLabel} Journey`,
    input: { ...input, days: totalDays },
    summary: `A curated ${totalDays}-day ${tierLabel.toLowerCase()} itinerary from ${input.startingLocation} to ${destName} for ${input.travelers} ${input.travelers === 1 ? 'traveler' : 'travelers'}, focused on ${prefLine}.`,
    bestSeasonNote: destination?.bestTimeToVisit ?? state?.bestTimeToVisit ?? 'October to March',
    days,
    generatedBy: 'planner',
    createdAt: new Date().toISOString(),
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }
  if (!EMAIL_RE.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!data.subject.trim() || data.subject.trim().length < 3) {
    errors.subject = 'Please enter a subject (at least 3 characters).';
  }
  if (!data.message.trim() || data.message.trim().length < 10) {
    errors.message = 'Please write a message of at least 10 characters.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateTripPlannerInput(input: TripPlannerInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!input.startingLocation.trim()) {
    errors.startingLocation = 'Starting city is required.';
  }
  if (!input.destinationName.trim()) {
    errors.destinationName = 'Please select or enter a destination.';
  }
  if (!input.startDate) {
    errors.startDate = 'Start date is required.';
  }
  if (!input.endDate) {
    errors.endDate = 'End date is required.';
  } else if (input.startDate && input.endDate < input.startDate) {
    errors.endDate = 'End date cannot be earlier than start date.';
  }
  if (input.travelers < 1 || input.travelers > 20) {
    errors.travelers = 'Travelers must be between 1 and 20.';
  }
  if (input.days < 1 || input.days > 21) {
    errors.days = 'Trip duration must be between 1 and 21 days.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateRegisterForm(data: {
  name: string;
  email: string;
  password: string;
  homeCity?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }
  if (!EMAIL_RE.test(data.email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }
  if (!data.password || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLoginForm(data: { email: string; password: string }): ValidationResult {
  const errors: Record<string, string> = {};
  if (!EMAIL_RE.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!data.password) {
    errors.password = 'Password is required.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}
