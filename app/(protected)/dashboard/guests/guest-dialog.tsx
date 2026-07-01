'use client';

import { useActionState, useEffect, useState, type ReactNode } from 'react';
import { Pencil, Plus } from 'lucide-react';
import type { Label as LabelRow } from '@/db/schema';
import { createGuest, updateGuest, type ActionState } from './actions';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  email: string | null;
  phone: string | null;
  adminNote: string | null;
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
            <Button size="sm">
              <Plus /> Add person
            </Button>
          ) : (
            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${guest?.name ?? ''}`}>
              <Pencil />
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
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

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Add person' : 'Edit person'}</DialogTitle>
        <DialogDescription>
          {mode === 'create'
            ? 'Create an invitee and generate their personal RSVP link.'
            : 'Update this invitee.'}
        </DialogDescription>
      </DialogHeader>
      <form action={formAction} className="flex flex-col gap-3">
        {mode === 'edit' && guest ? (
          <input type="hidden" name="guestId" value={guest.id} />
        ) : null}
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

        <Field label="Name" error={state.fieldErrors?.name}>
          <Input name="name" defaultValue={guest?.name ?? ''} maxLength={120} autoFocus />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Max guests" error={state.fieldErrors?.maxGuests}>
            <Input
              name="maxGuests"
              type="number"
              min={1}
              max={20}
              defaultValue={guest?.maxGuests ?? 1}
            />
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={guest?.status ?? 'pending'}>
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
        </div>

        <Field label="Email" error={state.fieldErrors?.email}>
          <Input name="email" type="email" defaultValue={guest?.email ?? ''} />
        </Field>
        <Field label="Phone" error={state.fieldErrors?.phone}>
          <Input name="phone" defaultValue={guest?.phone ?? ''} />
        </Field>

        {labels.length > 0 ? (
          <div className="flex flex-col gap-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {labels.map((l) => (
                <label key={l.id} className="flex items-center gap-2 text-sm font-normal">
                  <Checkbox
                    name="labelIds"
                    value={l.id}
                    defaultChecked={guest?.labelIds.includes(l.id) ?? false}
                  />
                  {l.name}
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <Field label="Admin note" error={state.fieldErrors?.adminNote}>
          <Textarea
            name="adminNote"
            defaultValue={guest?.adminNote ?? ''}
            rows={2}
            placeholder="Private — only you see this"
          />
        </Field>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : mode === 'create' ? 'Add person' : 'Save changes'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
