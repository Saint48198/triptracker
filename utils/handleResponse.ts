// utils/handleResponse.ts
import { useRouter } from 'next/navigation';

interface HandleResponseParams {
  response: Response;
  entity: 'city' | 'attraction' | 'country' | 'state';
  editingEntity: string | null;
  setMessage: (message: string) => void;
  setMessageType: (type: 'error' | 'success' | '') => void;
  router: ReturnType<typeof useRouter>;
}

export const handleResponse = async ({
  response,
  entity,
  editingEntity,
  setMessage,
  setMessageType,
  router,
}: HandleResponseParams) => {
  if (response.ok) {
    const data = await response.json();

    if (data.message) {
      const newEntityId = editingEntity ?? data.id;

      setMessageType('success');
      setMessage(data.message);
      // Update the URL to include the new entityId
      router.push(`/admin/${entity}?id=${newEntityId}`);
    } else {
      setMessage(data.error ?? `Failed to save ${entity}.`);
      setMessageType('error');
    }
  } else {
    setMessage(`Failed to save ${entity}.`);
    setMessageType('error');
  }
};
