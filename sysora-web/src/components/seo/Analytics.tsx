import Script from "next/script";

/**
 * Google Analytics, off until NEXT_PUBLIC_GA_ID is set.
 *
 * Deliberately not on by default. The privacy policy states that the site
 * runs no analytics, so the ID must not be set until the analytics and
 * cookies passages of that policy have been updated. See docs/operations.md.
 * Without the ID this renders nothing and loads nothing.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
