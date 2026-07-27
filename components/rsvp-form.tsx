"use client";

import { useActionState, useState } from "react";
import {
  Baby,
  Loader2,
  Minus,
  Plus,
  Send,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { submitRsvp, type RsvpState } from "@/app/actions/submit-rsvp";
import { DIETARY_OPTIONS } from "@/lib/dietary";
import { cn } from "@/lib/utils";
import { letterButton } from "@/components/letter/letter-button";
import { fieldLabel } from "@/components/letter/letter-type";
import { RsvpReply, type ReplySummary } from "@/components/letter/rsvp-reply";
import type { CompanionSummary } from "@/lib/companions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: RsvpState = { ok: false };

/** Companion field keys as the form posts them (see lib/validation.ts). */
const COMPANION_NAME_KEY = /^companion\.(adult|kid)-(\d{1,2})\.name$/;

/** Blank or whitespace-only → null, so the read-back omits the row entirely. */
const text = (value: FormDataEntryValue | null): string | null =>
  (typeof value === "string" ? value.trim() : "") || null;

/**
 * The outgoing FormData, read into the shape the read-back renders. Everything
 * comes from the form itself rather than from React state, so the uncontrolled
 * dietary chips and note are included exactly as they were posted.
 */
function summarizeReply(formData: FormData): ReplySummary {
  const status = formData.get("status") === "not_going" ? "not_going" : "going";
  const going = status === "going";

  const count = (key: string): number | null => {
    const n = Number(formData.get(key));
    return Number.isFinite(n) ? n : null;
  };

  const companions: CompanionSummary[] = [];
  for (const key of new Set(formData.keys())) {
    const match = COMPANION_NAME_KEY.exec(key);
    if (!match) continue;
    const [, kind, position] = match;
    const field = `companion.${kind}-${position}`;
    companions.push({
      kind: kind as "adult" | "kid",
      position: Number(position),
      name: text(formData.get(key)) ?? "",
      dietary: formData.getAll(`${field}.dietary`).map(String),
      dietaryOther: text(formData.get(`${field}.dietaryOther`)),
    });
  }

  return {
    status,
    adults: going ? count("adults") : null,
    kids: going ? count("kids") : null,
    dietary: going ? formData.getAll("dietary").map(String) : [],
    dietaryOther: going ? text(formData.get("dietaryOther")) : null,
    guestNote: text(formData.get("guestNote")),
    companions: going ? companions : [],
  };
}

/**
 * One shell for every block of the form. Each block is a `fieldset` with the
 * same header voice (Gilda title + Playwrite hint, centred like the letter's
 * section headings) opened by the same ink hairline — the first block drops the
 * rule, so the sequence reads as one ruled page rather than a stack of cards.
 *
 * The rule is a `::before` on the wrapper, not a border on the fieldset: a
 * rendered `legend` notches a fieldset's own top border, and this document's
 * rules are unbroken hairlines.
 *
 * The rules are thinned ink (`ink/20`) rather than the letter's usual full
 * strength: at full ink, five hairlines inside one small card read as heavier
 * than the answers they separate. This is the one thinned-ink exception in the
 * document (cf. the two-colour note in app/globals.css) and is deliberate.
 */
const sectionShell =
  "relative mt-7 pt-7 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-ink/20 first-of-type:mt-0 first-of-type:pt-0 first-of-type:before:hidden";

/**
 * Every choice in the form — attendance radios and dietary checkboxes — is the
 * same object: an ink hairline row that inverts to solid ink when chosen. No
 * tinted "selected" wash (see the two-colour note in app/globals.css); the
 * native control's `accent-color` flips to white with it, and focus is the
 * letter's offset ink outline, the same one `letterButton` uses.
 */
const choiceRow =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-input leading-snug transition-colors accent-[color:var(--primary)] has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:accent-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring";

/** Errors carry no hue in this document — wording and italics do the work. */
const errorText = "block text-xs italic text-destructive";

/**
 * One disabled treatment for every button in the form: unfilled, with the
 * hairline turning dashed. There is no third colour to grey a control out with
 * and no thinned ink allowed, so "not available yet" is carried by the stroke.
 * The submit button therefore inks in the moment the reply can be sent.
 */
const disabledControl =
  "disabled:cursor-not-allowed disabled:border-dashed disabled:bg-transparent disabled:text-ink disabled:hover:bg-transparent disabled:hover:text-ink";

/**
 * Public RSVP form for a single invitee, in five ruled sections: attendance,
 * party size, dietary restrictions, contact details, and a note for the couple.
 * Contact is its own section rather than a tail on the note field — it is the
 * couple's way of reaching the guest back, not part of the message.
 *
 * Styling is the guest letter's: shadcn tokens for every field (so the
 * `.letter-theme` scope in app/globals.css paints it in white + #1E2A18 with no
 * colour of its own) and the shared `letterButton` for every button, since this
 * form only ever renders inside that letter.
 *
 * `token` is the capability link id (`?id=<token>`); `maxGuests` bounds the
 * party-size steppers. On a successful reply it swaps to a thank-you.
 */
export function RsvpForm({
  token,
  maxGuests,
}: {
  token: string;
  maxGuests: number;
}) {
  const [state, action, pending] = useActionState(submitRsvp, initial);
  const [status, setStatus] = useState<"going" | "not_going" | "">("");
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [dietaryOther, setDietaryOther] = useState(false);
  // Which companion cards have their "Something else" field open, by slug.
  const [companionOther, setCompanionOther] = useState<Record<string, boolean>>(
    {},
  );
  // Companion names are controlled so the send button can judge the reply, and
  // so a name survives a count going down and back up.
  const [companionNames, setCompanionNames] = useState<Record<string, string>>(
    {},
  );
  // A field only turns red once the guest has left it, or once they have tried
  // to send: nothing is scolded for being empty before it has been reached.
  const [blurred, setBlurred] = useState<Record<string, boolean>>({});
  const [attemptedSend, setAttemptedSend] = useState(false);
  // What was actually posted, captured as the form went. The dietary chips and
  // the note are uncontrolled, so this snapshot is the only place their values
  // exist on the client — and taking it at submit time means an edit made while
  // the request is in flight cannot change what we read back.
  const [sent, setSent] = useState<ReplySummary | null>(null);
  const partySize = adults + kids;
  const overCapacity = status === "going" && partySize > maxGuests;
  const atCapacity = status === "going" && partySize === maxGuests;
  const seats = `${maxGuests} seat${maxGuests === 1 ? "" : "s"}`;
  const extra = partySize - maxGuests;
  // A one-seat invitation has nothing to count: the guest is adult 1 and there
  // is no room for anyone else, so the counters would be four dead buttons
  // asking a question with a single possible answer.
  const solo = maxGuests === 1;

  /**
   * Everyone in the party except the invitee, who is adult 1 and answers for
   * themselves in the section above. Slugs are stable per position, so a card
   * keeps its answers when the count of the OTHER kind changes.
   */
  const companions = [
    ...Array.from({ length: Math.max(0, adults - 1) }, (_, i) => ({
      slug: `adult-${i + 2}`,
      label: `Adult ${i + 2}`,
      kind: "adult" as const,
    })),
    ...Array.from({ length: kids }, (_, i) => ({
      slug: `kid-${i + 1}`,
      label: `Kid ${i + 1}`,
      kind: "kid" as const,
    })),
  ];

  /**
   * Everything still standing between the guest and a sent reply, in the order
   * the form asks for it. This is the single source for all three consequences:
   * the send button is dead while it is non-empty, the note above the button says
   * what is left, and the matching field is marked invalid.
   */
  const missing: { field: string; message: string }[] = [];
  if (!status) {
    missing.push({
      field: "status",
      message: "Let us know if you can make it.",
    });
  }
  if (status === "going") {
    for (const c of companions) {
      if (!(companionNames[c.slug] ?? "").trim()) {
        missing.push({
          field: `${c.slug}-name`,
          message: `Add a name for ${c.label}.`,
        });
      }
    }
    if (overCapacity) {
      missing.push({
        field: "party",
        message: `We've saved ${seats} for you. You've used ${extra} too many.`,
      });
    }
  }

  /** True once this field should show as wrong rather than merely empty. */
  const showsError = (field: string) =>
    (attemptedSend || blurred[field]) && missing.some((m) => m.field === field);

  // Sent. The reply is read back from the snapshot taken as it went, in the same
  // component the letter uses for a guest who answered on an earlier visit — so
  // "just sent" and "already answered" show the identical record.
  if (state.ok) {
    return <RsvpReply reply={sent ?? fallbackSummary()} />;
  }

  /**
   * Last resort if the snapshot is somehow missing: the state we do hold. A
   * function declaration, so it is hoisted above the `state.ok` return.
   */
  function fallbackSummary(): ReplySummary {
    return {
      status: status === "not_going" ? "not_going" : "going",
      adults: status === "going" ? adults : null,
      kids: status === "going" ? kids : null,
      dietary: [],
      dietaryOther: null,
      guestNote: null,
      companions:
        status === "going"
          ? companions.map((c) => ({
              kind: c.kind,
              position: Number(c.slug.split("-")[1]),
              name: (companionNames[c.slug] ?? "").trim(),
              dietary: [],
              dietaryOther: null,
            }))
          : [],
    };
  }

  return (
    <form
      action={action}
      aria-busy={pending}
      // Not preventDefault: the server action still runs. This only reads the
      // outgoing FormData on the way past.
      onSubmit={(e) => setSent(summarizeReply(new FormData(e.currentTarget)))}
    >
      <input type="hidden" name="token" value={token} />

      {/* The key for the mark, before the first field that carries one. */}
      <p className="mb-7 text-center font-countdown text-xs tracking-wide">
        <span aria-hidden className="text-[color:var(--mark-required)]">
          &#42;
        </span>{" "}
        Required
      </p>

      <Section title="Will you attend?" required>
        <div
          className="grid gap-2.5"
          aria-describedby={showsError("status") ? "status-error" : undefined}
        >
          <Choice
            type="radio"
            name="status"
            value="going"
            label="Joyfully accept"
            size="lg"
            checked={status === "going"}
            onChange={() => setStatus("going")}
            invalid={showsError("status")}
            required
          />
          <Choice
            type="radio"
            name="status"
            value="not_going"
            label="Regretfully decline"
            size="lg"
            checked={status === "not_going"}
            onChange={() => setStatus("not_going")}
            invalid={showsError("status")}
          />
        </div>
        {showsError("status") && (
          <span id="status-error" role="alert" className={errorText}>
            Let us know if you can make it.
          </span>
        )}
      </Section>

      {status === "going" && (
        <>
          <Section
            title="Anything we should know?"
            hint={
              solo
                ? "Optional — anything we should keep off your plate."
                : "Optional — your own dietary restrictions. We ask about anyone you bring below."
            }
          >
            <DietaryChoices
              name="dietary"
              otherOpen={dietaryOther}
              onOther={setDietaryOther}
            />
            {dietaryOther && (
              <div className="space-y-2">
                <Label htmlFor="dietaryOther" className={fieldLabel}>
                  Please tell us
                </Label>
                <Textarea
                  id="dietaryOther"
                  name="dietaryOther"
                  rows={2}
                  maxLength={200}
                  className="placeholder:italic"
                  placeholder="Anything else we should keep off your plate"
                />
              </div>
            )}
          </Section>

          {solo ? (
            // The counts still post, so the server reads a one-seat reply the
            // same way it reads every other one.
            <>
              <input type="hidden" name="adults" value={adults} />
              <input type="hidden" name="kids" value={kids} />
            </>
          ) : (
            <Section title="Who is coming?" required>
              {/* gap-6 between the two counters against gap-2 inside each one:
                without that contrast the four round buttons read as one run of
                four rather than as two separate counts. */}
              <div className="grid grid-cols-2 gap-6">
                <Stepper
                  label="Adults"
                  icon={UserRound}
                  name="adults"
                  value={adults}
                  setValue={setAdults}
                  min={1}
                  max={maxGuests}
                  canIncrement={partySize < maxGuests}
                  error={state.fieldErrors?.adults}
                />
                <Stepper
                  label="Kids"
                  icon={Baby}
                  name="kids"
                  value={kids}
                  setValue={setKids}
                  min={0}
                  max={maxGuests}
                  canIncrement={partySize < maxGuests}
                  error={state.fieldErrors?.kids}
                />
              </div>
              <p
                aria-live="polite"
                className={cn(
                  "text-center text-sm",
                  overCapacity && "font-medium text-destructive",
                )}
              >
                {overCapacity
                  ? `We've saved ${seats} for you. You've used ${extra} too many.`
                  : atCapacity
                    ? `We've saved ${seats} for you. You've used all ${maxGuests}.`
                    : `We've saved ${seats} for you. You've used ${partySize}.`}
              </p>

              {companions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-center font-countdown text-xs leading-relaxed tracking-wide">
                    We&rsquo;d love a name for each of them, and anything they
                    can&rsquo;t eat &mdash; it helps us seat everyone and get
                    the food right.
                  </p>
                  {companions.map((c) => (
                    <CompanionFields
                      key={c.slug}
                      slug={c.slug}
                      label={c.label}
                      kind={c.kind}
                      name={companionNames[c.slug] ?? ""}
                      onName={(v) =>
                        setCompanionNames((prev) => ({ ...prev, [c.slug]: v }))
                      }
                      onNameBlur={() =>
                        setBlurred((prev) => ({
                          ...prev,
                          [`${c.slug}-name`]: true,
                        }))
                      }
                      nameError={showsError(`${c.slug}-name`)}
                      otherOpen={!!companionOther[c.slug]}
                      onOther={(open) =>
                        setCompanionOther((prev) => ({
                          ...prev,
                          [c.slug]: open,
                        }))
                      }
                    />
                  ))}
                </div>
              )}
            </Section>
          )}
        </>
      )}

      <Section
        title="How can we reach you?"
        hint="Optional — only if you would like us to have these."
      >
        <div className="space-y-2">
          <Label htmlFor="email" className={fieldLabel}>
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={200}
            aria-invalid={!!state.fieldErrors?.email}
            aria-describedby={
              state.fieldErrors?.email ? "email-error" : undefined
            }
          />
          {state.fieldErrors?.email && (
            <span id="email-error" role="alert" className={errorText}>
              {state.fieldErrors.email}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className={fieldLabel}>
            Phone
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            aria-invalid={!!state.fieldErrors?.phone}
            aria-describedby={
              state.fieldErrors?.phone ? "phone-error" : undefined
            }
          />
          {state.fieldErrors?.phone && (
            <span id="phone-error" role="alert" className={errorText}>
              {state.fieldErrors.phone}
            </span>
          )}
        </div>
      </Section>

      <Section
        title="A note for the two of us"
        hint="Optional — a wish, a song request, anything at all."
      >
        <Label htmlFor="guestNote" className="sr-only">
          Message for the couple
        </Label>
        <Textarea id="guestNote" name="guestNote" rows={3} maxLength={1000} />
      </Section>

      {/* No rule above the action: the button is the end of the page, not
          another section of it. Spacing alone carries the separation. */}
      <div className="mt-8 space-y-4">
        {state.error && (
          <p
            role="alert"
            className="text-center text-sm italic text-destructive"
          >
            {state.error}
          </p>
        )}

        {/* Why the button will not send. A dead control with no stated reason is
            the worst of both worlds, so the same `missing` list that disables it
            is spelled out here and tied to it by aria-describedby. */}
        {missing.length > 0 && (
          <div
            id="send-blocked"
            aria-live="polite"
            className="space-y-1 text-center text-xs italic text-destructive"
          >
            {missing.map((m) => (
              <p key={m.field}>{m.message}</p>
            ))}
          </div>
        )}

        {/* The one action, in the letter's button voice. Until the reply is
            complete it stays unfilled with a dashed hairline and inks in when it
            is ready. `onClick` fires before the disabled check on nothing, so the
            wrapper below catches the attempt instead: a pointer-events-none
            button would swallow it and leave the guest with no feedback. */}
        <div
          onPointerDown={() => setAttemptedSend(true)}
          onFocusCapture={() => setAttemptedSend(true)}
        >
          <button
            type="submit"
            disabled={pending || missing.length > 0}
            aria-describedby={missing.length > 0 ? "send-blocked" : undefined}
            className={cn(
              letterButton(),
              "h-11 w-full justify-center",
              disabledControl,
            )}
          >
            {pending ? (
              <Loader2 aria-hidden strokeWidth={1.5} className="animate-spin" />
            ) : (
              <Send aria-hidden strokeWidth={1.5} />
            )}
            {pending ? "Sending…" : "Send RSVP"}
          </button>
        </div>
      </div>
    </form>
  );
}

/** A ruled block of the form: same header voice, same rule, same rhythm. */
function Section({
  title,
  hint,
  required,
  children,
}: {
  title: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={sectionShell}>
      <fieldset>
        <legend className="w-full px-0 text-center">
          <span className="block font-heading text-lg leading-snug">
            {title}
            {required && <RequiredMark />}
          </span>
          {hint && (
            <span className="mt-1.5 block font-countdown text-xs leading-relaxed tracking-wide">
              {hint}
            </span>
          )}
        </legend>
        <div className="mt-5 space-y-4">{children}</div>
      </fieldset>
    </div>
  );
}

/**
 * The one required mark in the form. The asterisk is decoration — "(required)" is
 * what a screen reader reads, alongside the control's own `required` attribute —
 * so the red never carries the meaning by itself. Sized in `em` so it scales to
 * whatever it marks, from a section heading down to a field label.
 */
function RequiredMark() {
  return (
    <>
      {/* Full inherited size, and no `align-super`: the asterisk already sits
          high in both faces, so superscripting a shrunken one left a speck the
          eye skipped.

          The gap is one `em` value, so it holds the same proportion whatever it
          marks — a section heading or an 11px field label. It only works if the
          mark is INLINE with its text: shadcn's `Label` is a flex row with
          `gap-2`, so a mark placed as a direct element child of a Label gets 8px
          injected between them and ignores this margin, which is exactly why the
          heading and the field label used to disagree. Wrap text + mark in one
          inline span inside a Label. */}
      <span
        aria-hidden
        className="ml-[0.2em] text-[1.15em] leading-none tracking-normal text-[color:var(--mark-required)]"
      >
        &#42;
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

/**
 * The dietary presets plus the "Something else" toggle, shared by the invitee's
 * own section and every companion card so one set of restrictions is asked for
 * the same way whoever it belongs to. `name` is the field the presets post under; the
 * caller owns `otherOpen` because it also renders the matching free-text field.
 *
 * Content-width chips rather than a fixed grid: at phone width a two-column
 * grid breaks "Gluten-free" across two lines.
 */
function DietaryChoices({
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
function CompanionFields({
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
        className="flex items-center justify-center gap-2 font-heading text-base leading-snug"
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

/**
 * A radio or checkbox drawn as an ink row (see `choiceRow`). `size="lg"` is the
 * attendance answer, which is the decision the whole card exists for; the
 * default is the quieter chip used for the dietary presets, so the two do not
 * carry equal weight.
 */
function Choice({
  type,
  name,
  value,
  label,
  size = "sm",
  checked,
  onChange,
  required,
  invalid,
  className,
}: {
  type: "radio" | "checkbox";
  label: string;
  name?: string;
  value?: string;
  size?: "sm" | "lg";
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  /** Unanswered when it had to be answered: the row's hairline turns red. */
  invalid?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        choiceRow,
        size === "lg"
          ? "px-4 py-3.5 text-base"
          : "px-3.5 py-2.5 text-sm whitespace-nowrap",
        invalid && "border-destructive",
        className,
      )}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        required={required}
        className="size-4 shrink-0"
      />
      <span className={size === "lg" ? "font-medium" : undefined}>{label}</span>
    </label>
  );
}

/**
 * −/+ stepper for a whole-number count. Posts its value through a hidden input
 * (`name`) so the server action reads it exactly like the old number field.
 * `canIncrement` caps the party at `maxGuests` from the caller (total across
 * both steppers); per-field `min`/`max` are the local bounds. The two round
 * buttons are `letterButton` in its outline variant, so the form has exactly
 * one button implementation.
 */
function Stepper({
  label,
  icon: Icon,
  name,
  value,
  setValue,
  min,
  max,
  canIncrement,
  error,
}: {
  label: string;
  /** Same glyph the matching companion cards carry, so the count and the cards
   *  it produces are visibly the same thing. */
  icon: LucideIcon;
  name: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
  max: number;
  canIncrement: boolean;
  error?: string;
}) {
  const step = cn(
    letterButton({ variant: "outline" }),
    "size-9 shrink-0 justify-center rounded-full p-0",
    disabledControl,
  );

  return (
    <div className="space-y-2">
      <Label
        htmlFor={`${name}-value`}
        className={cn(fieldLabel, "flex items-center justify-center gap-1.5")}
      >
        <Icon aria-hidden strokeWidth={1.5} className="size-3.5 shrink-0" />
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={step}
          onClick={() => setValue(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus aria-hidden strokeWidth={1.5} />
        </button>
        <output
          id={`${name}-value`}
          aria-live="polite"
          className="min-w-8 flex-1 text-center font-heading text-xl tabular-nums"
        >
          {value}
        </output>
        <button
          type="button"
          className={step}
          onClick={() => setValue(Math.min(max, value + 1))}
          disabled={value >= max || !canIncrement}
          aria-label={`Increase ${label}`}
        >
          <Plus aria-hidden strokeWidth={1.5} />
        </button>
      </div>
      <input type="hidden" name={name} value={value} />
      {error && (
        <span role="alert" className={errorText}>
          {error}
        </span>
      )}
    </div>
  );
}
