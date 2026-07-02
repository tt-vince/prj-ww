import { requireUser } from "@/lib/dal";
import { db } from "@/db";
import { labels as labelsTable } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AccountMenu } from "@/components/account-menu";
import {
  AccountGarland,
  CardSprayBottomLeft,
  CardSprayTopRight,
  NameSprig,
} from "@/components/dashboard-florals";
import { GuestsTable, type GuestRow } from "./guests-table";
import { ExportGuestsButton } from "./export-guests-button";
import { GuestDialog } from "./guests/guest-dialog";

// Placeholder couple + date lifted from the design; swap for the real names/date.
const COUPLE = "Hyuwu & Empty";
const OCCASION = "April 2026 · Guest responses";

type Tone = "going" | "declined" | "pending" | "invited";

const TONE: Record<Tone, { dot: string; text: string; bar: string }> = {
  going: {
    dot: "bg-dot-going",
    text: "text-stat-going",
    bar: "[&_[data-slot=progress-indicator]]:bg-stat-going-bar",
  },
  declined: {
    dot: "bg-dot-declined",
    text: "text-stat-declined",
    bar: "[&_[data-slot=progress-indicator]]:bg-stat-declined-bar",
  },
  pending: {
    dot: "bg-dot-pending",
    text: "text-stat-pending",
    bar: "[&_[data-slot=progress-indicator]]:bg-stat-pending-bar",
  },
  invited: {
    dot: "bg-dot-invited",
    text: "text-stat-invited",
    bar: "[&_[data-slot=progress-indicator]]:bg-stat-invited-bar",
  },
};

function StatCard({
  label,
  value,
  caption,
  tone,
  pct,
}: {
  label: string;
  value: number;
  caption: string;
  tone: Tone;
  pct: number;
}) {
  const t = TONE[tone];
  return (
    <Card className="gap-0 rounded-[18px] p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
          {label}
        </span>
        <span className={cn("size-2.5 rounded-full", t.dot)} />
      </div>
      <div className={cn("mt-2.5 font-serif text-[34px] leading-none sm:mt-3.5 sm:text-[46px]", t.text)}>
        {value}
      </div>
      <div className="mt-2 text-[12.5px] text-muted-foreground">{caption}</div>
      <Progress
        value={pct}
        className={cn(
          "mt-4 gap-0 [&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-[#f0ebef]",
          t.bar,
        )}
      />
    </Card>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [rows, allLabels] = await Promise.all([
    db.query.guests.findMany({
      with: { guestLabels: { with: { label: true } } },
      orderBy: (g, { desc }) => [desc(g.createdAt)],
    }),
    db.select().from(labelsTable).orderBy(labelsTable.name),
  ]);

  const invited = rows.length;
  let going = 0;
  let notGoing = 0;
  let pending = 0;
  let seatsTotal = 0;
  let adultsTotal = 0;
  let kidsTotal = 0;
  for (const r of rows) {
    seatsTotal += r.maxGuests;
    if (r.status === "going") {
      going += 1;
      adultsTotal += r.adults ?? 0;
      kidsTotal += r.kids ?? 0;
    } else if (r.status === "not_going") {
      notGoing += 1;
    } else {
      pending += 1;
    }
  }
  const expected = adultsTotal + kidsTotal;
  const responded = going + notGoing;
  const pct = (n: number) => (invited ? Math.round((n / invited) * 100) : 0);

  const stats: {
    key: Tone;
    label: string;
    value: number;
    caption: string;
    tone: Tone;
    pct: number;
  }[] = [
    {
      key: "going",
      label: "Attending",
      value: going,
      caption: `${expected} of ${seatsTotal} seats · ${adultsTotal} adults · ${kidsTotal} kids`,
      tone: "going",
      pct: pct(going),
    },
    {
      key: "declined",
      label: "Declined",
      value: notGoing,
      caption: "sent regrets",
      tone: "declined",
      pct: pct(notGoing),
    },
    {
      key: "pending",
      label: "Awaiting reply",
      value: pending,
      caption: "no response yet",
      tone: "pending",
      pct: pct(pending),
    },
    {
      key: "invited",
      label: "Invited",
      value: invited,
      caption: `${pct(responded)}% responded`,
      tone: "invited",
      pct: pct(responded),
    },
  ];

  const guestRows: GuestRow[] = rows.map((r) => ({
    id: r.id,
    token: r.token,
    name: r.name,
    maxGuests: r.maxGuests,
    adults: r.adults,
    kids: r.kids,
    status: r.status,
    email: r.email,
    phone: r.phone,
    adminNote: r.adminNote,
    guestNote: r.guestNote,
    respondedAt: r.respondedAt ? r.respondedAt.toISOString() : null,
    labels: r.guestLabels.map((gl) => ({ id: gl.labelId, name: gl.label.name })),
  }));

  const baseUrl = process.env.APP_URL ?? "";

  return (
    <div className="flex flex-col gap-5 pb-16 sm:gap-6 sm:pb-0">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="font-script text-[30px] leading-none text-(--script) sm:text-[38px]">
              {COUPLE}
            </div>
            <NameSprig />
          </div>
          <h1 className="mt-1 font-serif text-[28px] leading-[1.02] text-foreground sm:text-[42px]">
            Manage RSVP
          </h1>
          <div className="mt-2.5 text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase sm:text-xs">
            {OCCASION}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3.5">
          <div className="relative">
            <AccountGarland />
            <AccountMenu
              user={{
                name: user.name,
                email: user.email,
                role: user.role,
                picture: user.picture,
              }}
              labels={allLabels}
            />
          </div>
          {/* Phones get a fixed bottom "Add guest" bar instead of header buttons. */}
          <div className="hidden flex-wrap items-center justify-end gap-2.5 sm:flex">
            <ExportGuestsButton rows={guestRows} baseUrl={baseUrl} />
            <GuestDialog mode="create" labels={allLabels} />
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard
            key={s.key}
            label={s.label}
            value={s.value}
            caption={s.caption}
            tone={s.tone}
            pct={s.pct}
          />
        ))}
      </div>

      {/* Guest list — botanical card frames are a desktop-only flourish */}
      <div className="relative">
        <CardSprayTopRight className="wind-sway pointer-events-none absolute -top-[42px] -right-[42px] z-[6] hidden h-[calc(100%_+_84px)] max-h-[420px] w-auto lg:block" />
        <CardSprayBottomLeft className="wind-sway pointer-events-none absolute -bottom-[42px] -left-[42px] z-[6] hidden h-[calc(100%_+_84px)] max-h-[420px] w-auto lg:block" />
        <GuestsTable rows={guestRows} labels={allLabels} baseUrl={baseUrl} />
      </div>

      {/* Mobile: fixed bottom action bar (per hi-fi mobile design) */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center bg-gradient-to-t from-white via-white/90 to-transparent px-5 pt-5 pb-6 sm:hidden dark:from-background dark:via-background/90">
        <GuestDialog mode="create" labels={allLabels} />
      </div>
    </div>
  );
}
