'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import styles from './Map.module.scss';
import { MapProps } from '@/components/types';

// Fix the default icon path
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const Map: React.FC<MapProps> = ({ lat, lng, zoom }) => {
  // Set the initial center of the map and zoom level
  const center: LatLngExpression = [lat ?? 39.8283, lng ?? -98.5795]; // Center of North America (approximate)
  const zoomVal = zoom ?? 3; // Zoom level

  return (
    <MapContainer
      center={center}
      zoom={zoomVal}
      className={styles.mapContainer}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={center}>
        <Popup>A popup for this marker.</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
