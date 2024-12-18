export interface Country {
  id: number;
  name: string;
  abbreviation: string;
  lat: number;
  lng: number;
  slug: string;
  last_visited?: string;
}

export interface Trip {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface State {
  id: number;
  name: string;
  abbr?: string;
  country_id: number;
  country_name?: string;
  last_visited?: string;
}

export interface City {
  id: number;
  name: string;
  lat: number;
  lng: number;
  state_id?: number;
  state_name?: string;
  country_id: number;
  country_name?: string;
  last_visited?: string;
}

export interface Attraction {
  id: number;
  name: string;
  lat: number;
  lng: number;
  is_unesco: boolean;
  is_national_park: boolean;
  last_visited?: string;
  country_id: number;
  country_name?: string;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName?: string; // Optional field for a human-readable location name
}

export interface MapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
}
