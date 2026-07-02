import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/**
 * Decorative floral art for the Wedding RSVP dashboard — the "flowery" layer of
 * the hi-fi `Wedding RSVP Dashboard.dc.html` design (wisteria & fig palette).
 *
 * Every flourish is built from three primitives: a 5-petal `Blossom` (clustered
 * circles + gold center), rotated `Leaf` ellipses, and hand-drawn stem paths.
 * All are purely decorative (`aria-hidden`, `pointer-events-none`) and render on
 * the server — no interactivity. Colors are art tokens, hardcoded to match the
 * design exactly rather than themed.
 */

const GOLD = "#e6c96a";

type Pt = readonly [number, number];

// 5-petal layouts, keyed to the design's per-flower petal radius.
const PETALS_MED: readonly Pt[] = [[0, -11], [10, -3], [6, 9], [-6, 9], [-10, -3]];
const PETALS_BIG: readonly Pt[] = [[0, -11], [10.5, -3.4], [6.5, 8.9], [-6.5, 8.9], [-10.5, -3.4]];
const PETALS_S2: readonly Pt[] = [[0, -8], [7.6, -2.5], [4.7, 6.5], [-4.7, 6.5], [-7.6, -2.5]];

function Blossom({
  x = 0,
  y = 0,
  s = 1,
  pts,
  r,
  cr,
  petal,
}: {
  x?: number;
  y?: number;
  s?: number;
  pts: readonly Pt[];
  r: number;
  cr: number;
  petal: string;
}) {
  const transform = `translate(${x} ${y})${s === 1 ? "" : ` scale(${s})`}`;
  // Deterministic per-blossom phase so the field doesn't rustle in lockstep.
  const delay = ((Math.abs(x * 13 + y * 7) % 36) / 10).toFixed(1);
  const duration = (3.5 + (Math.abs(x + y) % 3) * 0.5).toFixed(1);
  return (
    <g
      className="wind-rustle"
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
    >
      <g transform={transform}>
        {pts.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={petal} />
        ))}
        <circle r={cr} fill={GOLD} />
      </g>
    </g>
  );
}

function Leaf({
  cx,
  cy,
  rx,
  ry,
  rot,
  fill,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot: number;
  fill: string;
}) {
  // Deterministic per-leaf phase/speed — same idea as Blossom, so leaves flutter
  // out of sync like a real breeze.
  const delay = ((Math.abs(cx * 7 + cy * 13) % 42) / 10).toFixed(1);
  const duration = (2.7 + (Math.abs(cx + cy) % 4) * 0.4).toFixed(1);
  return (
    <g
      className="wind-rustle"
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
    >
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={fill}
        transform={`rotate(${rot} ${cx} ${cy})`}
      />
    </g>
  );
}

type SvgProps = { className?: string; style?: CSSProperties };

// Page top-left corner spray (large wisteria stem with berries + blossoms).
export function PageFloralTopLeft({ className, style }: SvgProps) {
  return (
    <svg
      width={340}
      height={340}
      viewBox="0 0 340 340"
      aria-hidden="true"
      focusable="false"
      className={
        className ??
        // Hidden on phones (the mobile design uses a single top-right spray);
        // tablet shows a 240px version, desktop the full 340px.
        "pointer-events-none absolute -top-[30px] -left-[40px] hidden h-[240px] w-[240px] opacity-50 md:block lg:-top-[46px] lg:-left-[58px] lg:h-[340px] lg:w-[340px]"
      }
      style={style}
    >
      <g fill="none" stroke="#b6a6d6" strokeWidth={2} strokeLinecap="round">
        <path d="M8 8 C70 40 108 96 128 168 C136 198 140 232 138 262" />
        <path d="M128 168 C150 150 186 148 214 160 C182 170 150 176 128 168" />
        <path d="M108 116 C130 96 168 92 196 102 C166 116 132 128 108 116" />
        <path d="M92 74 C112 56 146 52 172 60 C146 74 116 84 92 74" />
      </g>
      <g fill="#c9a1ad">
        <circle cx={214} cy={160} r={8} />
        <circle cx={196} cy={102} r={7} />
        <circle cx={172} cy={60} r={6} />
      </g>
      <g fill="#7a9a5c" opacity={0.85}>
        <Leaf cx={60} cy={150} rx={9} ry={22} rot={-32} fill="#7a9a5c" />
        <Leaf cx={92} cy={206} rx={8} ry={20} rot={-18} fill="#7a9a5c" />
      </g>
      <Blossom x={230} y={132} pts={PETALS_MED} r={6} cr={5} petal="#d9b6c4" />
      <Blossom x={210} y={76} s={0.8} pts={PETALS_MED} r={6} cr={5} petal="#d9b6c4" />
    </svg>
  );
}

// Page bottom-right corner spray (mirrored companion to the top-left).
export function PageFloralBottomRight({ className, style }: SvgProps) {
  return (
    <svg
      width={300}
      height={300}
      viewBox="0 0 300 300"
      aria-hidden="true"
      focusable="false"
      className={
        className ??
        "pointer-events-none absolute -right-[46px] -bottom-[52px] hidden -scale-x-100 opacity-[0.42] lg:block"
      }
      style={style}
    >
      <g fill="none" stroke="#c9a1ad" strokeWidth={2} strokeLinecap="round">
        <path d="M292 292 C232 258 190 200 168 132 C158 102 152 70 152 42" />
        <path d="M168 132 C146 150 112 152 86 142 C114 130 146 122 168 132" />
        <path d="M182 182 C160 200 126 204 100 194 C130 180 160 170 182 182" />
      </g>
      <g fill="#7a9a5c" opacity={0.85}>
        <Leaf cx={230} cy={150} rx={9} ry={22} rot={32} fill="#7a9a5c" />
        <Leaf cx={204} cy={212} rx={8} ry={20} rot={18} fill="#7a9a5c" />
      </g>
      <Blossom x={78} y={122} pts={PETALS_MED} r={6} cr={5} petal="#d9b6c4" />
      <Blossom x={92} y={176} s={0.82} pts={PETALS_MED} r={6} cr={5} petal="#d9b6c4" />
    </svg>
  );
}

// Small sprig tucked beside the couple's script name.
export function NameSprig({ className }: SvgProps) {
  return (
    <svg
      width={58}
      height={30}
      viewBox="0 0 58 30"
      aria-hidden="true"
      focusable="false"
      className={className ?? "shrink-0"}
    >
      <path d="M2 15 C14 15 20 8 27 8" fill="none" stroke="#7a9a5c" strokeWidth={1.6} strokeLinecap="round" />
      <Leaf cx={14} cy={10} rx={4} ry={8} rot={-30} fill="#8fae6e" />
      <Leaf cx={8} cy={20} rx={3.5} ry={7} rot={-14} fill="#8fae6e" />
      <Blossom x={38} y={13} pts={PETALS_S2} r={4.6} cr={4} petal="#d9b6c4" />
    </svg>
  );
}

// Garland arcing around the account chip (desktop only — the updated hi-fi
// design replaces the two small corner sprigs with this single wreath).
export function AccountGarland({ className }: SvgProps) {
  return (
    <svg
      width={207}
      height={76}
      viewBox="0 0 207 76"
      aria-hidden="true"
      focusable="false"
      className={
        // Right-anchored: the garland's arc was drawn around the chip's right
        // edge (chip is ~170px in the design but ours varies with the user's
        // name), so pinning the right side keeps the wreath hugging the outline.
        className ?? "pointer-events-none absolute -top-4 -right-[21px] z-[5] hidden lg:block"
      }
    >
      <path
        d="M189 24 C196 42 186 56 163 59.5 L57 60"
        fill="none"
        stroke="#9cb87c"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Leaf cx={147} cy={67} rx={4} ry={10.5} rot={-52} fill="#8fae6e" />
      <Leaf cx={121} cy={68} rx={4} ry={10.5} rot={-34} fill="#8fae6e" />
      <Leaf cx={87} cy={67} rx={3.8} ry={10} rot={-58} fill="#8fae6e" />
      <Leaf cx={177} cy={56} rx={3.8} ry={10} rot={40} fill="#8fae6e" />
      <Leaf cx={135} cy={52} rx={3.2} ry={8} rot={50} fill="#a9c489" />
      <Leaf cx={103} cy={52} rx={3.2} ry={8} rot={42} fill="#a9c489" />
      <Blossom x={57} y={63} s={0.82} pts={PETALS_BIG} r={6.5} cr={5.5} petal="#c9a1ad" />
      <Blossom x={191} y={24} s={0.66} pts={PETALS_BIG} r={6.5} cr={5.5} petal="#d9b6c4" />
    </svg>
  );
}

/**
 * One rounded-corner botanical sprig for a kanban status column. Drawn for the
 * top-left corner; the other corners reuse it via a flip transform. Sits on the
 * column's dashed outline (behind the guest cards) so the column itself reads
 * as garlanded — per the kanban design's per-column vine layer.
 */
export type Corner = "tl" | "tr" | "bl" | "br";
type Side = "top" | "right" | "bottom" | "left";

// Fractions along each edge where a leaf+flower cluster is planted. Enough to
// read as a continuous vine of leaves and flowers, not a bare line.
const EDGE_T = [0.12, 0.31, 0.5, 0.69, 0.88] as const;

// One small leaf-pair + blossom, centered exactly on its (x, y) edge point via a
// -50%/-50% shift so it sits ON the outline. Varied per index so the field isn't
// uniform. viewBox is un-stretched (its own square) so nothing distorts.
function GarlandNode({ i, style }: { i: number; style: CSSProperties }) {
  const petal = i % 3 === 0 ? "#c9a1ad" : i % 3 === 1 ? "#d9b6c4" : "#e0c58f";
  const s = 0.82 + (i % 3) * 0.12;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute block"
      style={{ ...style, transform: "translate(-50%, -50%)" }}
    >
      <svg width={38} height={38} viewBox="-19 -19 38 38" className="overflow-visible">
        <Leaf cx={-8} cy={5} rx={3.4} ry={8.5} rot={38} fill="#7a9a5c" />
        <Leaf cx={8} cy={6} rx={3.2} ry={8} rot={-40} fill="#8fae6e" />
        <Blossom x={0} y={-2} s={s} pts={PETALS_MED} r={5.4} cr={4.5} petal={petal} />
      </svg>
    </span>
  );
}

// Stem path (in a 0..100 box, stretched to the parent) tracing exactly the
// requested edges. Full set = rounded rect; a corner pair = an L along its two
// edges.
function stemPath(sides: readonly Side[]): string {
  const has = (s: Side) => sides.includes(s);
  if (has("top") && has("right") && has("bottom") && has("left")) {
    return "M3 1 L97 1 A2 2 0 0 1 99 3 L99 97 A2 2 0 0 1 97 99 L3 99 A2 2 0 0 1 1 97 L1 3 A2 2 0 0 1 3 1 Z";
  }
  // Corner pairs (two adjacent edges) — draw the far end → corner → far end.
  if (has("top") && has("left")) return "M99 1 L3 1 A2 2 0 0 0 1 3 L1 99";
  if (has("top") && has("right")) return "M1 1 L97 1 A2 2 0 0 1 99 3 L99 99";
  if (has("bottom") && has("left")) return "M99 99 L3 99 A2 2 0 0 1 1 97 L1 1";
  if (has("bottom") && has("right")) return "M1 99 L97 99 A2 2 0 0 0 99 97 L99 1";
  return "";
}

/**
 * Vine that sits ON a component's outline. An SVG stem (non-scaling stroke,
 * `preserveAspectRatio: none`) stretches to trace the exact border of the
 * parent, and leaf+flower nodes are anchored to each requested edge so the vine
 * follows the outline at any size. Give the parent `position: relative`.
 *
 * HARD RULE: vines are always edge-anchored here — never floated near a corner.
 */
function OutlineGarland({ sides }: { sides: readonly Side[] }) {
  const nodes: CSSProperties[] = [];
  if (sides.includes("top")) EDGE_T.forEach((t) => nodes.push({ top: 0, left: `${t * 100}%` }));
  if (sides.includes("bottom"))
    EDGE_T.forEach((t) => nodes.push({ bottom: 0, left: `${t * 100}%` }));
  if (sides.includes("left")) EDGE_T.forEach((t) => nodes.push({ left: 0, top: `${t * 100}%` }));
  if (sides.includes("right")) EDGE_T.forEach((t) => nodes.push({ right: 0, top: `${t * 100}%` }));
  // Corner accents so adjacent edges connect visually.
  const corner = (a: Side, b: Side, style: CSSProperties) => {
    if (sides.includes(a) && sides.includes(b)) nodes.push(style);
  };
  corner("top", "left", { top: 0, left: 0 });
  corner("top", "right", { top: 0, right: 0 });
  corner("bottom", "left", { bottom: 0, left: 0 });
  corner("bottom", "right", { bottom: 0, right: 0 });

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-visible" aria-hidden="true">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <path
          d={stemPath(sides)}
          fill="none"
          stroke="#7d9163"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {nodes.map((style, i) => (
        <GarlandNode key={i} i={i} style={style} />
      ))}
    </div>
  );
}

const CORNER_SIDES: Record<Corner, Side[]> = {
  tl: ["top", "left"],
  tr: ["top", "right"],
  bl: ["bottom", "left"],
  br: ["bottom", "right"],
};

// Awaiting-reply column (design vineBL): vine on the bottom + left edges.
export function ColumnVineBottomLeft() {
  return <OutlineGarland sides={["bottom", "left"]} />;
}

// Declined column (design vineTR): vine on the top + right edges.
export function ColumnVineTopRight() {
  return <OutlineGarland sides={["top", "right"]} />;
}

// Attending column (design vineFull): vine tracing the WHOLE outline, leaves and
// flowers all the way around.
export function ColumnVineFull() {
  return <OutlineGarland sides={["top", "right", "bottom", "left"]} />;
}

// Card-scale vine on one guest card (mobile): traces the two edges of one
// rounded corner. The caller cycles the corner per item.
export function CardCornerFrame({ corner }: { corner: Corner }) {
  return <OutlineGarland sides={CORNER_SIDES[corner]} />;
}

// Large botanical frame at the guest-list card's top-right corner.
export function CardSprayTopRight({ className }: SvgProps) {
  return (
    <svg
      width={360}
      height={420}
      viewBox="0 0 360 420"
      aria-hidden="true"
      focusable="false"
      className={
        className ??
        // Cap height to the card (+42px bleed top & bottom); width scales with the
        // aspect ratio so the frame shrinks with short guest lists instead of
        // overhanging. Never taller than the design's intrinsic 420px.
        "wind-sway pointer-events-none absolute -top-[42px] -right-[42px] z-[6] h-[calc(100%_+_84px)] max-h-[420px] w-auto"
      }
    >
      <path
        d="M112 42 L300 42 A18 18 0 0 1 318 60 L318 372"
        fill="none"
        stroke="#9cb87c"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <g fill="none" stroke="#9cb87c" strokeWidth={1.6} strokeLinecap="round">
        <path d="M200 42 C198 30 204 22 214 18" />
        <path d="M318 150 C330 148 338 142 342 132" />
        <path d="M318 268 C330 266 338 260 342 250" />
        <path d="M150 42 C146 32 148 24 156 20" />
      </g>
      <g>
        <Leaf cx={132} cy={30} rx={5} ry={13} rot={-56} fill="#8fae6e" />
        <Leaf cx={162} cy={28} rx={5} ry={13} rot={-38} fill="#8fae6e" />
        <Leaf cx={222} cy={29} rx={5} ry={13} rot={-22} fill="#8fae6e" />
        <Leaf cx={252} cy={31} rx={4.6} ry={12} rot={-64} fill="#8fae6e" />
        <Leaf cx={284} cy={30} rx={4.6} ry={12} rot={-34} fill="#8fae6e" />
        <Leaf cx={148} cy={52} rx={4} ry={10} rot={52} fill="#a9c489" />
        <Leaf cx={238} cy={52} rx={4} ry={10} rot={40} fill="#a9c489" />
        <Leaf cx={332} cy={96} rx={5} ry={13} rot={52} fill="#8fae6e" />
        <Leaf cx={334} cy={138} rx={5} ry={13} rot={34} fill="#8fae6e" />
        <Leaf cx={332} cy={196} rx={5} ry={13} rot={58} fill="#8fae6e" />
        <Leaf cx={334} cy={240} rx={4.6} ry={12} rot={38} fill="#8fae6e" />
        <Leaf cx={331} cy={300} rx={5} ry={13} rot={54} fill="#8fae6e" />
        <Leaf cx={330} cy={344} rx={4.4} ry={11} rot={40} fill="#8fae6e" />
        <Leaf cx={306} cy={118} rx={3.8} ry={9.5} rot={-44} fill="#a9c489" />
        <Leaf cx={306} cy={220} rx={3.8} ry={9.5} rot={-52} fill="#a9c489" />
        <Leaf cx={306} cy={322} rx={3.8} ry={9.5} rot={-46} fill="#a9c489" />
      </g>
      <g>
        <Blossom x={196} y={26} s={0.82} pts={PETALS_BIG} r={6.5} cr={5.5} petal="#d9b6c4" />
        <Blossom x={322} y={64} s={0.92} pts={PETALS_BIG} r={6.5} cr={5.5} petal="#c9a1ad" />
        <Blossom x={336} y={172} s={0.8} pts={PETALS_BIG} r={6.5} cr={5.5} petal="#d9b6c4" />
        <Blossom x={332} y={280} s={0.72} pts={PETALS_BIG} r={6.5} cr={5.5} petal="#c9a1ad" />
      </g>
    </svg>
  );
}

// Large botanical frame at the guest-list card's bottom-left corner.
export function CardSprayBottomLeft({ className }: SvgProps) {
  return (
    <svg
      width={360}
      height={420}
      viewBox="0 0 360 420"
      aria-hidden="true"
      focusable="false"
      className={
        className ??
        "wind-sway pointer-events-none absolute -bottom-[42px] -left-[42px] z-[6] h-[calc(100%_+_84px)] max-h-[420px] w-auto"
      }
    >
      <path
        d="M42 60 L42 360 A18 18 0 0 0 60 378 L248 378"
        fill="none"
        stroke="#9cb87c"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <g fill="none" stroke="#9cb87c" strokeWidth={1.6} strokeLinecap="round">
        <path d="M42 210 C30 208 22 202 18 192" />
        <path d="M42 300 C30 298 22 292 18 282" />
        <path d="M160 378 C158 390 164 398 174 402" />
        <path d="M210 378 C208 390 214 398 224 402" />
      </g>
      <g>
        <Leaf cx={28} cy={96} rx={5} ry={13} rot={52} fill="#8fae6e" />
        <Leaf cx={26} cy={138} rx={5} ry={13} rot={34} fill="#8fae6e" />
        <Leaf cx={28} cy={196} rx={5} ry={13} rot={58} fill="#8fae6e" />
        <Leaf cx={26} cy={240} rx={4.6} ry={12} rot={38} fill="#8fae6e" />
        <Leaf cx={29} cy={300} rx={5} ry={13} rot={54} fill="#8fae6e" />
        <Leaf cx={30} cy={340} rx={4.4} ry={11} rot={40} fill="#8fae6e" />
        <Leaf cx={54} cy={118} rx={3.8} ry={9.5} rot={-44} fill="#a9c489" />
        <Leaf cx={54} cy={220} rx={3.8} ry={9.5} rot={-52} fill="#a9c489" />
        <Leaf cx={54} cy={322} rx={3.8} ry={9.5} rot={-46} fill="#a9c489" />
        <Leaf cx={96} cy={390} rx={5} ry={13} rot={-56} fill="#8fae6e" />
        <Leaf cx={126} cy={392} rx={5} ry={13} rot={-38} fill="#8fae6e" />
        <Leaf cx={186} cy={391} rx={5} ry={13} rot={-22} fill="#8fae6e" />
        <Leaf cx={216} cy={393} rx={4.6} ry={12} rot={-64} fill="#8fae6e" />
        <Leaf cx={112} cy={368} rx={4} ry={10} rot={52} fill="#a9c489" />
        <Leaf cx={202} cy={368} rx={4} ry={10} rot={40} fill="#a9c489" />
      </g>
      <g>
        <Blossom x={38} y={176} s={0.8} pts={PETALS_BIG} r={6.5} cr={5.5} petal="#d9b6c4" />
        <Blossom x={52} y={358} s={0.92} pts={PETALS_BIG} r={6.5} cr={5.5} petal="#c9a1ad" />
        <Blossom x={160} y={392} s={0.82} pts={PETALS_BIG} r={6.5} cr={5.5} petal="#d9b6c4" />
      </g>
    </svg>
  );
}
