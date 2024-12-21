export interface MapProps {
  markers?: MarkerProps[];
  geoJSON?: any;
  zoom?: number;
  disableDragging?: boolean;
  disableZoom?: boolean;
}

interface MarkerProps {
  lat: number;
  lng: number;
  popupText?: string;
}
