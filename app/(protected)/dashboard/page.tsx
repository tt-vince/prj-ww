import { requireUser } from "@/lib/dal";
import { db } from "@/db";
import { labels as labelsTable } from "@/db/schema";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GuestsTable, type GuestRow } from "./guests-table";
import { ExportGuestsButton } from "./export-guests-button";
import { GuestDialog } from "./guests/guest-dialog";
import { LabelsManager } from "./guests/labels-manager";

// Placeholder couple + date lifted from the design; swap for the real names/date.
const COUPLE_NOTE = "Hyuwu & Empty · April 2026";

type Tone = "going" | "declined" | "pending" | "invited";

const TONE: Record<Tone, { text: string; bar: string }> = {
  going: { text: "text-stat-going", bar: "[&_[data-slot=progress-indicator]]:bg-stat-going-bar" },
  declined: {
    text: "text-stat-declined",
    bar: "[&_[data-slot=progress-indicator]]:bg-stat-declined-bar",
  },
  pending: {
    text: "text-stat-pending",
    bar: "[&_[data-slot=progress-indicator]]:bg-stat-pending-bar",
  },
  invited: {
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
  return (
    <Card size="sm" className="gap-3">
      <CardHeader>
        <CardDescription className="text-[11px] font-medium tracking-wider uppercase">
          {label}
        </CardDescription>
        <CardTitle className={cn("text-4xl font-semibold tabular-nums", TONE[tone].text)}>
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">{caption}</p>
        <Progress
          value={pct}
          className={cn("gap-0 [&_[data-slot=progress-track]]:h-2", TONE[tone].bar)}
        />
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  await requireUser();

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
  let expected = 0;
  for (const r of rows) {
    seatsTotal += r.maxGuests;
    if (r.status === "going") {
      going += 1;
      expected += r.partySize ?? 0;
    } else if (r.status === "not_going") {
      notGoing += 1;
    } else {
      pending += 1;
    }
  }
  const responded = going + notGoing;
  const pct = (n: number) => (invited ? Math.round((n / invited) * 100) : 0);
  const respondedPct = pct(responded);

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
      caption: `${expected} of ${seatsTotal} seats`,
      tone: "going",
      pct: pct(going),
    },
    {
      key: "declined",
      label: "Declined",
      value: notGoing,
      caption: "with regrets",
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
      caption: `${respondedPct}% responded`,
      tone: "invited",
      pct: respondedPct,
    },
  ];

  const guestRows: GuestRow[] = rows.map((r) => ({
    id: r.id,
    token: r.token,
    name: r.name,
    maxGuests: r.maxGuests,
    partySize: r.partySize,
    status: r.status,
    email: r.email,
    phone: r.phone,
    adminNote: r.adminNote,
    respondedAt: r.respondedAt ? r.respondedAt.toISOString() : null,
    labels: r.guestLabels.map((gl) => ({ id: gl.labelId, name: gl.label.name })),
  }));

  const baseUrl = process.env.APP_URL ?? "";

  return (
    <Card className="[--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(7)]">
      <CardContent className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-script text-2xl leading-none text-primary">
              {COUPLE_NOTE}
            </span>
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Manage RSVP
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ExportGuestsButton rows={guestRows} baseUrl={baseUrl} />
            <LabelsManager labels={allLabels} />
            <GuestDialog mode="create" labels={allLabels} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
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

        {/* Guest table */}
        <GuestsTable rows={guestRows} labels={allLabels} baseUrl={baseUrl} />
      </CardContent>
    </Card>
  );
}
