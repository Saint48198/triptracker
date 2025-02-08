import React from 'react';
import FormInput from '@/components/FormInput/FormInput';
import FormSelect from '@/components/FormSelect/FormSelect';
import FormCheckbox from '@/components/FormCheckbox/FormCheckbox';
import LatLngField from '@/components/LatLngField/LatLngField';
import MapComponent from '@/components/Map/Map';
import { Country } from '@/types/ContentTypes';
import WikiLookup from '@/components/AdminDetail/WikiLookup';
import { AdminFormProps } from '@/types/AdminTypes';
import styles from './AdminDetailForm.module.scss';

export default function AdminForm({
  entity,
  entities,
  name,
  setName,
  countryId = '',
  setCountryId,
  countries = [],
  states = [],
  stateId,
  setStateId,
  lat = '',
  setLat,
  lng = '',
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
      <div className={styles.form}>
        <h2>Details</h2>
        <FormInput
          label="Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Conditionally render states dropdown */}
        {states.length > 0 && setStateId && (
          <FormSelect
            label="State"
            id="stateId"
            options={states.map((state) => ({
              value: state.id?.toString(),
              label: state.name,
            }))}
            noValueOption={{ include: true, label: 'Select a state' }}
            value={stateId || ''}
            onChange={(e) => setStateId(e.target.value)}
            required
          />
        )}

        <FormSelect
          label="Country"
          id="countryId"
          options={countries.map((country: Country) => ({
            value: country.id?.toString(),
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
          lat={parseFloat(lat || '0')}
          lngLabel="Longitude"
          lng={parseFloat(lng || '0')}
          isLoading={loading}
          onLatChange={(lat) => setLat(lat.toString())}
          onLngChange={(lng) => setLng(lng.toString())}
          onLookup={handleGeocode}
        />
      </div>
      {lat && lng && (
        <MapComponent
          markers={[
            {
              lat: parseFloat(lat || '0'),
              lng: parseFloat(lng || '0'),
              popupText: name,
            },
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
