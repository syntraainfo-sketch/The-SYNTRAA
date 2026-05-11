const CLOUD =
  typeof process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME === "string"
    ? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    : "";

export function cld(publicId: string, width?: number): string {
  if (!CLOUD || !publicId) return "/globe.svg";
  const w = width ? `w_${width},` : "";
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,${w}${publicId}`;
}
