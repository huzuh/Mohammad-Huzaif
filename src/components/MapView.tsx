import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';

export interface MapMarkerPoint {
  name: string;
  coordinates: [number, number];
  subtitle?: string;
  primary?: boolean;
}

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers: MapMarkerPoint[];
  routePoints?: [number, number][];
  heightClass?: string;
}

function createPinIcon(primary: boolean) {
  const color = primary ? '#0F4C5C' : '#D97706';
  const size = primary ? 28 : 22;
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
}

export function MapView({
  center,
  zoom = 9,
  markers,
  routePoints,
  heightClass = 'h-80 sm:h-96',
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const mapSignature = JSON.stringify({ center, zoom, markers, routePoints });
  const stableConfig = useMemo(
    () =>
      JSON.parse(mapSignature) as {
        center: [number, number];
        zoom: number;
        markers: MapMarkerPoint[];
        routePoints?: [number, number][];
      },
    [mapSignature]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (mapRef.current) {
      mapRef.current.stop();
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(container, {
      center: stableConfig.center,
      zoom: stableConfig.zoom,
      scrollWheelZoom: false,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const boundsPoints: L.LatLngExpression[] = [];

    stableConfig.markers.forEach((pt) => {
      const marker = L.marker(pt.coordinates, {
        icon: createPinIcon(Boolean(pt.primary)),
      }).addTo(map);
      const popupHtml = `<div style="min-width:140px"><strong style="color:#0f172a;font-size:13px">${pt.name}</strong>${
        pt.subtitle
          ? `<div style="color:#475569;font-size:12px;margin-top:2px">${pt.subtitle}</div>`
          : ''
      }</div>`;
      marker.bindPopup(popupHtml);
      if (pt.primary) {
        marker.openPopup();
      }
      boundsPoints.push(pt.coordinates);
    });

    if (stableConfig.routePoints && stableConfig.routePoints.length >= 2) {
      const polyline = L.polyline(stableConfig.routePoints, {
        color: '#0F4C5C',
        weight: 3,
        dashArray: '6 6',
        opacity: 0.85,
      }).addTo(map);
      map.fitBounds(polyline.getBounds(), { padding: [40, 40], maxZoom: 11, animate: false });
    } else if (boundsPoints.length > 1) {
      map.fitBounds(L.latLngBounds(boundsPoints), { padding: [40, 40], maxZoom: 10, animate: false });
    } else {
      map.setView(stableConfig.center, stableConfig.zoom, { animate: false });
    }

    mapRef.current = map;

    return () => {
      map.stop();
      map.remove();
      mapRef.current = null;
    };
  }, [stableConfig]);

  return (
    <div
      data-testid="leaflet-map"
      className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 bg-slate-100`}
    >
      <div ref={containerRef} className="w-full h-full" aria-label="Interactive OpenStreetMap" />
    </div>
  );
}
