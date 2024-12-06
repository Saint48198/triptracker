import Navbar from '@/components/Navbar';
import ClientButtonWrapper from '@/components/ClientButtonWrapper';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold my-4">Welcome to Trip Tracker</h1>
        <ClientButtonWrapper />
      </div>
    </>
  );
}
