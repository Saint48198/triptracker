import AdminDetailPage from '@/components/AdminDetail/AdminDetailPage';
import { ENTITY_TYPE_ATTRACTION, ENTITY_TYPE_ATTRACTIONS } from '@/constants';

export default function AttractionPage() {
  return (
    <AdminDetailPage
      entity={ENTITY_TYPE_ATTRACTION}
      entities={ENTITY_TYPE_ATTRACTIONS}
    />
  );
}
