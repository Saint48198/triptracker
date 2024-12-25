export interface MapProps {
  markers?: MarkerProps[];
  geoJSON?: any;
  zoom?: number;
  disableDragging?: boolean;
  disableZoom?: boolean;
  centerLocation?: [number, number];
}

export interface MarkerProps {
  lat: number;
  lng: number;
  popupText?: string;
}
