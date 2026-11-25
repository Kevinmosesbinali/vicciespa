import { useCallback, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation } from 'lucide-react';
import { useSpa } from '../context/SpaContext';

function SpaMarkerWithWindow() {
  const { settings } = useSpa();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  const position = {
    lat: Number(settings.mapLat) || -33.9249,
    lng: Number(settings.mapLng) || 18.4241,
  };

  const handleClose = useCallback(() => setInfoOpen(false), []);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        title={settings.businessName}
        onClick={() => setInfoOpen(true)}
      >
        <Pin background="#7D4A4C" borderColor="#2C2220" glyphColor="#FAF7F4" scale={1.15} />
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow anchor={marker} maxWidth={240} onCloseClick={handleClose}>
          <div className="p-1 text-[#2C2220]">
            <p className="font-semibold text-sm">{settings.businessName}</p>
            <p className="text-xs text-[#5A4C48] mt-0.5">{settings.locationText}</p>
            <p className="text-xs text-[#6E5F5B] mt-1">{settings.serviceAreaLabel}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function CapeTownMap() {
  const { settings, googleMapsApiKey } = useSpa();
  const center = {
    lat: Number(settings.mapLat) || -33.9249,
    lng: Number(settings.mapLng) || 18.4241,
  };
  const zoom = Number(settings.mapZoom) || 11;

  const externalDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${center.lat},${center.lng}`
  )}`;

  if (!googleMapsApiKey) {
    return (
      <div className="w-full h-[360px] rounded-2xl border border-[#E6DDD7] bg-gradient-to-br from-[#F4EBE8] via-[#FAF7F4] to-[#EFE8E2] flex flex-col items-center justify-center p-8 text-center">
        <MapPin className="w-9 h-9 text-[#7D4A4C] mb-3" strokeWidth={1.5} />
        <h3 className="font-display text-2xl font-semibold text-[#2C2220]">
          {settings.locationText}
        </h3>
        <p className="text-sm text-[#5A4C48] max-w-md mt-2">
          Mobile spa service across {settings.serviceAreaLabel}. Exact dispatch location can be updated from the Admin Dashboard.
        </p>
        <a
          href={externalDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>View Cape Town Area on Google Maps</span>
        </a>
      </div>
    );
  }

  return (
    <div className="w-full h-[380px] rounded-2xl overflow-hidden border border-[#E6DDD7] bg-[#EFE8E2]">
      <APIProvider apiKey={googleMapsApiKey} language="en" region="ZA">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling="cooperative"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          <SpaMarkerWithWindow />
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
