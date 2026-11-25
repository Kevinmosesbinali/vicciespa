import { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { useSpa } from '../context/SpaContext';
import type { GalleryItem } from '../types';

export function GalleryPage() {
  const { gallery, navigate, settings } = useSpa();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(gallery.map((g) => g.category)));
    return ['All', ...unique];
  }, [gallery]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return gallery;
    return gallery.filter((g) => g.category === selectedCategory);
  }, [gallery, selectedCategory]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filtered.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + filtered.length) % filtered.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, filtered.length]);

  const activeItem: GalleryItem | null =
    lightboxIndex !== null && filtered[lightboxIndex] ? filtered[lightboxIndex] : null;

  return (
    <div className="bg-[#FAF7F4] py-14 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E6DDD7]">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-medium text-[#9A7245]">
              Visual Lookbook · {settings.businessName}
            </p>
            <h1
              className="font-display font-semibold text-[#2C2220] leading-[1.1] [text-wrap:balance]"
              style={{ fontSize: 'clamp(2.15rem, 3.6vw, 3.25rem)' }}
            >
              Spa &amp; Treatment Gallery
            </h1>
            <p className="text-sm sm:text-base text-[#5A4C48] leading-relaxed">
              Explore our facial treatments, massage sessions, manicures, pedicures, Gelish finishes, classic lashes, and serene mobile spa moments.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter gallery by treatment type"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EFE8E2] rounded-xl self-start lg:self-auto"
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setLightboxIndex(null);
                  }}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-[#2C2220] shadow-xs'
                      : 'text-[#5A4C48] hover:text-[#2C2220]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Responsive Gallery Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E6DDD7] rounded-2xl p-10 text-center space-y-3">
            <p className="font-display text-2xl text-[#2C2220]">
              No gallery photos in this category yet
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className="px-4 py-2 text-xs font-medium text-white bg-[#7D4A4C] rounded-lg cursor-pointer"
            >
              View All Photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, idx) => (
              <figure
                key={item.id}
                className="group bg-white border border-[#E6DDD7] rounded-2xl overflow-hidden flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4EBE8] text-left cursor-pointer"
                  aria-label={`Open ${item.title} in lightbox`}
                >
                  <ResilientImage
                    src={item.imageUrl}
                    alt={item.title}
                    fallbackTitle={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-end p-3">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 text-[#2C2220]">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                  </div>
                </button>

                <figcaption className="p-5 space-y-1">
                  <p className="text-xs text-[#9A7245]">{item.category}</p>
                  <h2 className="font-display text-xl font-semibold text-[#2C2220]">
                    {item.title}
                  </h2>
                  {item.caption && (
                    <p className="text-xs text-[#5A4C48] leading-relaxed">{item.caption}</p>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeItem && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 bg-[#1B1413]/90 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden border border-[#E6DDD7]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close lightbox"
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#2C2220] flex items-center justify-center shadow-sm cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[16/10] bg-[#2C2220]">
              <ResilientImage
                src={activeItem.imageUrl}
                alt={activeItem.title}
                fallbackTitle={activeItem.title}
                className="w-full h-full object-contain"
              />

              {filtered.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length)
                    }
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#2C2220] flex items-center justify-center shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex((lightboxIndex + 1) % filtered.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#2C2220] flex items-center justify-center shadow-sm cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs text-[#9A7245]">
                  {activeItem.category} ·{' '}
                  <span className="tabular-nums">
                    {lightboxIndex + 1} / {filtered.length}
                  </span>
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#2C2220]">
                  {activeItem.title}
                </h3>
                {activeItem.caption && (
                  <p className="text-sm text-[#5A4C48]">{activeItem.caption}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setLightboxIndex(null);
                  navigate('/booking');
                }}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Treatment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
