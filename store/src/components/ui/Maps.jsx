import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NOMINATIM_CACHE = new Map();

async function geocodeAddress({ province, city, district, village }) {
  const parts = [village?.name, district?.name, city?.name, province?.name].filter(Boolean);
  if (parts.length === 0) return null;
  const q = parts.join(', ') + ', Indonesia';
  if (NOMINATIM_CACHE.has(q)) return NOMINATIM_CACHE.get(q);
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('geocode failed');
    const json = await res.json();
    if (!json[0]) return null;
    const result = { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) };
    NOMINATIM_CACHE.set(q, result);
    return result;
  } catch {
    return null;
  }
}

export function Maps({ province, city, district, village, pin, setPin, locating }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [center] = useState({ lat: -6.2088, lng: 106.8456 });

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: 11,
      zoomControl: true,
      scrollWheelZoom: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    map.on('click', (e) => {
      setPin({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sync pin marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (pin) {
      if (markerRef.current) {
        markerRef.current.setLatLng([pin.lat, pin.lng]);
      } else {
        markerRef.current = L.marker([pin.lat, pin.lng], { draggable: true })
          .addTo(map)
          .on('dragend', (e) => {
            const ll = e.target.getLatLng();
            setPin({ lat: ll.lat, lng: ll.lng });
          });
      }
    } else {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    }
  }, [pin?.lat, pin?.lng]);

  // Auto fly to selected region
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;
    if (pin) {
      map.flyTo([pin.lat, pin.lng], 15, { duration: 1.2 });
      return;
    }
    const hasSelection = province?.name || city?.name || district?.name || village?.name;
    if (!hasSelection) return;
    setGeoLoading(true);
    const targetLevel = village ? 15 : district ? 14 : city ? 12 : province ? 10 : 10;
    geocodeAddress({ province, city, district, village })
      .then((res) => {
        if (cancelled || !res || !mapRef.current) return;
        mapRef.current.flyTo([res.lat, res.lng], targetLevel, { duration: 1.2 });
      })
      .finally(() => {
        if (!cancelled) setGeoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [province?.code, city?.code, district?.code, village?.code, pin?.lat, pin?.lng]);

  return (
    <div className="w-full h-[380px] rounded-lg overflow-hidden border border-black/10 relative z-0 bg-[#f0f0f0]">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {geoLoading && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white border border-[#e6e6e6] rounded-full px-3 py-1 text-[10px] font-sans tracking-[0.12em] uppercase text-[#888] shadow z-[400]">Memuat peta...</div>
      )}
      {locating && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-[400]">
          <span className="font-sans text-[11px] text-[#888]">Mencari lokasi...</span>
        </div>
      )}
    </div>
  );
}
