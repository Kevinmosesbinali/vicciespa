import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F4EBE8] via-[#EFE8E2] to-[#E6D7CE] text-[#6E5F5B] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Sparkles className="w-7 h-7 text-[#9A7245] mb-2" strokeWidth={1.5} />
        <span className="font-display text-lg text-[#2C2220] font-medium">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
