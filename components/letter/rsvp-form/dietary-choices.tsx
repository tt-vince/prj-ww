"use client";

import { DIETARY_OPTIONS } from "@/lib/dietary";
import { fieldLabel } from "@/components/letter/letter-type";
import { Choice } from "@/components/letter/rsvp-form/choice";

/**
 * The dietary presets plus the "Something else" toggle, shared by the invitee's
 * own section and every companion card so one set of restrictions is asked for
 * the same way whoever it belongs to. `name` is the field the presets post under; the
 * caller owns `otherOpen` because it also renders the matching free-text field.
 *
 * Content-width chips rather than a fixed grid: at phone width a two-column
 * grid breaks "Gluten-free" across two lines.
 */
export function DietaryChoices({
  name,
  label,
  otherOpen,
  onOther,
}: {
  name: string;
  /**
   * Names the chip group where nothing else does. The invitee's own set needs
   * none — its Section legend already names it — but inside a companion card the
   * chips would otherwise be the only control with no label.
   */
  label?: string;
  otherOpen: boolean;
  onOther: (open: boolean) => void;
}) {
  const labelId = `${name}-label`;

  const chips = (
    <div className="flex flex-wrap gap-2.5">
      {DIETARY_OPTIONS.map((opt) => (
        <Choice
          key={opt.key}
          type="checkbox"
          name={name}
          value={opt.key}
          label={opt.label}
        />
      ))}
      {/* Its own line: it is not a seventh preset, it opens a field. */}
      <Choice
        type="checkbox"
        label="Something else"
        className="basis-full"
        checked={otherOpen}
        onChange={(e) => onOther(e.target.checked)}
      />
    </div>
  );

  if (!label) return chips;

  return (
    <div role="group" aria-labelledby={labelId} className="space-y-2">
      <p id={labelId} className={fieldLabel}>
        {label}
      </p>
      {chips}
    </div>
  );
}
