// services/photosService.ts

import { Photo } from '@/types/PhotoTypes';

export interface PhotoPayload {
  entityType: 'cities' | 'attractions';
  entityId: number;
  photos: Photo[]; // Array of photos to add/remove
}

const API_BASE = '/api/photos/bulk';

export const bulkAddPhotos = async (payload: PhotoPayload): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to add photos: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding photos:', error);
    throw error;
  }
};

export const bulkRemovePhotos = async (payload: PhotoPayload): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove photos: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing photos:', error);
    throw error;
  }
};
