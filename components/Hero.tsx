import type { Profile } from "@/types/database";

const WORDMARK = "Know me more.";

// Hairline registration crosses. They sit on an invisible grid around the
// wordmark the way crop marks sit around artwork — the one piece of
// decoration that earns its place by framing the thing it surrounds.
function Cross({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className={`pointer-events-none absolute h-2.5 w-2.5 text-ink/30 ${className}`}
    >
      <path d="M6 0.5v11M0.5 6h11" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function Crosshair({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      className={`pointer-events-none absolute h-6 w-6 text-ink sm:h-7 sm:w-7 ${className}`}
    >
      <circle cx="16" cy="16" r="13.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 1v7M16 24v7M1 16h7M24 16h7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="4.5" fill="currentColor" />
    </svg>
  );
}

function Caret({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 10 12"
      className={`pointer-events-none absolute h-2.5 w-2 text-ink ${flip ? "rotate-180" : ""} ${className}`}
    >
      <path d="M0 0l10 6-10 6z" fill="currentColor" />
    </svg>
  );
}

export default function Hero({ profile }: { profile: Profile }) {
  // Three copies of one word: two stroke-only echoes knocked off-axis, then
  // the solid one on top. The red panel sits behind all three.
  const echo =
    "pointer-events-none absolute select-none whitespace-nowrap font-display font-black uppercase leading-none tracking-[-0.035em] text-transparent";
  // Thirteen characters on one line, so the size is set to fill the measure
  // rather than to a fixed scale — the wordmark spans the page the way the
  // single word did.
  const size = "text-[9vw] lg:text-[8.2rem]";

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_75%_65%_at_50%_38%,#F5F4F2_0%,#E7E6E3_55%,#D8D7D3_100%)] px-6 pb-12 pt-9 sm:px-10 lg:px-16">
      {/* Play-head marks sit against the page edges, outside the measure, so
          they frame the whole composition rather than the wordmark. */}
      <Caret className="left-2 top-1/2 sm:left-4" />
      <Caret className="right-2 top-1/2 sm:right-4" flip />

      <div className="mx-auto max-w-[1180px]">
        <p className="font-display text-[11px] font-bold uppercase leading-[1.45] tracking-[0.14em] text-ink sm:text-xs">
          Welcome
        </p>

        <Crosshair className="right-6 top-8 sm:right-10 lg:right-16" />

        <div className="relative mt-4 flex min-h-[27vw] items-center justify-center sm:mt-1 lg:min-h-[15rem]">
          {/* The red panel is the only saturated thing on the page. Its height
              is set against the wordmark rather than the container, so it stays
              a contained block instead of a full-bleed stripe. */}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[26vw] max-h-[250px] w-[13vw] max-w-[122px] -translate-x-1/2 -translate-y-1/2 bg-red"
          />

          <span
            aria-hidden
            className={`${echo} ${size} -translate-x-[3.5%] -translate-y-[16%] -rotate-[5deg] [-webkit-text-stroke:1px_rgba(18,18,18,0.5)]`}
          >
            {WORDMARK}
          </span>
          <span
            aria-hidden
            className={`${echo} ${size} translate-x-[4%] translate-y-[15%] rotate-[4deg] [-webkit-text-stroke:1px_rgba(18,18,18,0.32)]`}
          >
            {WORDMARK}
          </span>

          <h1
            className={`relative whitespace-nowrap font-display ${size} font-black uppercase leading-none tracking-[-0.035em] text-ink`}
          >
            {WORDMARK}
          </h1>

          <Cross className="left-[6%] top-[4%]" />
          <Cross className="right-[9%] top-0" />
          <Cross className="left-[22%] bottom-[2%]" />
          <Cross className="right-[24%] bottom-0" />
        </div>

        <div className="mt-7 flex items-baseline justify-between gap-6 sm:mt-9">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-ink sm:text-xs">
            {profile.display_name ?? profile.name}
          </p>
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-ink sm:text-xs">
            {profile.title ?? "Multimedia Designer"}
          </p>
        </div>
      </div>
    </section>
  );
}
