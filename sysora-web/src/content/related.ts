/** Names for the internal pages an article's related block can point at. */
const LABELS: Record<string, string> = {
  "/pricing": "Hourly pricing, all seven packs",
  "/about": "About Sysora Stack and its founder",
  "/services": "All services",
  "/guides": "All guides",
  "/case-studies": "Case studies from the Upwork record",
  "/for/agencies": "White-label GoHighLevel team for agencies",
  "/for/local-business": "GoHighLevel for US local businesses",
  "/request-estimate": "Request a project estimate",
  "/book-a-call": "Book a free 15-minute call",
  "/contact": "Contact us",
};

export function findStaticLabel(path: string): string {
  return LABELS[path] ?? path;
}
