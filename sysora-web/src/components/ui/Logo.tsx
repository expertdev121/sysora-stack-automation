/**
 * Sysora logo lockup and standalone mark.
 *
 * The lockup is the hosted brand file, loaded straight from the CDN so a
 * new logo is a URL change rather than a redraw. It is a plain <img>
 * rather than next/image: the file is an SVG, so there is nothing for the
 * optimiser to resize, and this avoids adding the host to remotePatterns.
 *
 * The mark below is still drawn inline. It is square, and the lockup is a
 * wide wordmark that would distort at 1:1, so the two are not
 * interchangeable.
 */

export const LOGO_URL =
  "https://assets.cdn.filesafe.space/5VD5QnpROyZi3omw1BP1/media/6acf2f6f412f76b526c2c1e1.svg";

/** Natural proportions of the lockup, for layout that needs them. */
export const LOGO_ASPECT = 566.98 / 116;

export function SysoraLogo({ className = "h-8 w-auto block" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO_URL} alt="Sysora" className={className} width={567} height={116} />
  );
}

export function SysoraMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <line x1="32" y1="32" x2="14" y2="14" stroke="#065F46" strokeWidth="2" strokeOpacity="0.45" />
      <line x1="32" y1="32" x2="50" y2="14" stroke="#065F46" strokeWidth="2" strokeOpacity="0.45" />
      <line x1="32" y1="32" x2="54" y2="32" stroke="#065F46" strokeWidth="2" strokeOpacity="0.45" />
      <line x1="32" y1="32" x2="50" y2="50" stroke="#065F46" strokeWidth="2" strokeOpacity="0.45" />
      <line x1="32" y1="32" x2="14" y2="50" stroke="#065F46" strokeWidth="2" strokeOpacity="0.45" />
      <line x1="32" y1="32" x2="10" y2="32" stroke="#065F46" strokeWidth="2" strokeOpacity="0.45" />
      <circle cx="14" cy="14" r="4" fill="#065F46" />
      <circle cx="50" cy="14" r="4" fill="#065F46" />
      <circle cx="54" cy="32" r="4" fill="#065F46" />
      <circle cx="50" cy="50" r="4" fill="#065F46" />
      <circle cx="14" cy="50" r="4" fill="#065F46" />
      <circle cx="32" cy="32" r="9" fill="#1A8C62" />
      <circle cx="32" cy="32" r="4" fill="#87C38F" />
      </svg>
  );
}
