"use client";

import { cn } from "@/lib/utils";

/**
 * Every choice in the form — attendance radios and dietary checkboxes — is the
 * same object: an ink hairline row that inverts to solid ink when chosen. No
 * tinted "selected" wash (see the two-colour note in app/globals.css); the
 * native control's `accent-color` flips to white with it, and focus is the
 * letter's offset ink outline, the same one `letterButton` uses.
 */
const choiceRow =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-input leading-snug transition-colors accent-[color:var(--primary)] has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:accent-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring";

/**
 * A radio or checkbox drawn as an ink row (see `choiceRow`). `size="lg"` is the
 * attendance answer, which is the decision the whole card exists for; the
 * default is the quieter chip used for the dietary presets, so the two do not
 * carry equal weight.
 */
export function Choice({
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
          ? "px-4 py-3.5 text-body"
          : "px-3.5 py-2.5 text-meta whitespace-nowrap",
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
