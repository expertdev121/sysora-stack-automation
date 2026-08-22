"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Card, CardHeader, inputClass, labelClass, Pill } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { saveOffer } from "@/lib/admin/actions";
import type { Offer } from "@/lib/sales/types";

/** Prices are stored in minor units; this edits them in whole currency. */
export function PlanEditor({ offer, canEdit }: { offer: Offer; canEdit: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(offer.name);
  const [tagline, setTagline] = useState(offer.tagline ?? "");
  const [price, setPrice] = useState((offer.price_amount / 100).toString());
  const [priceNote, setPriceNote] = useState(offer.price_note ?? "");
  const [active, setActive] = useState(offer.is_active);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function save() {
    setError(null);
    setSaved(false);

    const major = Number(price);
    if (!Number.isFinite(major) || major < 0) {
      setError("Price must be a number, zero or more.");
      return;
    }

    startTransition(async () => {
      const result = await saveOffer(offer.slug, {
        name: name.trim(),
        tagline: tagline.trim(),
        price_amount: Math.round(major * 100),
        price_note: priceNote.trim(),
        is_active: active,
      });
      if (result.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader title={offer.slug} hint={offer.billing_interval === "month" ? "monthly" : "one time"} />
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={name} disabled={!canEdit} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Tagline</label>
          <input className={inputClass} value={tagline} disabled={!canEdit} onChange={(e) => setTagline(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-[6px]">
            <label className={labelClass}>Price ({offer.currency})</label>
            <input
              className={inputClass}
              inputMode="decimal"
              disabled={!canEdit}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className={labelClass}>Price note</label>
            <input
              className={inputClass}
              disabled={!canEdit}
              value={priceNote}
              onChange={(e) => setPriceNote(e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-[10px] text-[13.5px] text-[var(--ink-600)] cursor-pointer">
          <input
            type="checkbox"
            className="accent-[var(--accent)] w-4 h-4"
            disabled={!canEdit}
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Live on the site
        </label>

        {error && (
          <p role="alert" className="m-0 text-[13px] text-[var(--danger-600)]">
            {error}
          </p>
        )}

        {canEdit ? (
          <div className="flex items-center gap-3 pt-1">
            <Button size="sm" variant="ghost" disabled={pending} onClick={save}>
              {pending ? "Saving…" : "Save"}
            </Button>
            {saved && <Pill tone="mint">Saved</Pill>}
          </div>
        ) : (
          <p className="m-0 pt-1 text-[12.5px] text-[var(--ink-300)]">
            Read only — ask a super admin to change pricing.
          </p>
        )}
      </div>
    </Card>
  );
}
