const DEFAULT_CLOUDINARY_CLOUD_NAME = "dqonusubo";

/** Browser + RSC: use direct NEXT_PUBLIC_* references so Next.js can inline them. */
export function publicCloudinaryCloudName(): string {
  return (
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID?.trim() ||
    DEFAULT_CLOUDINARY_CLOUD_NAME
  );
}

const CLOUD = publicCloudinaryCloudName();

/**
 * Cloudinary delivery URL: transforms must be one path segment, then `/`, then `public_id`
 * (e.g. `.../upload/f_auto,q_auto,w_900/folder/asset`). Concatenating `publicId` after a
 * trailing comma breaks delivery (images 404 / empty).
 */
export function cld(publicId: string, width?: number): string {
  const id = publicId?.trim();
  if (!id) return "/globe.svg";
  if (/^https?:\/\//i.test(id)) return id;
  if (!CLOUD) return "/globe.svg";
  const transforms = width ? `f_auto,q_auto,w_${width}` : "f_auto,q_auto";
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${transforms}/${id}`;
}
