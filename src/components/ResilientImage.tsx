import { useState } from 'react';
import { Compass } from 'lucide-react';
import { getDestinationImageUrl, IMAGE_FALLBACK_GRADIENTS } from '../data/images';
import type { ImageKey } from '../types/travel';

interface ResilientImageProps {
  imageKey: ImageKey;
  alt: string;
  className?: string;
  cropPosition?: string;
}

export function ResilientImage({
  imageKey,
  alt,
  className = 'w-full h-full object-cover',
  cropPosition = 'object-center',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);
  const src = getDestinationImageUrl(imageKey);
  const gradient = IMAGE_FALLBACK_GRADIENTS[imageKey] || IMAGE_FALLBACK_GRADIENTS.heritage;

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br ${gradient} text-white/90 p-6 text-center ${className}`}
      >
        <Compass className="w-8 h-8 mb-2 opacity-80" aria-hidden="true" />
        <span className="text-xs font-medium tracking-wide max-w-[20ch]">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} ${cropPosition}`}
      loading="lazy"
    />
  );
}
