'use client';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
} from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import styles from './Map.module.scss';
import { MapProps, MarkerProps } from './Map.types';
import React, { useEffect } from 'react';

// Fix the default icon path
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const ResetMapView = ({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const InvalidateSizeOnResize: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    requestAnimationFrame(() => map.invalidateSize());
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    if ((document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => map.invalidateSize());
    }
    return () => ro.disconnect();
  }, [map]);
  return null;
};

const Map: React.FC<MapProps> = ({
  markers,
  geoJSON,
  zoom,
  disableDragging = true,
  disableZoom = true,
  centerLocation = [20, 0],
}) => {
  const center: LatLngExpression =
    markers && markers.length === 1
      ? [markers[0].lat, markers[0].lng]
      : centerLocation;
  const zoomVal = zoom ?? (markers && markers.length === 1 ? 12 : 3);

  return (
    <MapContainer
      center={center}
      zoom={zoomVal}
      className={styles.mapContainer}
      dragging={!disableDragging}
      zoomControl={!disableZoom}
      scrollWheelZoom={!disableZoom}
      doubleClickZoom={!disableZoom}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        noWrap={false}
      />
      <ResetMapView center={center} zoom={zoomVal} />
      <InvalidateSizeOnResize />
      {geoJSON && <GeoJSON data={geoJSON} />}
      {markers?.map((marker: MarkerProps, index: number) => (
        <Marker key={index} position={[marker.lat, marker.lng]}>
          {marker.popupText && <Popup>{marker.popupText}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
