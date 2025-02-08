'use client';

import React from 'react';
import DetailPage from '@/components/DetailPage/DetailPage';
import { WikiInfo } from '@/types/ContentTypes';
import { Photo } from '@/types/PhotoTypes';
import { ENTITY_TYPE_ATTRACTIONS } from '@/constants';

const fetchDetails = async (id: string) => {
  const response = await fetch(`/api/${ENTITY_TYPE_ATTRACTIONS}/${id}`);
  return response.json();
};

const fetchWikiData = async (wikiTerm: string): Promise<WikiInfo | null> => {
  const response = await fetch(`/api/info?query=${wikiTerm}`);
  return response.ok ? response.json() : null;
};

const fetchPhotos = async (id: string): Promise<Photo[]> => {
  const response = await fetch(`/api/photos/${ENTITY_TYPE_ATTRACTIONS}/${id}`);
  const data = await response.json();
  return data.photos;
};

const AttractionPage: React.FC = () => {
  return (
    <DetailPage
      fetchDetails={fetchDetails}
      fetchWikiData={fetchWikiData}
      fetchPhotos={fetchPhotos}
      type="attraction"
    />
  );
};

export default AttractionPage;
