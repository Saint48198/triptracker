import React from 'react';
import FormInput from '@/components/FormInput/FormInput';
import FormSelect from '@/components/FormSelect/FormSelect';
import FormCheckbox from '@/components/FormCheckbox/FormCheckbox';
import LatLngField from '@/components/LatLngField/LatLngField';
import MapComponent from '@/components/Map/Map';
import { Country } from '@/types/ContentTypes';
import WikiLookup from '@/components/AdminDetail/WikiLookup';

interface AdminFormProps {
  name: string;
  setName: (value: string) => void;
  countryId: string;
  setCountryId: (value: string) => void;
  countries: Country[];
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

export default function AdminForm({
  name,
  setName,
  countryId,
  setCountryId,
  countries,
  lat,
  setLat,
  lng,
  setLng,
  lastVisited,
  setLastVisited,
  wikiTerm,
  setWikiTerm,
  handleGeocode,
  loading,
  isUnesco,
  setIsUnesco,
  isNationalPark,
  setIsNationalPark,
}: AdminFormProps) {
  return (
    <>
      <h2>Details</h2>
      <FormInput
        label="Name"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <FormSelect
        label="Country"
        id="countryId"
        options={countries.map((country: Country) => ({
          value: country.id.toString(),
          label: country.name,
        }))}
        noValueOption={{ include: true, label: 'Select a country' }}
        value={countryId}
        onChange={(e) => setCountryId(e.target.value)}
        required
      />

      {setLastVisited && (
        <FormInput
          label="Last Visited"
          id="lastVisited"
          value={lastVisited || ''}
          onChange={(e) => setLastVisited!(e.target.value)}
        />
      )}

      {/* Show UNESCO & National Park only for attractions */}
      {setIsUnesco && (
        <FormCheckbox
          label="UNESCO Site"
          id="isUnesco"
          checked={isUnesco!}
          onChange={(e) => setIsUnesco!(e.target.checked)}
        />
      )}
      {setIsNationalPark && (
        <FormCheckbox
          label="National Park"
          id="isNationalPark"
          checked={isNationalPark!}
          onChange={(e) => setIsNationalPark!(e.target.checked)}
        />
      )}

      <h2>Location</h2>
      <LatLngField
        latLabel="Latitude"
        lat={parseFloat(lat)}
        lngLabel="Longitude"
        lng={parseFloat(lng)}
        isLoading={loading}
        onLatChange={(lat) => setLat(lat.toString())}
        onLngChange={(lng) => setLng(lng.toString())}
        onLookup={handleGeocode}
      />

      {lat && lng && (
        <MapComponent
          markers={[
            { lat: parseFloat(lat), lng: parseFloat(lng), popupText: name },
          ]}
          zoom={8}
        />
      )}

      <WikiLookup
        wikiTerm={wikiTerm || ''}
        setWikiTerm={setWikiTerm || (() => {})}
      />
    </>
  );
}
