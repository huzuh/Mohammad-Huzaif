import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { formatINR } from '../utils/travelLogic';
import type { StateRegion } from '../types/travel';
import { ResilientImage } from './ResilientImage';

interface StateCardProps {
  region: StateRegion;
  destinationCount?: number;
}

export function StateCard({ region, destinationCount = 5 }: StateCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <Link to={`/state/${region.slug}`} className="block w-full h-full">
          <ResilientImage
            imageKey={region.imageKey}
            cropPosition={region.cropPosition}
            alt={`${region.name} travel landscape`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="text-xs text-white/85 font-medium">
            {region.type} <span aria-hidden="true">·</span> {region.zone} India
          </p>
          <h3 className="font-display text-xl font-semibold leading-tight mt-0.5">
            {region.name}
          </h3>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1">
          {region.tagline}
        </p>

        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-700 mb-1">Popular highlights</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {region.highlights.slice(0, 4).join(' · ')}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <span className="font-mono-num font-semibold text-slate-900">
              {formatINR(region.dailyBudget.standard)}
            </span>{' '}
            avg/day · {destinationCount} places
          </div>

          <Link
            to={`/state/${region.slug}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Explore State</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
