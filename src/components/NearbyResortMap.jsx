import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

// Fix leaflet marker icons
function fixLeafletIcons() {
  if (typeof window !== 'undefined' && window.L) {
    delete window.L.Icon.Default.prototype._getIconUrl;
    window.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }
}

// 20 miles in degrees latitude ≈ 0.29, longitude varies by latitude
function milesToDegLat(miles) { return miles / 69.0; }
function milesToDegLng(miles, lat) { return miles / (69.0 * Math.cos(lat * Math.PI / 180)); }

function AutoBounds({ userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (!userLocation) return;
    const RADIUS_MILES = 20;
    const dLat = milesToDegLat(RADIUS_MILES);
    const dLng = milesToDegLng(RADIUS_MILES, userLocation.lat);
    const bounds = [
      [userLocation.lat - dLat, userLocation.lng - dLng],
      [userLocation.lat + dLat, userLocation.lng + dLng],
    ];
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [userLocation, map]);
  return null;
}

export default function NearbyResortMap({ userLocation, resorts, runCountByResort }) {
  useEffect(() => {
    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const nearbyResorts = resorts
    .filter(r => r.latitude && r.longitude)
    .slice(0, 15);

  if (!userLocation) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 mt-4" style={{ height: 240 }}>
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoBounds userLocation={userLocation} />

        {/* User location marker */}
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={3000}
          pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.3 }}
        />

        {/* Resort markers */}
        {nearbyResorts.map(resort => (
          <Marker
            key={resort.id}
            position={[resort.latitude, resort.longitude]}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{resort.name}</p>
                <p className="text-slate-500 text-xs">{resort.location}</p>
                {runCountByResort?.[resort.id] > 0 && (
                  <p className="text-xs text-sky-600 mt-1">{runCountByResort[resort.id]} runs</p>
                )}
                <a
                  href={createPageUrl(`Resort?id=${resort.id}`)}
                  className="text-sky-600 text-xs underline mt-1 block"
                >
                  View Resort →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}