export interface MapProps {
  markers: MarkerProps[];
  zoom?: number;
}

interface MarkerProps {
  lat: number;
  lng: number;
  popupText?: string;
}
