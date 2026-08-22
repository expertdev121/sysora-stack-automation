/**
 * Shown when an environment variable the page needs is missing, so a
 * half-configured local setup explains itself instead of throwing.
 */
export function ConfigNotice({ missing }: { missing: string }) {
  return (
    <div className="px-6 py-5 rounded-[14px] bg-[var(--warning-bg)] border-[1.5px] border-[var(--warning-border)]">
      <p className="m-0 text-[15px] font-bold text-[var(--warning)]">
        <code className="font-mono">{missing}</code> is not set
      </p>
      <p className="mt-2 mb-0 text-[15px] leading-[1.75] text-[var(--ink-600)]">
        Copy <code className="font-mono text-[14px]">.env.example</code> to{" "}
        <code className="font-mono text-[14px]">.env.local</code> and fill it in. The service role
        key is in the Supabase dashboard under Project Settings → API.
      </p>
    </div>
  );
}
