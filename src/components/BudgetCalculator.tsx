import { useMemo, useState } from 'react';
import { Calculator, Info } from 'lucide-react';
import {
  calculateTripBudget,
  formatINR,
  INTERCITY_TRANSPORT_PER_PERSON,
} from '../utils/travelLogic';
import type { BudgetTier, Destination } from '../types/travel';

interface BudgetCalculatorProps {
  destination?: Destination;
  initialDays?: number;
  initialTravelers?: number;
  initialTier?: BudgetTier;
  onTierChange?: (tier: BudgetTier) => void;
  onTravelersChange?: (travelers: number) => void;
  onDaysChange?: (days: number) => void;
}

const TIERS: BudgetTier[] = ['Budget', 'Standard', 'Premium'];

export function BudgetCalculator({
  destination,
  initialDays = 3,
  initialTravelers = 2,
  initialTier = 'Standard',
  onTierChange,
  onTravelersChange,
  onDaysChange,
}: BudgetCalculatorProps) {
  const [days, setDays] = useState(initialDays);
  const [travelers, setTravelers] = useState(initialTravelers);
  const [tier, setTier] = useState<BudgetTier>(initialTier);
  const [customIntercity, setCustomIntercity] = useState<number | undefined>(undefined);

  // Keep synced when external props update explicitly
  const activeDays = onDaysChange ? initialDays : days;
  const activeTravelers = onTravelersChange ? initialTravelers : travelers;
  const activeTier = onTierChange ? initialTier : tier;

  const breakdown = useMemo(
    () =>
      calculateTripBudget({
        days: activeDays,
        travelers: activeTravelers,
        budgetTier: activeTier,
        destination,
        customIntercityPerPerson: customIntercity,
      }),
    [activeDays, activeTravelers, activeTier, destination, customIntercity]
  );

  const handleDays = (val: number) => {
    const clamped = Math.max(1, Math.min(21, val));
    if (onDaysChange) onDaysChange(clamped);
    else setDays(clamped);
  };

  const handleTravelers = (val: number) => {
    const clamped = Math.max(1, Math.min(20, val));
    if (onTravelersChange) onTravelersChange(clamped);
    else setTravelers(clamped);
  };

  const handleTier = (newTier: BudgetTier) => {
    setCustomIntercity(undefined);
    if (onTierChange) onTierChange(newTier);
    else setTier(newTier);
  };

  const expenseRows = [
    { label: 'Intercity Transportation', value: breakdown.transportation, note: 'Round-trip rail/flight estimate' },
    { label: 'Hotel Accommodation', value: breakdown.accommodation, note: `${Math.max(1, activeDays - 1)} nights · ${Math.ceil(activeTravelers / 2)} room(s)` },
    { label: 'Food & Dining', value: breakdown.food, note: `${activeTravelers} travelers × ${activeDays} days` },
    { label: 'Local Travel & Transfers', value: breakdown.localTravel, note: 'Cabs, autos & local ferries' },
    { label: 'Tourist Entry Tickets', value: breakdown.entryTickets, note: 'Museums, forts & park permits' },
    { label: 'Contingency & Misc.', value: breakdown.otherExpenses, note: '12% buffer for snacks & guides' },
  ];

  return (
    <section
      id="budget"
      aria-labelledby="budget-calculator-heading"
      className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F4C5C] mb-1">
            <Calculator className="w-4 h-4" aria-hidden="true" />
            <span>Interactive Cost Estimator</span>
          </div>
          <h2
            id="budget-calculator-heading"
            className="font-display text-2xl font-bold text-slate-900"
          >
            Travel Budget Calculator
          </h2>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          {TIERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleTier(item)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTier === item
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Sliders / Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 py-6 border-b border-slate-100">
        <div>
          <label
            htmlFor="calc-travelers"
            className="block text-xs font-semibold text-slate-700 mb-2"
          >
            Number of Travelers
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleTravelers(activeTravelers - 1)}
              aria-label="Decrease travelers"
              className="w-9 h-9 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              -
            </button>
            <input
              id="calc-travelers"
              type="number"
              min={1}
              max={20}
              value={activeTravelers}
              onChange={(e) => handleTravelers(Number(e.target.value) || 1)}
              className="w-16 text-center font-mono-num text-sm font-semibold py-2 border border-slate-300 rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleTravelers(activeTravelers + 1)}
              aria-label="Increase travelers"
              className="w-9 h-9 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="calc-days" className="block text-xs font-semibold text-slate-700 mb-2">
            Trip Duration (Days)
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleDays(activeDays - 1)}
              aria-label="Decrease trip days"
              className="w-9 h-9 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              -
            </button>
            <input
              id="calc-days"
              type="number"
              min={1}
              max={21}
              value={activeDays}
              onChange={(e) => handleDays(Number(e.target.value) || 1)}
              className="w-16 text-center font-mono-num text-sm font-semibold py-2 border border-slate-300 rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleDays(activeDays + 1)}
              aria-label="Increase trip days"
              className="w-9 h-9 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="calc-transport-pp"
            className="block text-xs font-semibold text-slate-700 mb-2"
          >
            Intercity Fare / Person (₹)
          </label>
          <input
            id="calc-transport-pp"
            type="number"
            min={0}
            step={500}
            value={customIntercity ?? INTERCITY_TRANSPORT_PER_PERSON[activeTier]}
            onChange={(e) => setCustomIntercity(Math.max(0, Number(e.target.value) || 0))}
            className="w-full font-mono-num text-sm font-medium px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
          />
        </div>
      </div>

      {/* Summary Totals Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-slate-100">
        <div className="p-4 rounded-lg bg-[#0F4C5C] text-white">
          <span className="block text-xs text-white/80">Total Estimated Cost</span>
          <span
            data-testid="budget-total-cost"
            className="font-mono-num text-2xl font-bold mt-1 block"
          >
            {formatINR(breakdown.totalCost)}
          </span>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="block text-xs text-slate-500">Per-Person Estimate</span>
          <span
            data-testid="budget-per-person"
            className="font-mono-num text-2xl font-bold text-slate-900 mt-1 block"
          >
            {formatINR(breakdown.perPersonCost)}
          </span>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="block text-xs text-slate-500">Daily Estimated Cost</span>
          <span
            data-testid="budget-daily-cost"
            className="font-mono-num text-2xl font-bold text-slate-900 mt-1 block"
          >
            {formatINR(breakdown.dailyCost)}
          </span>
        </div>
      </div>

      {/* Expense Breakdown Table */}
      <div className="pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Expense Breakdown</h3>
        <div className="divide-y divide-slate-100">
          {expenseRows.map((row) => {
            const pct =
              breakdown.totalCost > 0
                ? Math.round((row.value / breakdown.totalCost) * 100)
                : 0;
            return (
              <div key={row.label} className="py-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-800">{row.label}</span>
                    <span className="block text-xs text-slate-500">{row.note}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono-num font-semibold text-slate-900">
                      {formatINR(row.value)}
                    </span>
                    <span className="block font-mono-num text-xs text-slate-500">{pct}%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F4C5C] rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" aria-hidden="true" />
        <p>
          <strong>Sample Planning Estimates:</strong> Figures shown above use representative
          regional averages for {destination ? destination.name : 'Indian travel'} and are not live
          airline, rail, or hotel market quotes.
        </p>
      </div>
    </section>
  );
}
