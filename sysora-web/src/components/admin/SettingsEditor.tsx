"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Card, CardHeader, inputClass, labelClass, Pill } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { saveSetting } from "@/lib/admin/actions";

type Setting = {
  key: string;
  value: unknown;
  label: string | null;
  description: string | null;
  is_public: boolean;
};

/** Renders a jsonb value as editable text, and stores it back the same way. */
function toText(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value ?? "");
}

export function SettingsEditor({ settings }: { settings: Setting[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-5 items-start">
      {settings.map((setting) => (
        <SettingRow key={setting.key} setting={setting} />
      ))}
    </div>
  );
}

function SettingRow({ setting }: { setting: Setting }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(toText(setting.value));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const original = toText(setting.value);

  return (
    <Card>
      <CardHeader title={setting.key} hint={setting.is_public ? "public" : "internal"} />
      <div className="flex flex-col gap-3 px-6 py-5">
        <label className={labelClass}>{setting.label ?? setting.key}</label>
        {setting.description && (
          <p className="m-0 text-[12.5px] leading-[1.6] text-[var(--ink-300)]">
            {setting.description}
          </p>
        )}
        <input
          className={inputClass}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
        />
        {error && (
          <p role="alert" className="m-0 text-[13px] text-[var(--danger-600)]">
            {error}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            disabled={pending || value === original}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const result = await saveSetting(setting.key, value);
                if (result.ok) {
                  setSaved(true);
                  router.refresh();
                } else {
                  setError(result.error);
                }
              })
            }
          >
            {pending ? "Saving…" : "Save"}
          </Button>
          {saved && <Pill tone="mint">Saved</Pill>}
        </div>
      </div>
    </Card>
  );
}
