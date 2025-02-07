import AdminDetailPage from '@/components/AdminDetail/AdminDetailPage';
import { ENTITY_TYPE_CITIES, ENTITY_TYPE_CITY } from '@/constants';

export default function AttractionPage() {
  return (
    <AdminDetailPage entity={ENTITY_TYPE_CITY} entities={ENTITY_TYPE_CITIES} />
  );
}
