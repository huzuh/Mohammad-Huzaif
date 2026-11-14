import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bookmark, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/travelLogic';
import type { Destination } from '../types/travel';
import { ResilientImage } from './ResilientImage';

interface DestinationCardProps {
  destination: Destination;
  distanceKm?: number;
}

export function DestinationCard({ destination, distanceKm }: DestinationCardProps) {
  const { isAuthenticated, dashboard, toggleSavedDestination, toggleFavoritePlace } = useAuth();
  const navigate = useNavigate();

  const isSaved = Boolean(dashboard?.savedDestinations.includes(destination.slug));
  const isFav = Boolean(dashboard?.favoritePlaces.includes(destination.slug));

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleSavedDestination(destination.slug);
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleFavoritePlace(destination.slug);
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <Link to={`/destination/${destination.slug}`} className="block w-full h-full">
          <ResilientImage
            imageKey={destination.imageKey}
            cropPosition={destination.cropPosition}
            alt={`${destination.name} in ${destination.stateName}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleFavorite}
            aria-label={
              isFav
                ? `Remove ${destination.name} from favorites`
                : `Add ${destination.name} to favorites`
            }
            className={`w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer ${
              isFav
                ? 'bg-rose-600 text-white'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            aria-label={
              isSaved
                ? `Remove ${destination.name} from saved destinations`
                : `Save ${destination.name} to dashboard`
            }
            className={`w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer ${
              isSaved
                ? 'bg-[#0F4C5C] text-white'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-[#0F4C5C]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Zero-pill clean unboxed metadata */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-2">
          <span className="font-medium text-[#0F4C5C]">{destination.stateName}</span>
          <span aria-hidden="true">·</span>
          <span>{destination.category}</span>
          <span aria-hidden="true">·</span>
          <span>{destination.bestTimeToVisit}</span>
        </div>

        <h3 className="font-display text-xl font-semibold text-slate-900 leading-snug mb-1.5">
          <Link
            to={`/destination/${destination.slug}`}
            className="hover:text-[#0F4C5C] transition-colors"
          >
            {destination.name}
          </Link>
        </h3>

        <p className="text-xs text-slate-500 mb-3">
          {destination.location}
          {typeof distanceKm === 'number' && (
            <span className="font-mono-num text-[#0F4C5C] font-medium">
              {' '}
              · {Math.round(distanceKm)} km away
            </span>
          )}
        </p>

        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-5 flex-1">
          {destination.shortDescription}
        </p>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[11px] text-slate-500">Est. daily cost</span>
            <span className="font-mono-num text-sm font-semibold text-slate-900">
              {formatINR(destination.estimatedVisitingCost)}
              <span className="text-xs font-normal text-slate-500"> / day</span>
            </span>
          </div>

          <Link
            to={`/destination/${destination.slug}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F4C5C] bg-[#0F4C5C]/8 rounded-lg hover:bg-[#0F4C5C] hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <span>Explore Details</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
