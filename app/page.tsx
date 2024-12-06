import TripList from '../components/TripList';
import { Trip } from '../components/types';

async function getTrips(): Promise<Trip[]> {
  const res = await fetch('http://localhost:3000/api/trips');
  return res.json();
}

export default async function Home() {
  const trips = await getTrips();

  return (
    <div>
      <h1>Trip Tracker</h1>
      <TripList trips={trips} />
    </div>
  );
}
