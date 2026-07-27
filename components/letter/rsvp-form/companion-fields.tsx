"use client";

import { Baby, UserRound } from "lucide-react";
import { fieldLabel } from "@/components/letter/letter-type";
import { errorText } from "@/components/letter/rsvp-form/form-style";
import { DietaryChoices } from "@/components/letter/rsvp-form/dietary-choices";
import { RequiredMark } from "@/components/letter/rsvp-form/required-mark";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * One companion: their name and their own dietary restrictions. Framed by a thinned-ink
 * hairline rather than a real Card — the form already sits inside one, and a
 * nested card would read as a separate object dropped on the page instead of a
 * group inside this section.
 *
 * Fields post as `companion.<slug>.name` / `.dietary` / `.dietaryOther`.
 * NOTE: `submitRsvp` does not read these yet, so they are collected and
 * discarded until the schema lands (docs/rsvp-spec.md §13).
 */
export function CompanionFields({
  slug,
  label,
  kind,
  name,
  onName,
  onNameBlur,
  nameError,
  otherOpen,
  onOther,
}: {
  slug: string;
  label: string;
  kind: "adult" | "kid";
  name: string;
  onName: (value: string) => void;
  onNameBlur: () => void;
  nameError: boolean;
  otherOpen: boolean;
  onOther: (open: boolean) => void;
}) {
  const field = `companion.${slug}`;
  // Lucide has no child figure; `Baby` is the nearest thing to one, and next to
  // `UserRound` at this size the pair reads as grown-up / little one.
  const Icon = kind === "kid" ? Baby : UserRound;

  return (
    <fieldset className="space-y-4 rounded-xl border border-ink/20 p-5">
      {/* The group name goes to assistive tech through a visually hidden
          legend, because a rendered legend notches the frame's top hairline.
          The visible heading is the same words, hidden from AT so it is not
          announced twice.

          It is set in the section headings' serif at one size down, not in the
          tracked micro-caps of a field label: this names a group of fields, so
          it has to sit above them in the same voice the sections use. */}
      <legend className="sr-only">{label}</legend>
      <p
        aria-hidden
        className="flex items-center justify-center gap-2 font-sans text-subhead"
      >
        <Icon aria-hidden strokeWidth={1.5} className="size-4 shrink-0" />
        {label}
      </p>
      <div className="space-y-2">
        <Label htmlFor={`${slug}-name`} className={fieldLabel}>
          {/* One inline span, so the Label's flex `gap-2` cannot land between
              the word and its mark — see RequiredMark. */}
          <span>
            Name
            <RequiredMark />
          </span>
        </Label>
        <Input
          id={`${slug}-name`}
          name={`${field}.name`}
          value={name}
          onChange={(e) => onName(e.target.value)}
          onBlur={onNameBlur}
          maxLength={120}
          autoComplete="off"
          required
          aria-invalid={nameError}
          aria-describedby={nameError ? `${slug}-name-error` : undefined}
        />
        {nameError && (
          <span id={`${slug}-name-error`} role="alert" className={errorText}>
            We need their name to seat them.
          </span>
        )}
      </div>
      <DietaryChoices
        name={`${field}.dietary`}
        label="Dietary restrictions"
        otherOpen={otherOpen}
        onOther={onOther}
      />
      {otherOpen && (
        <div className="space-y-2">
          <Label htmlFor={`${slug}-other`} className={fieldLabel}>
            Please tell us
          </Label>
          <Textarea
            id={`${slug}-other`}
            name={`${field}.dietaryOther`}
            rows={2}
            maxLength={200}
            className="placeholder:italic"
            placeholder="Anything else we should keep off their plate"
          />
        </div>
      )}
    </fieldset>
  );
}
