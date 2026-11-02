# Search and AI visibility

Tracks the GEO and SEO audit of 30 October 2026. Last reviewed
2 November 2026.

## How it is built

- **Metadata** goes through `pageMetadata()` in `src/lib/seo.ts`, so a page
  cannot forget its canonical or share image.
- **Schema** is built in `src/lib/schema.ts` from the constants the pages
  render, so a marked-up price cannot differ from a displayed one.
- **Long-form pages** are data in `src/content/articles/`, rendered by one
  layout that puts the direct answer and the date first.
- **Company facts** live in `entity` in `src/config/site.ts`. An empty value
  is left off the site and the schema. Filling one in publishes it
  everywhere, which keeps the name and address identical across pages.
- **`/llms.txt`** is a route, so its prices come from `packs`.
- **Share images** are in `public/og`, made by `scripts/og/generate.sh`.
- **`tests/seo.test.ts`** fails the build on an over-long title, a broken
  internal link, a retired price, or a headcount claim.

## Performance, measured from the build

- Preloaded fonts went from 7 to 3, and preloaded SVGs from 6 to 1. The one left
  is the header logo, which React preloads because it is above the fold.
- The 222 KB chunk the audit wanted split is React and the Next.js runtime, 71 KB
  gzipped. It cannot be split. The 109 KB chunk is the legacy polyfill bundle.
- Share images are rendered ahead of time, and `generate.sh` guards against a
  headless Chrome that writes the file and never exits.

## Where this overrides an earlier decision

`/services` and `/about` once redirected to `/` on purpose. The audit
reversed that, and the owner asked for all of it to be done. The fixed-price
catalogue stays retired: the service pages sell the work by the hour.

`/on-demand-ghl-team` moved to `/for/agencies` and redirects there. The owner
originally chose the old slug, so put it back if a campaign depends on it.

## What the audit got wrong, or what we did differently

- It said `/checkout/hours` is blocked by robots. It is not, because a more
  specific `Allow` wins. It left the sitemap anyway, but stays crawlable, as
  the owner asked in an earlier audit.
- Schema left out on purpose until someone confirms them: UK and Canada as
  service areas (checkout offers US time zones only), Hindi support, "around
  six years" of experience, and a 2026-01-01 publish date on the homepage.
- It wanted starting prices on `/services`. Those were retired, so no.
- The logo in schema is the 512px PNG, because the SVG is not 512 by 512.

## Not done, because only the business can do it

| Item | Then |
| --- | --- |
| Google Search Console and Bing Webmaster accounts | Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and `NEXT_PUBLIC_BING_SITE_VERIFICATION`, submit the sitemap, request indexing on `/` |
| GA4 property | Update the privacy policy first, because it says the site runs no analytics, then set `NEXT_PUBLIC_GA_ID` |
| Make the GitHub repository private | Needs admin on the repository. Merge or close the open pull request and delete the public fork first, because a public fork stays public |
| Founder's full name and LinkedIn | `entity.founderName`, `entity.founderLinkedIn` |
| Phone, street address, founding date | `entity.telephone`, `entity.streetAddress`, `entity.foundingDate` |
| LinkedIn company page, GoodFirms, Clutch, Upwork agency, G2 | Add each URL to `entity.companyProfiles`, using one identical name and address |
| Answering questions on Reddit and in the HighLevel community | Under the founder's real name, linking to the relevant guide |
| Client permission for the case studies | The FAQ promises not to publish a client's project without it. They use only the public record, but it is the owner's call whether that is enough |

## Not done, because it is not possible yet

- Quarterly cost and timeline report: the task ledger has no real client data.
- First-hand A2P timelines: same reason. The guide cites vendors.
- Vertical and geo pages: the audit itself says only after the editorial base.
- Two pieces a week: this is an ongoing commitment, not a task.

## Confirm before relying on these

The address in `entity` (Jagadhri, Haryana) and the title "Lead Automation
Engineer" came from the audit, not from the codebase.
