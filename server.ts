import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express, { type Request, type Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { ALL_DESTINATIONS } from './src/data/destinations.ts';
import { INDIAN_STATES_AND_UTS } from './src/data/states.ts';
import {
  buildFallbackItinerary,
  validateContactForm,
  validateLoginForm,
  validateRegisterForm,
  validateTripPlannerInput,
} from './src/utils/travelLogic.ts';
import {
  buildLocationLabelFromReverseGeocode,
  findNearestStartingPoint,
} from './src/utils/locationUtils.ts';
import type {
  DemoBookingRecord,
  GeneratedItinerary,
  TripPlannerInput,
  UserDashboardData,
  UserProfile,
} from './src/types/travel.ts';

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'pmti-local-dev-secret-2026-india-travel';
const COOKIE_NAME = 'pmti_session';

interface StoredUser extends UserProfile {
  passwordHash: string;
  savedDestinations: string[];
  favoritePlaces: string[];
  savedItineraries: GeneratedItinerary[];
  bookingHistory: DemoBookingRecord[];
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface StoreData {
  users: StoredUser[];
  contacts: ContactSubmission[];
}

function hashPassword(password: string, salt?: string): string {
  const usedSalt = salt ?? crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return `${usedSalt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

function signToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, iat: Date.now() })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  if (sig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof parsed.uid === 'string' ? parsed.uid : null;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    result[key] = val;
  }
  return result;
}

function createSeedStore(): StoreData {
  const demoInput: TripPlannerInput = {
    startingLocation: 'New Delhi',
    destinationName: 'Jaipur — Amber Fort & Pink City',
    destinationSlug: 'jaipur-amber-fort',
    startDate: '2026-12-12',
    endDate: '2026-12-14',
    travelers: 2,
    days: 3,
    preferences: ['Historical', 'Food and Culture'],
    budgetCategory: 'Standard',
  };
  const jaipur = ALL_DESTINATIONS.find((d) => d.slug === 'jaipur-amber-fort');
  const rajasthan = INDIAN_STATES_AND_UTS.find((s) => s.slug === 'rajasthan');
  const seededItinerary = buildFallbackItinerary(demoInput, jaipur, rajasthan);
  seededItinerary.id = 'itinerary-seed-jaipur';

  return {
    users: [
      {
        id: 'user-demo-aarav',
        name: 'Aarav Sharma',
        email: 'traveler@planmytripindia.in',
        homeCity: 'Bengaluru',
        preferredStyle: 'Historical',
        createdAt: '2026-01-15T09:00:00.000Z',
        passwordHash: hashPassword('India@2026'),
        savedDestinations: ['jaipur-amber-fort', 'alleppey-backwaters', 'pangong-tso-lake'],
        favoritePlaces: ['hampi-ruins', 'cherrapunji-root-bridges'],
        savedItineraries: [seededItinerary],
        bookingHistory: [
          {
            id: 'demo-bk-101',
            destinationName: 'Udaipur — City of Lakes',
            stateName: 'Rajasthan',
            checkIn: '2026-11-20',
            checkOut: '2026-11-23',
            travelers: 2,
            budgetTier: 'Standard',
            estimatedTotal: 27400,
            status: 'Demo Itinerary Confirmed',
            createdAt: '2026-10-08T14:30:00.000Z',
          },
        ],
      },
    ],
    contacts: [],
  };
}

let writeQueue = Promise.resolve();

async function ensureStore(): Promise<StoreData> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw) as StoreData;
  } catch {
    const seed = createSeedStore();
    await fs.writeFile(STORE_PATH, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
}

async function saveStore(store: StoreData): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmpPath = `${STORE_PATH}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(store, null, 2), 'utf8');
    await fs.rename(tmpPath, STORE_PATH);
  });
  await writeQueue;
}

function toDashboardData(user: StoredUser): UserDashboardData {
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      homeCity: user.homeCity,
      preferredStyle: user.preferredStyle,
      createdAt: user.createdAt,
    },
    savedDestinations: user.savedDestinations,
    favoritePlaces: user.favoritePlaces,
    savedItineraries: user.savedItineraries,
    bookingHistory: user.bookingHistory,
  };
}

async function getAuthenticatedUser(req: Request): Promise<StoredUser | null> {
  const cookies = parseCookies(req.headers.cookie);
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  const userId = verifyToken(cookies[COOKIE_NAME] || bearer);
  if (!userId) return null;
  const store = await ensureStore();
  return store.users.find((u) => u.id === userId) ?? null;
}

function setSessionCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

async function generateWithGemini(
  input: TripPlannerInput
): Promise<GeneratedItinerary | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const destMatch = ALL_DESTINATIONS.find(
    (d) =>
      d.slug === input.destinationSlug ||
      d.name.toLowerCase() === input.destinationName.toLowerCase()
  );
  const stateMatch = destMatch
    ? INDIAN_STATES_AND_UTS.find((s) => s.slug === destMatch.stateSlug)
    : INDIAN_STATES_AND_UTS.find((s) =>
        input.destinationName.toLowerCase().includes(s.name.toLowerCase())
      );

  const prompt = `Create a practical, authentic ${input.days}-day India travel itinerary from ${input.startingLocation} to ${input.destinationName}.
Dates: ${input.startDate} to ${input.endDate}
Travelers: ${input.travelers}
Budget Tier: ${input.budgetCategory}
Preferences: ${input.preferences.join(', ') || 'Culture, Sightseeing'}
${destMatch ? `Known landmarks nearby: ${destMatch.famousAttractions.join(', ')}. Nearby places: ${destMatch.nearbyPlaces.join(', ')}.` : ''}
${stateMatch ? `Regional cuisine to highlight: ${stateMatch.famousFood.join(', ')}.` : ''}

Return a concise summary, bestSeasonNote, and exactly ${input.days} days, each with 3 realistic activities (Morning, Afternoon, Evening) including local cuisine recommendations and realistic sightseeing sequence.`;

  const response = await Promise.race([
    ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert Indian travel concierge. Suggest real Indian landmarks, realistic travel pacing, and authentic local food recommendations without inventing fake prices or fake hotels.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            bestSeasonNote: { type: Type.STRING },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        timeOfDay: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ['timeOfDay', 'title', 'description'],
                    },
                  },
                },
                required: ['day', 'title', 'activities'],
              },
            },
          },
          required: ['title', 'summary', 'bestSeasonNote', 'days'],
        },
      },
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini itinerary generation timed out')), 8000)
    ),
  ]);

  const text = (response.text ?? '').trim();
  if (!text) return null;

  const parsed = JSON.parse(text) as {
    title: string;
    summary: string;
    bestSeasonNote: string;
    days: Array<{
      day: number;
      title: string;
      activities: Array<{
        timeOfDay: string;
        title: string;
        description: string;
      }>;
    }>;
  };

  if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
    return null;
  }

  return {
    id: `itinerary-${Date.now()}`,
    title: parsed.title || `${input.days}-Day ${input.destinationName} Trip`,
    input,
    summary: parsed.summary,
    bestSeasonNote: parsed.bestSeasonNote || 'October to March',
    days: parsed.days.map((d, idx) => ({
      day: d.day || idx + 1,
      title: d.title,
      activities: (d.activities || []).map((act, aIdx) => ({
        id: `ai-d${idx + 1}-${aIdx + 1}-${Date.now()}`,
        timeOfDay:
          act.timeOfDay === 'Morning' ||
          act.timeOfDay === 'Afternoon' ||
          act.timeOfDay === 'Evening'
            ? act.timeOfDay
            : aIdx === 0
              ? 'Morning'
              : aIdx === 1
                ? 'Afternoon'
                : 'Evening',
        title: act.title,
        description: act.description,
      })),
    })),
    generatedBy: 'ai',
    createdAt: new Date().toISOString(),
  };
}

async function startServer() {
  await ensureStore();

  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Reverse geocode live coordinates to readable Indian locality / nearest district
  app.get('/api/location/reverse', async (req, res) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      res.status(400).json({ error: 'Valid latitude and longitude coordinates are required.' });
      return;
    }

    const coords: [number, number] = [lat, lng];
    const nearest = findNearestStartingPoint(coords);
    let label = nearest.label;
    let source: 'nominatim' | 'nearest-match' = 'nearest-match';

    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        String(lat)
      )}&lon=${encodeURIComponent(String(lng))}&zoom=14&addressdetails=1`;
      const geoRes = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'PlanMyTripIndia/1.0',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(3500),
      });
      if (geoRes.ok) {
        const geoJson = (await geoRes.json()) as {
          address?: Record<string, string | undefined>;
        };
        if (geoJson?.address) {
          label = buildLocationLabelFromReverseGeocode(geoJson.address, coords);
          source = 'nominatim';
        }
      }
    } catch {
      // Fall back cleanly to nearest Indian city / Karnataka district
    }

    res.json({
      coordinates: coords,
      label,
      nearestDistrictOrCity: nearest.label,
      distanceToNearestKm: nearest.distanceKm,
      source,
      fetchedAt: new Date().toISOString(),
    });
  });

  // Auth routes
  app.get('/api/auth/me', async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      res.json({ authenticated: false, dashboard: null });
      return;
    }
    res.json({ authenticated: true, dashboard: toDashboardData(user) });
  });

  app.post('/api/auth/register', async (req, res) => {
    const { name = '', email = '', password = '', homeCity = 'New Delhi' } = req.body ?? {};
    const validation = validateRegisterForm({ name, email, password, homeCity });
    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed', errors: validation.errors });
      return;
    }

    const store = await ensureStore();
    const normalizedEmail = email.trim().toLowerCase();
    if (store.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      res.status(409).json({
        error: 'An account with this email already exists.',
        errors: { email: 'An account with this email already exists.' },
      });
      return;
    }

    const newUser: StoredUser = {
      id: `user-${crypto.randomUUID()}`,
      name: name.trim(),
      email: normalizedEmail,
      homeCity: homeCity.trim() || 'New Delhi',
      preferredStyle: 'Historical',
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(password),
      savedDestinations: [],
      favoritePlaces: [],
      savedItineraries: [],
      bookingHistory: [],
    };

    store.users.push(newUser);
    await saveStore(store);

    const token = signToken(newUser.id);
    setSessionCookie(res, token);
    res.status(201).json(toDashboardData(newUser));
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email = '', password = '' } = req.body ?? {};
    const validation = validateLoginForm({ email, password });
    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed', errors: validation.errors });
      return;
    }

    const store = await ensureStore();
    const user = store.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signToken(user.id);
    setSessionCookie(res, token);
    res.json(toDashboardData(user));
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
  });

  // User dashboard persistence routes
  app.put('/api/user/profile', async (req, res) => {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Please sign in first.' });
      return;
    }
    const { name, homeCity, preferredStyle } = req.body ?? {};
    const store = await ensureStore();
    const user = store.users.find((u) => u.id === authUser.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    if (typeof name === 'string' && name.trim().length >= 2) {
      user.name = name.trim();
    }
    if (typeof homeCity === 'string' && homeCity.trim()) {
      user.homeCity = homeCity.trim();
    }
    if (typeof preferredStyle === 'string' && preferredStyle.trim()) {
      user.preferredStyle = preferredStyle as StoredUser['preferredStyle'];
    }
    await saveStore(store);
    res.json(toDashboardData(user));
  });

  app.post('/api/user/saved-destinations/:slug', async (req, res) => {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Sign in to save destinations.' });
      return;
    }
    const slug = req.params.slug;
    const store = await ensureStore();
    const user = store.users.find((u) => u.id === authUser.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    if (!user.savedDestinations.includes(slug)) {
      user.savedDestinations.unshift(slug);
      await saveStore(store);
    }
    res.json(toDashboardData(user));
  });

  app.delete('/api/user/saved-destinations/:slug', async (req, res) => {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Sign in required.' });
      return;
    }
    const slug = req.params.slug;
    const store = await ensureStore();
    const user = store.users.find((u) => u.id === authUser.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    user.savedDestinations = user.savedDestinations.filter((s) => s !== slug);
    await saveStore(store);
    res.json(toDashboardData(user));
  });

  app.post('/api/user/favorites/:slug', async (req, res) => {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Sign in to favorite places.' });
      return;
    }
    const slug = req.params.slug;
    const store = await ensureStore();
    const user = store.users.find((u) => u.id === authUser.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    if (!user.favoritePlaces.includes(slug)) {
      user.favoritePlaces.unshift(slug);
      await saveStore(store);
    }
    res.json(toDashboardData(user));
  });

  app.delete('/api/user/favorites/:slug', async (req, res) => {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Sign in required.' });
      return;
    }
    const slug = req.params.slug;
    const store = await ensureStore();
    const user = store.users.find((u) => u.id === authUser.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    user.favoritePlaces = user.favoritePlaces.filter((s) => s !== slug);
    await saveStore(store);
    res.json(toDashboardData(user));
  });

  app.post('/api/user/itineraries', async (req, res) => {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Sign in to save itineraries.' });
      return;
    }
    const itinerary = req.body as GeneratedItinerary;
    if (!itinerary || !itinerary.title || !Array.isArray(itinerary.days)) {
      res.status(400).json({ error: 'Invalid itinerary payload.' });
      return;
    }
    const store = await ensureStore();
    const user = store.users.find((u) => u.id === authUser.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const existingIdx = user.savedItineraries.findIndex((it) => it.id === itinerary.id);
    if (existingIdx >= 0) {
      user.savedItineraries[existingIdx] = itinerary;
    } else {
      user.savedItineraries.unshift(itinerary);
    }
    await saveStore(store);
    res.json(toDashboardData(user));
  });

  app.delete('/api/user/itineraries/:id', async (req, res) => {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Sign in required.' });
      return;
    }
    const store = await ensureStore();
    const user = store.users.find((u) => u.id === authUser.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    user.savedItineraries = user.savedItineraries.filter((it) => it.id !== req.params.id);
    await saveStore(store);
    res.json(toDashboardData(user));
  });

  app.post('/api/user/bookings', async (req, res) => {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Sign in to record demonstration trip plans.' });
      return;
    }
    const {
      destinationName,
      stateName,
      checkIn,
      checkOut,
      travelers,
      budgetTier,
      estimatedTotal,
    } = req.body ?? {};
    if (!destinationName || !checkIn || !checkOut) {
      res.status(400).json({ error: 'Missing required trip booking dates or destination.' });
      return;
    }
    const store = await ensureStore();
    const user = store.users.find((u) => u.id === authUser.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const record: DemoBookingRecord = {
      id: `demo-bk-${Date.now()}`,
      destinationName,
      stateName: stateName || 'India',
      checkIn,
      checkOut,
      travelers: Number(travelers) || 2,
      budgetTier: budgetTier || 'Standard',
      estimatedTotal: Number(estimatedTotal) || 0,
      status: 'Demo Itinerary Confirmed',
      createdAt: new Date().toISOString(),
    };
    user.bookingHistory.unshift(record);
    await saveStore(store);
    res.status(201).json(toDashboardData(user));
  });

  // AI Trip Itinerary Generator
  app.post('/api/ai/itinerary', async (req, res) => {
    const input = req.body as TripPlannerInput;
    const validation = validateTripPlannerInput(input);
    if (!validation.valid) {
      res.status(400).json({ error: 'Please fix planner form errors.', errors: validation.errors });
      return;
    }

    const destMatch = ALL_DESTINATIONS.find(
      (d) =>
        d.slug === input.destinationSlug ||
        d.name.toLowerCase() === input.destinationName.toLowerCase()
    );
    const stateMatch = destMatch
      ? INDIAN_STATES_AND_UTS.find((s) => s.slug === destMatch.stateSlug)
      : undefined;

    try {
      const aiResult = await generateWithGemini(input);
      if (aiResult) {
        res.json(aiResult);
        return;
      }
    } catch (err) {
      console.warn('Gemini itinerary fallback triggered:', (err as Error).message);
    }

    const fallback = buildFallbackItinerary(input, destMatch, stateMatch);
    res.json(fallback);
  });

  // Contact form
  app.post('/api/contact', async (req, res) => {
    const { name = '', email = '', subject = '', message = '' } = req.body ?? {};
    const validation = validateContactForm({ name, email, subject, message });
    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed', errors: validation.errors });
      return;
    }
    const store = await ensureStore();
    const submission: ContactSubmission = {
      id: `contact-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };
    store.contacts.unshift(submission);
    await saveStore(store);
    res.status(201).json({
      ok: true,
      id: submission.id,
      message: 'Thank you! Your inquiry has been received by our India travel desk.',
    });
  });

  // Vite middleware or production static build
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Plan My Trip India server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
