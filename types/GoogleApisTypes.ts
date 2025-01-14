declare module 'googleapis/build/src/apis/photoslibrary' {
  import { GoogleApis } from 'googleapis';

  export const photoslibrary_v1: any;

  export function photoslibrary(options: any): any;

  export interface PhotosLibrary {
    albums: {
      list(params: any): Promise<any>;
    };
    mediaItems: {
      list(params: any): Promise<any>;
    };
  }

  export default GoogleApis;
}
