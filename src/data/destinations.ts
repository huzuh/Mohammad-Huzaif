import type { Destination } from '../types/travel';
import { DESTINATIONS_PART_1 } from './destinationsPart1';
import { DESTINATIONS_PART_2 } from './destinationsPart2';
import { DESTINATIONS_PART_3 } from './destinationsPart3';

export const ALL_DESTINATIONS: Destination[] = [
  ...DESTINATIONS_PART_1,
  ...DESTINATIONS_PART_2,
  ...DESTINATIONS_PART_3,
];

export function getDestinationsByState(stateSlug: string): Destination[] {
  return ALL_DESTINATIONS.filter((d) => d.stateSlug === stateSlug);
}

export function getDestinationBySlug(slug: string): Destination | undefined {
  return ALL_DESTINATIONS.find((d) => d.slug === slug);
}

export function getFeaturedDestinations(): Destination[] {
  return ALL_DESTINATIONS.filter((d) => d.featured);
}

export function getPopularDestinations(): Destination[] {
  return ALL_DESTINATIONS.filter((d) => d.popular);
}

export function getTrendingDestinations(): Destination[] {
  return ALL_DESTINATIONS.filter((d) => d.trending);
}
