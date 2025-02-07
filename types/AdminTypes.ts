import { FilterOption } from '@/components/FilterBy/FilterBy.types';
import { Country } from '@/types/ContentTypes';

export interface AdminFormProps {
  entity: string;
  entities: string;
  name: string;
  setName: (value: string) => void;
  countryId: string;
  setCountryId: (value: string) => void;
  countries: Country[];
  states?: { id: string; name: string }[];
  stateId?: string;
  setStateId?: (value: string) => void;
  lat: string;
  setLat: (value: string) => void;
  lng: string;
  setLng: (value: string) => void;
  lastVisited?: string;
  setLastVisited?: (value: string) => void;
  wikiTerm?: string;
  setWikiTerm?: (value: string) => void;
  handleGeocode: () => void;
  loading: boolean;
  isUnesco?: boolean;
  setIsUnesco?: (value: boolean) => void;
  isNationalPark?: boolean;
  setIsNationalPark?: (value: boolean) => void;
}

export interface DataPageProps {
  entity: string;
  entities: string;
  title: string;
  fetchDataAction: (
    query: string
  ) => Promise<{ entries: any[]; total: number }>;
  fetchFiltersAction: () => Promise<FilterOption[]>;
  columns: { key: string; label: string }[];
  filterLabel: string;
  filterKey: string;
  action: (
    row: any,
    handleDelete: (id: string) => Promise<void>,
    handleNavToDetail: (id: string) => void
  ) => React.JSX.Element;
}
