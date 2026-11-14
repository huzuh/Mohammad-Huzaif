import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import type {
  BudgetTier,
  GeneratedItinerary,
  TravelPreference,
  UserDashboardData,
} from '../types/travel';

interface AuthContextValue {
  dashboard: UserDashboardData | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserDashboardData>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    homeCity: string;
  }) => Promise<UserDashboardData>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (payload: {
    name: string;
    homeCity: string;
    preferredStyle: TravelPreference;
  }) => Promise<void>;
  toggleSavedDestination: (slug: string) => Promise<boolean>;
  toggleFavoritePlace: (slug: string) => Promise<boolean>;
  saveItinerary: (itinerary: GeneratedItinerary) => Promise<void>;
  deleteItinerary: (id: string) => Promise<void>;
  recordDemoBooking: (payload: {
    destinationName: string;
    stateName: string;
    checkIn: string;
    checkOut: string;
    travelers: number;
    budgetTier: BudgetTier;
    estimatedTotal: number;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [dashboard, setDashboard] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getCurrentUser();
      setDashboard(data.authenticated ? data.dashboard : null);
    } catch {
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    setDashboard(data);
    return data;
  }, []);

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; homeCity: string }) => {
      const data = await api.register(payload);
      setDashboard(data);
      return data;
    },
    []
  );

  const logout = useCallback(async () => {
    await api.logout();
    setDashboard(null);
  }, []);

  const updateProfile = useCallback(
    async (payload: { name: string; homeCity: string; preferredStyle: TravelPreference }) => {
      const data = await api.updateProfile(payload);
      setDashboard(data);
    },
    []
  );

  const toggleSavedDestination = useCallback(
    async (slug: string): Promise<boolean> => {
      if (!dashboard) return false;
      const exists = dashboard.savedDestinations.includes(slug);
      const updated = exists
        ? await api.removeSavedDestination(slug)
        : await api.saveDestination(slug);
      setDashboard(updated);
      return !exists;
    },
    [dashboard]
  );

  const toggleFavoritePlace = useCallback(
    async (slug: string): Promise<boolean> => {
      if (!dashboard) return false;
      const exists = dashboard.favoritePlaces.includes(slug);
      const updated = exists
        ? await api.removeFavoritePlace(slug)
        : await api.addFavoritePlace(slug);
      setDashboard(updated);
      return !exists;
    },
    [dashboard]
  );

  const saveItinerary = useCallback(async (itinerary: GeneratedItinerary) => {
    const updated = await api.saveItinerary(itinerary);
    setDashboard(updated);
  }, []);

  const deleteItinerary = useCallback(async (id: string) => {
    const updated = await api.deleteItinerary(id);
    setDashboard(updated);
  }, []);

  const recordDemoBooking = useCallback(
    async (payload: {
      destinationName: string;
      stateName: string;
      checkIn: string;
      checkOut: string;
      travelers: number;
      budgetTier: BudgetTier;
      estimatedTotal: number;
    }) => {
      const updated = await api.recordDemoBooking(payload);
      setDashboard(updated);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        dashboard,
        loading,
        isAuthenticated: Boolean(dashboard?.user),
        login,
        register,
        logout,
        refresh,
        updateProfile,
        toggleSavedDestination,
        toggleFavoritePlace,
        saveItinerary,
        deleteItinerary,
        recordDemoBooking,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
