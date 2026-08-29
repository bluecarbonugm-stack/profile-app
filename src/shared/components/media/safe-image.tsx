import { useState, type ImgHTMLAttributes, type ReactNode } from "react";

/**
 * <img> that swaps to `fallback` when the URL fails to load - a typo'd admin
 * input, a Drive file that got deleted after the link was pasted, a dead
 * external link - instead of leaving the browser's broken-image icon up
 * indefinitely. Every image URL on the profile page comes from a free-text
 * admin field with no upload/validation step, so this is the difference
 * between "looks broken" and "gracefully shows the same placeholder as an
 * empty field".
 */
export function SafeImage({
  src,
  fallback,
  onError,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { src: string; fallback: ReactNode }) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  return (
    <img
      src={src}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
      {...props}
    />
  );
}
