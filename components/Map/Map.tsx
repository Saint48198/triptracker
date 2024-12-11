'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import styles from './Map.module.scss';

const Map = () => {
  // Set the initial center of the map and zoom level
  const center: LatLngExpression = [51.505, -0.09];

  return (
    <MapContainer center={center} zoom={13} className={styles.mapContainer}>
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
