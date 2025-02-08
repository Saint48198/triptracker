import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import Message from '@/components/Message/Message';
import dynamic from 'next/dynamic';
import { WikiInfo } from '@/types/ContentTypes';
import { Photo } from '@/types/PhotoTypes';
import styles from './DetailPage.module.scss';
import ImageGrid from '@/components/ImageGrid/ImageGrid';

const MapComponent = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

interface DetailPageProps {
  fetchDetails: (id: string) => Promise<any>;
  fetchWikiData?: (wikiTerm: string) => Promise<WikiInfo | null>;
  fetchPhotos?: (id: string) => Promise<Photo[]>;
  type: 'city' | 'attraction';
}

const DetailPage: React.FC<DetailPageProps> = ({
  fetchDetails,
  fetchWikiData,
  fetchPhotos,
  type,
}) => {
  const params = useParams();
  const id = params?.id as string;
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [wikiInfo, setWikiInfo] = useState<WikiInfo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (id) {
      fetchDetails(id)
        .then((result) => {
          setDetails(result);
          if (result.wiki_term && fetchWikiData) {
            fetchWikiData(result.wiki_term).then(setWikiInfo);
          }
          if (fetchPhotos) {
            fetchPhotos(id).then(setPhotos);
          }
        })
        .catch((error) => {
          console.error(`Failed to fetch ${type} details:`, error);
          setMessage(`Failed to fetch ${type} details.`);
        })
        .finally(() => setLoading(false));
    }
  }, [id, fetchDetails, fetchWikiData, fetchPhotos, type]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (message) {
    return <Message message={message} type="error" />;
  }

  return (
    <>
      <Navbar />
      <main className={styles.detailPage}>
        {details ? (
          <>
            {details.lat && details.lng && (
              <div>
                <MapComponent
                  markers={[
                    {
                      lat: parseFloat(details.lat),
                      lng: parseFloat(details.lng),
                      popupText: `${details.name}`,
                    },
                  ]}
                  zoom={8}
                />
              </div>
            )}
            <div className={styles.container}>
              <div>
                <h1 className={styles.title}>
                  {details.name}
                  {details.state_name && <span>, {details.state_name}</span>}
                </h1>
                <div className={styles.subtitle}>
                  <span>{details.country_name}</span>
                </div>

                {wikiInfo && (
                  <div>
                    <h2 className={styles.wikiInfo}>Wikipedia Info</h2>
                    <p>{wikiInfo.intro}</p>
                    <a
                      href={wikiInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.wikiLink}
                    >
                      Read more on Wikipedia
                    </a>
                  </div>
                )}

                {photos.length > 0 && (
                  <div>
                    <h2 className={styles.photos}>Photos</h2>
                    <ImageGrid
                      images={photos}
                      onImageClick={() => {}}
                    ></ImageGrid>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="notFound">
            <p>{type.charAt(0).toUpperCase() + type.slice(1)} not found.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default DetailPage;
