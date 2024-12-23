'use client';

import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import styles from './Map.module.scss';
import { MapProps } from './Map.types';
import {
  Feature,
  FeatureCollection,
  Polygon,
  MultiPolygon,
  Position,
  BBox,
} from 'geojson';

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
  if (!geoJson) {
    return null;
  }

  const wrappedFeatures: Feature[] = [];

  geoJson.features.forEach((feature: Feature) => {
    wrappedFeatures.push(feature);

    // Clone the feature and shift its coordinates by ±360 degrees longitude
    const wrapLeft: Feature = JSON.parse(JSON.stringify(feature));
    const wrapRight: Feature = JSON.parse(JSON.stringify(feature));

    if (wrapLeft.geometry.type === 'Polygon') {
      wrapLeft.geometry = wrapLeft.geometry as Polygon;
      wrapLeft.geometry.coordinates = wrapLeft.geometry.coordinates.map(
        (ring: Position[]) =>
          ring.map(([lon, lat]: Position) => [lon - 360, lat])
      );
      wrapRight.geometry = wrapRight.geometry as Polygon;
      wrapRight.geometry.coordinates = wrapRight.geometry.coordinates.map(
        (ring: Position[]) =>
          ring.map(([lon, lat]: Position) => [lon + 360, lat])
      );
    } else if (wrapLeft.geometry.type === 'MultiPolygon') {
      wrapLeft.geometry = wrapLeft.geometry as MultiPolygon;
      wrapLeft.geometry.coordinates = wrapLeft.geometry.coordinates.map(
        (polygon: Position[][]) =>
          polygon.map((ring: Position[]) =>
            ring.map(([lon, lat]: Position) => [lon - 360, lat])
          )
      );
      wrapRight.geometry = wrapRight.geometry as MultiPolygon;
      wrapRight.geometry.coordinates = wrapRight.geometry.coordinates.map(
        (polygon: Position[][]) =>
          polygon.map((ring: Position[]) =>
            ring.map(([lon, lat]: Position) => [lon + 360, lat])
          )
      );
    }

    wrappedFeatures.push(wrapLeft, wrapRight);
  });

  return { ...geoJson, features: wrappedFeatures };
};

const Map: React.FC<MapProps> = ({
  markers,
  geoJSON,
  zoom,
  disableDragging = true,
  disableZoom = true,
}) => {
  // Set the initial center of the map and zoom level
  const center: LatLngExpression =
    markers && markers.length > 0 ? [markers[0].lat, markers[0].lng] : [20, 0]; // Default center (around Africa)
  const zoomVal = zoom ?? 3; // Zoom level
  const wrappedGeoJsonData = wrapGeoJsonFeatures(geoJSON);

  return (
    <MapContainer
      center={center}
      zoom={zoomVal}
      className={styles.mapContainer}
      dragging={!disableDragging}
      zoomControl={!disableZoom} // Disable zoom controls if the prop is set
      scrollWheelZoom={!disableZoom} // Disable scroll wheel zoom if the prop is set
      doubleClickZoom={!disableZoom} // Disable double-click zoom if the prop is set
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        noWrap={false}
      />
      {wrappedGeoJsonData && <GeoJSON data={wrappedGeoJsonData} />}
      {markers &&
        markers.length > 0 &&
        markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            {marker.popupText && <Popup>{marker.popupText}</Popup>}
          </Marker>
        ))}
    </MapContainer>
  );
};

export default Map;
