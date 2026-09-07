"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Card, inputClass, labelClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { createService } from "@/lib/admin/actions";

/** "A2P Verification" -> "a2p-verification" */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Adding a service.
 *
 * Only a name and a URL, because everything else is easier to write in
 * the editor that appears afterwards than in a form that has to be
 * finished before anything is saved. The URL is derived from the name
 * but stays editable — it is permanent once anything links to it, and
 * a slug nobody chose is the kind of thing you regret later.
 */
export function NewServiceForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveSlug = slugTouched ? slug : slugify(name);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createService(name, effectiveSlug);
      if (result.ok) {
        setName("");
        setSlug("");
        setSlugTouched(false);
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-8 cursor-pointer rounded-[10px] border-[1.5px] border-dashed border-[var(--border-default)] bg-transparent px-5 py-3 text-[13.5px] font-semibold text-[var(--accent-strong)] hover:bg-[var(--mint-50)]"
      >
        + Add a service
      </button>
    );
  }

  return (
    <Card className="mb-8">
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            value={name}
            autoFocus
            placeholder="A2P 10DLC Verification for GoHighLevel"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>URL</label>
          <input
            className={inputClass}
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
          <p className="m-0 text-[12px] text-[var(--ink-300)]">
            /services/{effectiveSlug || "…"} — permanent once anything links to it.
          </p>
        </div>

        {error && (
          <p className="m-0 text-[13px] font-semibold text-[var(--danger-600)]">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={submit} disabled={pending || !name.trim()}>
            {pending ? "Creating…" : "Create as draft"}
          </Button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold text-[var(--ink-400)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </Card>
  );
}
