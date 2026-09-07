"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

import { Card, CardHeader, inputClass, labelClass, Pill } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import {
  addServiceFaq,
  deleteServiceFaq,
  saveService,
  saveServiceFaq,
} from "@/lib/admin/actions";
import type { Service, ServiceFaq } from "@/lib/sales/types";

/**
 * One line per item rather than comma-separated: a comma is a legal
 * character inside a highlight, and splitting on it would quietly cut
 * "Approved, or a full refund" into two chips.
 */
const toLines = (xs: string[]) => xs.join("\n");
const fromLines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export function ServiceEditor({
  service,
  faqs,
  canEdit,
}: {
  service: Service;
  faqs: ServiceFaq[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(service.name);
  const [category, setCategory] = useState(service.category ?? "");
  const [priceLabelText, setPriceLabelText] = useState(service.price_label);
  const [featured, setFeatured] = useState(service.is_featured);
  const [featuredLabel, setFeaturedLabel] = useState(service.featured_label ?? "");
  const [imageUrl, setImageUrl] = useState(service.image_url ?? "");
  const [imageAlt, setImageAlt] = useState(service.image_alt ?? "");
  const [tagline, setTagline] = useState(service.tagline ?? "");
  const [summary, setSummary] = useState(service.summary ?? "");
  const [body, setBody] = useState(service.body ?? "");
  // Blank is meaningful here: it means "get a quote", not zero.
  const [price, setPrice] = useState(
    service.price_amount === null ? "" : (service.price_amount / 100).toString(),
  );
  const [priceNote, setPriceNote] = useState(service.price_note ?? "");
  const [highlights, setHighlights] = useState(toLines(service.highlights));
  const [deliverables, setDeliverables] = useState(toLines(service.deliverables));
  const [seoTitle, setSeoTitle] = useState(service.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(service.seo_description ?? "");
  const [keywords, setKeywords] = useState(toLines(service.keywords));
  const [active, setActive] = useState(service.is_active);

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function save() {
    setError(null);
    setSaved(false);

    let priceAmount: number | null = null;
    if (price.trim() !== "") {
      const major = Number(price);
      if (!Number.isFinite(major) || major < 0) {
        setError("Price must be a number, or blank to show Get a quote.");
        return;
      }
      priceAmount = Math.round(major * 100);
    }

    startTransition(async () => {
      const result = await saveService(service.slug, {
        name: name.trim(),
        category: category.trim() || null,
        price_label: priceLabelText.trim() || "Starting at",
        is_featured: featured,
        featured_label: featuredLabel.trim() || null,
        image_url: imageUrl.trim() || null,
        image_alt: imageAlt.trim() || null,
        tagline: tagline.trim() || null,
        summary: summary.trim() || null,
        body: body.trim() || null,
        price_amount: priceAmount,
        price_note: priceNote.trim() || null,
        highlights: fromLines(highlights),
        deliverables: fromLines(deliverables),
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        keywords: fromLines(keywords),
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

  const field = (label: string, node: ReactNode, hint?: string) => (
    <div className="flex flex-col gap-[6px]">
      <label className={labelClass}>{label}</label>
      {node}
      {hint && <p className="m-0 text-[12px] text-[var(--ink-300)]">{hint}</p>}
    </div>
  );

  const area = (value: string, set: (v: string) => void, rows: number) => (
    <textarea
      className={`${inputClass} resize-y leading-[1.6]`}
      rows={rows}
      value={value}
      disabled={!canEdit}
      onChange={(e) => set(e.target.value)}
    />
  );

  return (
    <Card>
      <CardHeader title={service.name} hint={`/services/${service.slug}`} />

      <div className="flex flex-col gap-4 px-6 py-5">
        <Pill tone={service.is_active ? "mint" : "slate"}>
          {service.is_active ? "Live" : "Draft"}
        </Pill>

        {field(
          "Name",
          <input
            className={inputClass}
            value={name}
            disabled={!canEdit}
            onChange={(e) => setName(e.target.value)}
          />,
        )}
        <div className="grid grid-cols-2 gap-4 to-520:grid-cols-1">
          {field(
            "Category",
            <input
              className={inputClass}
              value={category}
              placeholder="Build"
              disabled={!canEdit}
              onChange={(e) => setCategory(e.target.value)}
            />,
            "The chip above the name.",
          )}
          {field(
            "Price label",
            <input
              className={inputClass}
              value={priceLabelText}
              placeholder="Starting at"
              disabled={!canEdit}
              onChange={(e) => setPriceLabelText(e.target.value)}
            />,
            "“Starting at”, “Per workflow, from”, “One time”.",
          )}
        </div>

        {field(
          "Tagline",
          <input
            className={inputClass}
            value={tagline}
            disabled={!canEdit}
            onChange={(e) => setTagline(e.target.value)}
          />,
          "One line under the title.",
        )}
        {field(
          "Summary",
          area(summary, setSummary, 3),
          "Shown on the services list, and used as the meta description when the SEO one is blank.",
        )}
        {field("Body", area(body, setBody, 10), "Leave a blank line between paragraphs.")}

        <div className="grid grid-cols-2 gap-4 to-520:grid-cols-1">
          {field(
            "Price",
            <input
              className={inputClass}
              value={price}
              placeholder="Blank = Get a quote"
              disabled={!canEdit}
              onChange={(e) => setPrice(e.target.value)}
            />,
            "In dollars. Leave empty for an enquiry.",
          )}
          {field(
            "Price note",
            <input
              className={inputClass}
              value={priceNote}
              disabled={!canEdit}
              onChange={(e) => setPriceNote(e.target.value)}
            />,
          )}
        </div>

        {field(
          "Highlights",
          area(highlights, setHighlights, 4),
          "One per line. These are the chips at the top of the page.",
        )}
        {field("What you get", area(deliverables, setDeliverables, 6), "One per line.")}

        <div className="mt-2 border-t-[1.5px] border-[var(--border-faint)] pt-4">
          <p className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[1.4px] text-[var(--ink-300)]">
            Search
          </p>
          <div className="flex flex-col gap-4">
            {field(
              "SEO title",
              <input
                className={inputClass}
                value={seoTitle}
                disabled={!canEdit}
                onChange={(e) => setSeoTitle(e.target.value)}
              />,
              `${seoTitle.length} characters — aim for under 60.`,
            )}
            {field(
              "Meta description",
              area(seoDescription, setSeoDescription, 3),
              `${seoDescription.length} characters — aim for 140 to 160.`,
            )}
            {field("Keywords", area(keywords, setKeywords, 4), "One per line.")}
          </div>
        </div>

        {field(
          "Image caption",
          <input
            className={inputClass}
            value={imageAlt}
            placeholder="Screenshot: approved A2P campaign"
            disabled={!canEdit}
            onChange={(e) => setImageAlt(e.target.value)}
          />,
          "Alt text once an image is set, and the placeholder caption until then.",
        )}
        {field(
          "Image URL",
          <input
            className={inputClass}
            value={imageUrl}
            placeholder="https://…"
            disabled={!canEdit}
            onChange={(e) => setImageUrl(e.target.value)}
          />,
          "Leave blank to show the captioned placeholder.",
        )}

        <label className="flex items-center gap-2.5 text-[13.5px] font-semibold text-[var(--ink-700)]">
          <input
            type="checkbox"
            checked={featured}
            disabled={!canEdit}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Lead the services page
        </label>
        {featured &&
          field(
            "Badge",
            <input
              className={inputClass}
              value={featuredLabel}
              placeholder="Most requested"
              disabled={!canEdit}
              onChange={(e) => setFeaturedLabel(e.target.value)}
            />,
            "Only one service can lead the page at a time.",
          )}

        <label className="mt-2 flex items-center gap-2.5 text-[13.5px] font-semibold text-[var(--ink-700)]">
          <input
            type="checkbox"
            checked={active}
            disabled={!canEdit}
            onChange={(e) => setActive(e.target.checked)}
          />
          Published — visible at /services
        </label>

        {error && (
          <p className="m-0 text-[13px] font-semibold text-[var(--danger-600)]">{error}</p>
        )}
        {saved && (
          <p className="m-0 text-[13px] font-semibold text-[var(--accent-strong)]">Saved.</p>
        )}

        {canEdit && (
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={save} disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
            <Link
              href={`/services/${service.slug}`}
              target="_blank"
              className="text-[13px] font-semibold text-[var(--accent-strong)]"
            >
              View page →
            </Link>
          </div>
        )}

        <FaqList serviceId={service.id} faqs={faqs} canEdit={canEdit} />
      </div>
    </Card>
  );
}

function FaqList({
  serviceId,
  faqs,
  canEdit,
}: {
  serviceId: string;
  faqs: ServiceFaq[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-4 border-t-[1.5px] border-[var(--border-faint)] pt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="m-0 font-mono text-[10px] uppercase tracking-[1.4px] text-[var(--ink-300)]">
          Questions · {faqs.length}
        </p>
        {canEdit && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await addServiceFaq(serviceId);
                router.refresh();
              })
            }
            className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold text-[var(--accent-strong)]"
          >
            + Add question
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {faqs.map((faq) => (
          <FaqRow key={faq.id} faq={faq} canEdit={canEdit} />
        ))}
      </div>
    </div>
  );
}

function FaqRow({ faq, canEdit }: { faq: ServiceFaq; canEdit: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [dirty, setDirty] = useState(false);

  return (
    <div className="rounded-[12px] border-[1.5px] border-[var(--border-faint)] p-4">
      <input
        className={inputClass}
        value={question}
        disabled={!canEdit}
        onChange={(e) => {
          setQuestion(e.target.value);
          setDirty(true);
        }}
      />
      <textarea
        className={`${inputClass} mt-2 resize-y leading-[1.6]`}
        rows={3}
        value={answer}
        disabled={!canEdit}
        onChange={(e) => {
          setAnswer(e.target.value);
          setDirty(true);
        }}
      />
      {canEdit && (
        <div className="mt-2 flex items-center gap-4">
          <button
            type="button"
            disabled={pending || !dirty}
            onClick={() =>
              startTransition(async () => {
                await saveServiceFaq(faq.id, {
                  question: question.trim(),
                  answer: answer.trim(),
                });
                setDirty(false);
                router.refresh();
              })
            }
            className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold text-[var(--accent-strong)] disabled:text-[var(--ink-200)]"
          >
            {pending ? "Saving…" : dirty ? "Save" : "Saved"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await deleteServiceFaq(faq.id);
                router.refresh();
              })
            }
            className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold text-[var(--danger-600)]"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
