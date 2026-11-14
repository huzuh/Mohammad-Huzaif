import type {
  BudgetTier,
  GeneratedItinerary,
  TravelPreference,
  TripPlannerInput,
  UserDashboardData,
} from '../types/travel';
import type { LiveLocationResult } from '../utils/locationUtils';

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`) as Error & {
      status?: number;
      errors?: Record<string, string>;
    };
    err.status = res.status;
    err.errors = data.errors;
    throw err;
  }
  return data as T;
}

export const api = {
  getCurrentUser(): Promise<{ authenticated: boolean; dashboard: UserDashboardData | null }> {
    return requestJson<{ authenticated: boolean; dashboard: UserDashboardData | null }>(
      '/api/auth/me'
    );
  },

  login(email: string, password: string): Promise<UserDashboardData> {
    return requestJson<UserDashboardData>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(payload: {
    name: string;
    email: string;
    password: string;
    homeCity: string;
  }): Promise<UserDashboardData> {
    return requestJson<UserDashboardData>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logout(): Promise<{ ok: boolean }> {
    return requestJson<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
  },

  updateProfile(payload: {
    name: string;
    homeCity: string;
    preferredStyle: TravelPreference;
  }): Promise<UserDashboardData> {
    return requestJson<UserDashboardData>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  saveDestination(slug: string): Promise<UserDashboardData> {
    return requestJson<UserDashboardData>(`/api/user/saved-destinations/${encodeURIComponent(slug)}`, {
      method: 'POST',
    });
  },

  removeSavedDestination(slug: string): Promise<UserDashboardData> {
    return requestJson<UserDashboardData>(`/api/user/saved-destinations/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
  },

  addFavoritePlace(slug: string): Promise<UserDashboardData> {
    return requestJson<UserDashboardData>(`/api/user/favorites/${encodeURIComponent(slug)}`, {
      method: 'POST',
    });
  },

  removeFavoritePlace(slug: string): Promise<UserDashboardData> {
    return requestJson<UserDashboardData>(`/api/user/favorites/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
  },

  saveItinerary(itinerary: GeneratedItinerary): Promise<UserDashboardData> {
    return requestJson<UserDashboardData>('/api/user/itineraries', {
      method: 'POST',
      body: JSON.stringify(itinerary),
    });
  },

  deleteItinerary(id: string): Promise<UserDashboardData> {
    return requestJson<UserDashboardData>(`/api/user/itineraries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  recordDemoBooking(payload: {
    destinationName: string;
    stateName: string;
    checkIn: string;
    checkOut: string;
    travelers: number;
    budgetTier: BudgetTier;
    estimatedTotal: number;
  }): Promise<UserDashboardData> {
    return requestJson<UserDashboardData>('/api/user/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  generateItinerary(input: TripPlannerInput): Promise<GeneratedItinerary> {
    return requestJson<GeneratedItinerary>('/api/ai/itinerary', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  submitContact(payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ ok: boolean; id: string; message: string }> {
    return requestJson('/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  reverseGeocode(lat: number, lng: number): Promise<LiveLocationResult> {
    return requestJson<LiveLocationResult>(
      `/api/location/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(
        String(lng)
      )}`
    );
  },
};
