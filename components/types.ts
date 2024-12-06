export interface Country {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Trip {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  notes?: string;
}
