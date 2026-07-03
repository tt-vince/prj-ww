'use client';

import { useActionState, useEffect, useState, type ReactNode } from 'react';
import { Check, Pencil, Plus } from 'lucide-react';
import type { Label as LabelRow } from '@/db/schema';
import { SNS_PLATFORMS, SNS_CONFIG, type SnsAccounts } from '@/lib/sns';
import { SnsIcon } from '@/components/sns-icon';
import { createGuest, updateGuest, type ActionState } from './actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type RsvpStatus = 'pending' | 'going' | 'not_going';

type GuestData = {
  id: string;
  name: string;
  maxGuests: number;
  adults: number | null;
  kids: number | null;
  email: string | null;
  phone: string | null;
  adminNote: string | null;
  snsAccounts: SnsAccounts;
  status: RsvpStatus;
  labelIds: string[];
};

const STATUS_LABEL: Record<RsvpStatus, string> = {
  pending: 'Pending',
  going: 'Going',
  not_going: 'Not going',
};
const STATUS_OPTIONS: RsvpStatus[] = ['pending', 'going', 'not_going'];

const INITIAL: ActionState = { ok: false };

export function GuestDialog({
  mode,
  labels,
  guest,
}: {
  mode: 'create' | 'edit';
  labels: LabelRow[];
  guest?: GuestData;
}) {
  const [open, setOpen] = useState(false);
  // Bump the key on each open so the inner form (and its useActionState) remounts fresh.
  const [instance, setInstance] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setInstance((n) => n + 1);
      }}
    >
      <DialogTrigger
        render={
          mode === 'create' ? (
            <Button className="shadow-[0_4px_14px_rgba(138,118,176,0.32)]">
              <Plus /> Add guest
            </Button>
          ) : (
            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${guest?.name ?? ''}`}>
              <Pencil />
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <GuestForm
          key={instance}
          mode={mode}
          labels={labels}
          guest={guest}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function GuestForm({
  mode,
  labels,
  guest,
  onDone,
}: {
  mode: 'create' | 'edit';
  labels: LabelRow[];
  guest?: GuestData;
  onDone: () => void;
}) {
  const action = mode === 'create' ? createGuest : updateGuest;
  const [state, formAction, pending] = useActionState(action, INITIAL);

  // Controlled copies of the fields the live party-size math depends on.
  // The server re-checks the same rules in guestCreateSchema/guestUpdateSchema.
  const [status, setStatus] = useState<RsvpStatus>(guest?.status ?? 'pending');
  const [maxGuests, setMaxGuests] = useState(String(guest?.maxGuests ?? 1));
  const [adults, setAdults] = useState(guest?.adults != null ? String(guest.adults) : '');
  const [kids, setKids] = useState(guest?.kids != null ? String(guest.kids) : '');
  const [labelIds, setLabelIds] = useState<string[]>(guest?.labelIds ?? []);

  const declined = mode === 'edit' && status === 'not_going';
  const hasCounts = !declined && (adults !== '' || kids !== '');
  const partySize = (Number(adults) || 0) + (Number(kids) || 0);
  const seats = Number(maxGuests) || 0;
  const partyError =
    state.fieldErrors?.partySize ??
    (hasCounts && seats > 0 && partySize > seats
      ? `Party size (${partySize}) can't exceed max guests (${seats}).`
      : !declined && mode === 'edit' && status === 'going' && partySize < 1
        ? 'A party marked Going needs at least 1 adult or kid.'
        : undefined);

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Add guest' : 'Edit guest'}</DialogTitle>
        <DialogDescription>
          {mode === 'create'
            ? 'Create an invitee and generate their personal RSVP link.'
            : 'Update this invitee.'}
        </DialogDescription>
      </DialogHeader>
      <form action={formAction} className="flex flex-col gap-5">
        {mode === 'edit' && guest ? (
          <input type="hidden" name="guestId" value={guest.id} />
        ) : null}
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

        <Section title="Guest details">
          <Field label="Name" error={state.fieldErrors?.name}>
            <Input name="name" defaultValue={guest?.name ?? ''} maxLength={120} required autoFocus />
          </Field>
          <Field
            label="Max guests"
            hint="Seats reserved for this party — the most people their link can bring."
            error={state.fieldErrors?.maxGuests}
          >
            <Input
              name="maxGuests"
              type="number"
              min={1}
              max={20}
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
            />
          </Field>
        </Section>

        <Section title={mode === 'create' ? 'Party count' : 'RSVP reply'}>
          {mode === 'edit' ? (
            <Field label="Status">
              <Select
                name="status"
                value={status}
                onValueChange={(v) => setStatus(v as RsvpStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) => STATUS_LABEL[value as RsvpStatus] ?? 'Pending'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Adults" error={state.fieldErrors?.adults}>
              <Input
                name="adults"
                type="number"
                min={0}
                max={20}
                placeholder="—"
                value={declined ? '0' : adults}
                onChange={(e) => setAdults(e.target.value)}
                disabled={declined}
              />
            </Field>
            <Field label="Kids" error={state.fieldErrors?.kids}>
              <Input
                name="kids"
                type="number"
                min={0}
                max={20}
                placeholder="—"
                value={declined ? '0' : kids}
                onChange={(e) => setKids(e.target.value)}
                disabled={declined}
              />
            </Field>
          </div>
          {partyError ? (
            <p className="text-xs text-destructive">{partyError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {declined
                ? 'Declined — the party count is cleared to 0 on save.'
                : hasCounts
                  ? `Party size ${partySize} of ${seats} seat${seats === 1 ? '' : 's'} (adults + kids).`
                  : mode === 'create'
                    ? 'Optional — pre-fill the expected head-count, or leave blank.'
                    : 'No reply yet — leave blank until the party responds.'}
            </p>
          )}
        </Section>

        <Section title="Contact">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" error={state.fieldErrors?.email}>
              <Input name="email" type="email" defaultValue={guest?.email ?? ''} />
            </Field>
            <Field label="Phone" error={state.fieldErrors?.phone}>
              <Input name="phone" defaultValue={guest?.phone ?? ''} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SNS_PLATFORMS.map((p) => {
              const cfg = SNS_CONFIG[p];
              return (
                <Field key={p} label={cfg.label}>
                  <div className="flex items-center rounded-md border border-input focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                    <span className="flex shrink-0 items-center gap-1 py-1 pr-1 pl-2.5 text-xs text-muted-foreground">
                      <SnsIcon platform={p} className="size-3.5" />
                      {cfg.prefix}
                    </span>
                    <Input
                      name={`sns_${p}`}
                      defaultValue={guest?.snsAccounts?.[p] ?? ''}
                      placeholder="username"
                      maxLength={100}
                      className="border-0 pl-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                </Field>
              );
            })}
          </div>
        </Section>

        {labels.length > 0 ? (
          <Section title="Labels">
            <div className="flex flex-wrap gap-1.5">
              {labels.map((l) => {
                const on = labelIds.includes(l.id);
                return (
                  <Badge
                    key={l.id}
                    variant={on ? 'default' : 'outline'}
                    className="h-6 cursor-pointer px-2.5"
                    render={
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          setLabelIds((prev) =>
                            on ? prev.filter((id) => id !== l.id) : [...prev, l.id],
                          )
                        }
                      >
                        {on ? <Check /> : <Plus />}
                        {l.name}
                      </button>
                    }
                  />
                );
              })}
            </div>
            {labelIds.map((id) => (
              <input key={id} type="hidden" name="labelIds" value={id} />
            ))}
          </Section>
        ) : null}

        <Section title="Notes">
          <Field label="Admin note" error={state.fieldErrors?.adminNote}>
            <Textarea
              name="adminNote"
              defaultValue={guest?.adminNote ?? ''}
              rows={2}
              placeholder="Private — only you see this"
            />
          </Field>
        </Section>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : mode === 'create' ? 'Add guest' : 'Save changes'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-[10.5px] font-semibold tracking-wider text-muted-foreground uppercase">
          {title}
        </span>
        <Separator className="flex-1" />
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}