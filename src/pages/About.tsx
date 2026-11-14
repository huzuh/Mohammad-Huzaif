import { Link } from 'react-router-dom';
import { ArrowRight, Compass, MapPin, ShieldCheck } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';

export function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-center">
          <p className="text-xs font-semibold text-[#0F4C5C] mb-2">About Plan My Trip India</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 leading-tight mb-5">
            Making Pan-India Discovery Structured, Transparent, and Effortless.
          </h1>
          <p className="text-base text-slate-600 leading-relaxed mb-4">
            India spans snowy Himalayan valleys above 17,000 feet, tropical coral atolls, ancient
            rock-cut monasteries, and bustling heritage citadels—yet travelers often piece together
            trips from fragmented blogs without clear regional comparisons or realistic budgets.
          </p>
          <p className="text-base text-slate-600 leading-relaxed mb-8">
            Plan My Trip India organizes all 28 states and 8 union territories into one cohesive
            travel atlas—combining curated regional guides, real geographic OpenStreetMap views,
            sample budget calculators, and editable AI-assisted itineraries.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47]"
            >
              <span>Explore All 36 Regions</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <span>Contact Our Team</span>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="h-72 lg:h-full min-h-[320px] rounded-2xl overflow-hidden border border-slate-200">
            <ResilientImage
              imageKey="heritage"
              alt="Sandstone heritage fort gateway in Rajasthan, India"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Compass className="w-6 h-6 text-[#0F4C5C] mb-3" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-slate-900 mb-2">
            Every Corner Covered
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Equal editorial care for iconic circuits like Rajasthan and Kerala alongside quiet gems
            across Arunachal Pradesh, Chhattisgarh, Lakshadweep, and Tripura.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <MapPin className="w-6 h-6 text-[#0F4C5C] mb-3" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-slate-900 mb-2">
            Grounded Geography
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every destination includes verified geographic coordinates mapped interactively on
            OpenStreetMap so you can visualize distances and nearby stops.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <ShieldCheck className="w-6 h-6 text-[#0F4C5C] mb-3" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-slate-900 mb-2">
            Honest Cost Estimates
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our budget calculator provides transparent sample breakdowns across Budget, Standard,
            and Premium travel styles—explicitly labelled as planning estimates.
          </p>
        </div>
      </div>
    </div>
  );
}
