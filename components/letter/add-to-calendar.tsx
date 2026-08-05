'use client';

import { CalendarPlus, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  letterButton,
  type LetterButtonVariants,
} from '@/components/letter/letter-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WEDDING_EVENT } from '@/lib/wedding';

/**
 * "Add to calendar" — sits under the date in the countdown band.
 *
 * Three destinations rather than one file: Google and Outlook take a URL with
 * the event in the query string (no download, no import step), while Apple
 * Calendar and everything else read a generated .ics. The event itself comes
 * from WEDDING_EVENT in lib/wedding.ts, so the date only exists in one place.
 *
 * Styling is the shared `letterButton` in its outline variant — the letter's
 * one button voice, unfilled here because the day count above stays the
 * loudest thing in the band.
 */

/** `20270410T060000Z` — the UTC basic format both ICS and Google expect. */
function stamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '');
}

/** RFC 5545 escaping: backslash, comma and semicolon are delimiters. */
function escapeIcs(value: string) {
  return value.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n');
}

const ICS_FILENAME = `${WEDDING_EVENT.title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')}.ics`;

const GOOGLE_URL = `https://calendar.google.com/calendar/render?${new URLSearchParams({
  action: 'TEMPLATE',
  text: WEDDING_EVENT.title,
  dates: `${stamp(WEDDING_EVENT.start)}/${stamp(WEDDING_EVENT.end)}`,
  location: WEDDING_EVENT.location,
  details: WEDDING_EVENT.details,
})}`;

const OUTLOOK_URL = `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams(
  {
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: WEDDING_EVENT.title,
    body: WEDDING_EVENT.details,
    location: WEDDING_EVENT.location,
    startdt: new Date(WEDDING_EVENT.start).toISOString(),
    enddt: new Date(WEDDING_EVENT.end).toISOString(),
    allday: 'false',
  },
)}`;

/** Builds the .ics text. CRLF line endings are required by RFC 5545. */
function buildIcs() {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//wedding-letter//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${stamp(WEDDING_EVENT.start)}-wedding@${
      typeof window === 'undefined' ? 'wedding' : window.location.hostname
    }`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(WEDDING_EVENT.start)}`,
    `DTEND:${stamp(WEDDING_EVENT.end)}`,
    `SUMMARY:${escapeIcs(WEDDING_EVENT.title)}`,
    `LOCATION:${escapeIcs(WEDDING_EVENT.location)}`,
    `DESCRIPTION:${escapeIcs(WEDDING_EVENT.details)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadIcs() {
  const url = URL.createObjectURL(
    new Blob([buildIcs()], { type: 'text/calendar;charset=utf-8' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = ICS_FILENAME;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function AddToCalendar({
  className,
  variant = 'outline',
}: {
  className?: string;
  /** `outlineOnInk` for the ink-painted countdown band; see letter-button.ts. */
  variant?: LetterButtonVariants['variant'];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(letterButton({ variant }), className)}
      >
        <CalendarPlus aria-hidden strokeWidth={1.5} />
        Add to calendar
        <ChevronDown aria-hidden strokeWidth={1.5} />
      </DropdownMenuTrigger>
      {/* `letter-menu` (app/globals.css) sizes the items: this popup renders
          through a portal, so it lands outside `.letter-theme` and the letter's
          own rules never reach it. */}
      <DropdownMenuContent align="center" className="letter-menu min-w-56 text-left">
        <DropdownMenuItem
          onClick={() => window.open(GOOGLE_URL, '_blank', 'noopener')}
        >
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(OUTLOOK_URL, '_blank', 'noopener')}
        >
          Outlook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadIcs}>
          Apple Calendar / other (.ics)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
