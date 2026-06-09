"use client";

import { locales } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * Edits a `Record<Locale, string>` value as one field per locale, on tabs.
 * Inputs are named `${name}.${locale}` so `localizedFromForm` can read them.
 * Panels use `keepMounted` so every locale submits regardless of active tab.
 */
export function LocalizedField({
  name,
  label,
  defaultValue,
  multiline = false,
}: {
  name: string;
  label: string;
  defaultValue?: Partial<Record<Locale, string>>;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Tabs defaultValue={locales[0]}>
        <TabsList>
          {locales.map((l) => (
            <TabsTrigger key={l} value={l}>
              {l.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>
        {locales.map((l) => (
          <TabsContent key={l} value={l} keepMounted className="mt-2">
            {multiline ? (
              <Textarea
                name={`${name}.${l}`}
                defaultValue={defaultValue?.[l] ?? ""}
                rows={3}
              />
            ) : (
              <Input
                name={`${name}.${l}`}
                defaultValue={defaultValue?.[l] ?? ""}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
