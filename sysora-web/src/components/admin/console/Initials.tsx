/**
 * The square initials chip the console uses in place of an avatar.
 *
 * Company names here come from checkout, so they are as likely to be
 * "Cedar & Co Realty" as a single word: take the first letter of the
 * first two words that start with one, and fall back to the first two
 * characters when there is nothing else to use.
 */
export function Initials({ name, className = "" }: { name: string; className?: string }) {
  const letters =
    name
      .split(/\s+/)
      .map((w) => w.replace(/[^A-Za-z0-9]/g, "")[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("") || name.slice(0, 2);

  return (
    <span
      aria-hidden="true"
      className={`flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-[#F0FAF6] text-[12px] font-bold uppercase text-[var(--accent-strong)] ${className}`}
    >
      {letters.toUpperCase()}
    </span>
  );
}
