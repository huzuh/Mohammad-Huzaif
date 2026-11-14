export type RegionType = 'State' | 'Union Territory';

export type IndiaZone =
  | 'North'
  | 'South'
  | 'East'
  | 'West'
  | 'Central'
  | 'Northeast'
  | 'Islands';

export type TravelCategory =
  | 'Mountains'
  | 'Beaches'
  | 'Historical Places'
  | 'Wildlife'
  | 'Religious Places'
  | 'Adventure Tourism';

export type TravelPreference =
  | 'Adventure'
  | 'Nature'
  | 'Historical'
  | 'Beaches'
  | 'Family'
  | 'Spiritual'
  | 'Food and Culture';

export type BudgetTier = 'Budget' | 'Standard' | 'Premium';

export type ImageKey =
  | 'hero_palace'
  | 'mountains'
  | 'beaches'
  | 'heritage'
  | 'backwaters'
  | 'spiritual'
  | 'wildlife'
  | 'northeast';

export interface DailyBudgetRange {
  budget: number;
  standard: number;
  premium: number;
}

export interface StateRegion {
  slug: string;
  name: string;
  type: RegionType;
  zone: IndiaZone;
  capital: string;
  tagline: string;
  description: string;
  bestTimeToVisit: string;
  famousFood: string[];
  cultureAndTraditions: string;
  popularActivities: string[];
  dailyBudget: DailyBudgetRange;
  coordinates: [number, number];
  imageKey: ImageKey;
  cropPosition?: string;
  highlights: string[];
}

export interface DestinationCostEstimate {
  accommodationPerNight: number;
  foodPerDay: number;
  localTransportPerDay: number;
  entryFeesTotal: number;
}

export interface Destination {
  slug: string;
  name: string;
  stateSlug: string;
  stateName: string;
  location: string;
  category: TravelCategory;
  preferences: TravelPreference[];
  shortDescription: string;
  detailedIntro: string;
  bestTimeToVisit: string;
  estimatedVisitingCost: number;
  costEstimate: DestinationCostEstimate;
  coordinates: [number, number];
  famousAttractions: string[];
  thingsToDo: string[];
  nearbyPlaces: string[];
  imageKey: ImageKey;
  galleryKeys: ImageKey[];
  cropPosition?: string;
  featured?: boolean;
  trending?: boolean;
  popular?: boolean;
}

export interface ItineraryActivity {
  id: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  title: string;
  description: string;
  estimatedCost?: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
}

export interface TripPlannerInput {
  startingLocation: string;
  destinationName: string;
  destinationSlug?: string;
  startDate: string;
  endDate: string;
  travelers: number;
  days: number;
  preferences: TravelPreference[];
  budgetCategory: BudgetTier;
}

export interface GeneratedItinerary {
  id: string;
  title: string;
  input: TripPlannerInput;
  summary: string;
  bestSeasonNote: string;
  days: ItineraryDay[];
  generatedBy: 'ai' | 'planner';
  createdAt: string;
}

export interface BudgetBreakdown {
  transportation: number;
  accommodation: number;
  food: number;
  localTravel: number;
  entryTickets: number;
  otherExpenses: number;
  totalCost: number;
  perPersonCost: number;
  dailyCost: number;
  tierMultiplier: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  homeCity: string;
  preferredStyle: TravelPreference;
  createdAt: string;
}

export interface DemoBookingRecord {
  id: string;
  destinationName: string;
  stateName: string;
  checkIn: string;
  checkOut: string;
  travelers: number;
  budgetTier: BudgetTier;
  estimatedTotal: number;
  status: 'Demo Itinerary Confirmed' | 'Saved Draft';
  createdAt: string;
}

export interface UserDashboardData {
  user: UserProfile;
  savedDestinations: string[];
  favoritePlaces: string[];
  savedItineraries: GeneratedItinerary[];
  bookingHistory: DemoBookingRecord[];
}
