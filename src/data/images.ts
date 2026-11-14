import type { ImageKey } from '../types/travel';

export const IMAGE_ASSET_PATHS: Record<ImageKey, string> = {
  hero_palace: '/src/assets/images/hero_india_palace_1794662016955.jpg',
  mountains: '/src/assets/images/mountains_himalayas_1794662017875.jpg',
  beaches: '/src/assets/images/beaches_tropical_1794662017738.jpg',
  heritage: '/src/assets/images/heritage_forts_1794662018804.jpg',
  backwaters: '/src/assets/images/backwaters_kerala_1794662018403.jpg',
  spiritual: '/src/assets/images/spiritual_ghats_1794662019450.jpg',
  wildlife: '/src/assets/images/wildlife_safari_1794662019919.jpg',
  northeast: '/src/assets/images/northeast_tea_falls_1794662020403.jpg',
};

export const IMAGE_FALLBACK_GRADIENTS: Record<ImageKey, string> = {
  hero_palace: 'from-amber-900 via-stone-800 to-slate-900',
  mountains: 'from-sky-900 via-slate-700 to-cyan-900',
  beaches: 'from-cyan-800 via-teal-700 to-amber-700',
  heritage: 'from-amber-800 via-orange-900 to-stone-900',
  backwaters: 'from-emerald-900 via-teal-800 to-stone-800',
  spiritual: 'from-orange-900 via-amber-800 to-slate-900',
  wildlife: 'from-stone-800 via-emerald-900 to-amber-900',
  northeast: 'from-emerald-800 via-green-900 to-slate-800',
};

export const CROP_POSITIONS = [
  'object-center',
  'object-[30%_40%]',
  'object-[70%_35%]',
  'object-[45%_65%]',
  'object-[60%_25%]',
  'object-[25%_55%]',
];

export function getDestinationImageUrl(key: ImageKey): string {
  return IMAGE_ASSET_PATHS[key] || IMAGE_ASSET_PATHS.heritage;
}
