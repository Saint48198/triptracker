export interface Country {
  id: number;
  name: string;
  abbreviation: string;
  lat: number;
  lng: number;
  slug: string;
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
}
