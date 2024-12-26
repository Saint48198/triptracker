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
import {
  Feature,
  FeatureCollection,
  Polygon,
  MultiPolygon,
  Position,
} from 'geojson';
import { useEffect } from 'react';

// Fix the default icon path
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const wrapGeoJsonFeatures = (
  geoJson: FeatureCollection | undefined
): FeatureCollection | null => {
  if (!geoJson) return null;

  const wrappedFeatures: Feature[] = [];

  geoJson.features.forEach((feature: Feature) => {
    wrappedFeatures.push(feature);

    const wrapLeft: Feature = JSON.parse(JSON.stringify(feature));
    const wrapRight: Feature = JSON.parse(JSON.stringify(feature));

    if (wrapLeft.geometry.type === 'Polygon') {
      wrapLeft.geometry.coordinates = wrapLeft.geometry.coordinates.map(
        (ring) => ring.map(([lon, lat]) => [lon - 360, lat])
      );
      wrapRight.geometry.coordinates = wrapRight.geometry.coordinates.map(
        (ring) => ring.map(([lon, lat]) => [lon + 360, lat])
      );
    } else if (wrapLeft.geometry.type === 'MultiPolygon') {
      wrapLeft.geometry.coordinates = wrapLeft.geometry.coordinates.map(
        (polygon) =>
          polygon.map((ring) => ring.map(([lon, lat]) => [lon - 360, lat]))
      );
      wrapRight.geometry.coordinates = wrapRight.geometry.coordinates.map(
        (polygon) =>
          polygon.map((ring) => ring.map(([lon, lat]) => [lon + 360, lat]))
      );
    }

    wrappedFeatures.push(wrapLeft, wrapRight);
  });

  return { ...geoJson, features: wrappedFeatures };
};

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

const ResetLayerControl = ({
  geoJSON,
  center,
  zoom,
}: {
  geoJSON: FeatureCollection | null;
  center: LatLngExpression;
  zoom: number;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!geoJSON) return;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON) {
        map.removeLayer(layer);
      }
    });

    // Add new GeoJSON layer
    const geoJsonLayer = new L.GeoJSON(geoJSON);
    geoJsonLayer.addTo(map);

    // Adjust bounds only if no center and zoom are explicitly provided
    if (!center && !zoom) {
      map.fitBounds(geoJsonLayer.getBounds());
    }
  }, [geoJSON, map, center, zoom]);

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
  const zoomVal = zoom ?? (markers && markers.length === 1 ? 12 : 3); // Zoom level
  const wrappedGeoJsonData = wrapGeoJsonFeatures(geoJSON);

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
      <ResetLayerControl
        geoJSON={wrappedGeoJsonData}
        center={center}
        zoom={zoomVal}
      />
      {markers &&
        markers.map((marker: MarkerProps, index: number) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            {marker.popupText && <Popup>{marker.popupText}</Popup>}
          </Marker>
        ))}
    </MapContainer>
  );
};

export default Map;
