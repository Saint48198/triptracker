import React from 'react';
import { Trip } from './types';

interface TripListProps {
  trips: Trip[];
}

const TripList: React.FC<TripListProps> = ({ trips }) => (
  <ul>
    {trips.map((trip) => (
      <li key={trip.id}>
        <h3>{trip.destination}</h3>
        <p>
          From: {trip.startDate} To: {trip.endDate}
        </p>
        {trip.notes && <p>Notes: {trip.notes}</p>}
      </li>
    ))}
  </ul>
);

export default TripList;
