// utils/imageUtils.ts
export const getTransformedImageUrl = (url: string, height: number): string => {
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex !== -1) {
    parts.splice(uploadIndex + 1, 0, `h_${height},c_fill,q_auto`);
    return parts.join('/');
  }
  return url;
};
