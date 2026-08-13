import type { ReactElement } from "react";

export function AtticEstablishing() {
  return (
    <svg viewBox="0 0 200 120" className="h-4/5 w-4/5 text-ink" fill="none">
      <path d="M10 100V50L60 15h80l50 35v50" stroke="currentColor" strokeWidth="1.5" />
      <rect x="120" y="40" width="24" height="20" stroke="currentColor" strokeWidth="1.2" />
      <path d="M126 46l6 8M144 46l-6 8" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <rect x="40" y="70" width="34" height="14" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M170 92c-14-14-16-24 4-36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="176" cy="50" r="6" stroke="currentColor" strokeWidth="2" />
      <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

export function TenseCloseUp() {
  return (
    <svg viewBox="0 0 100 120" className="h-4/5 w-4/5 text-ink" fill="none">
      <path
        d="M50 14c-19 0-30 15-30 34 0 21 13 38 30 38s30-17 30-38c0-19-11-34-30-34Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M32 40l10-4M68 40l-10-4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="38" cy="48" r="2.2" fill="currentColor" />
      <circle cx="62" cy="48" r="2.2" fill="currentColor" />
      <path d="M42 66h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M78 30c3 3 3 7 0 10"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StairDescent() {
  return (
    <svg viewBox="0 0 220 100" className="h-4/5 w-4/5 text-ink" fill="none">
      <path
        d="M10 20h30v14h30v14h30v14h30v14h30v14h30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="70" cy="30" r="6" stroke="currentColor" strokeWidth="2" />
      <path
        d="M70 36v18c-6 4-10 10-10 16M70 54c5 3 9 8 10 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M100 62l8-4M100 70l10-3" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function StepDetail() {
  return (
    <svg viewBox="0 0 100 100" className="h-3/4 w-3/4 text-ink" fill="none">
      <path d="M15 60h30v25" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path
        d="M55 45c6 2 10 6 12 12M60 40c8 1 14 6 17 14"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoorDetail() {
  return (
    <svg viewBox="0 0 100 120" className="h-4/5 w-4/5 text-ink" fill="none">
      <rect x="25" y="15" width="50" height="90" stroke="currentColor" strokeWidth="1.5" />
      <line x1="75" y1="15" x2="82" y2="20" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
      <line x1="75" y1="105" x2="82" y2="100" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
      <circle cx="65" cy="62" r="2" fill="currentColor" />
    </svg>
  );
}

export function AtmosphereFinal() {
  return (
    <svg viewBox="0 0 280 90" className="h-3/5 w-3/5 text-ink" fill="none">
      <path d="M40 5L120 45L40 85" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <path d="M240 5L160 45L240 85" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <path
        d="M100 70c6-6 6-10 0-16M110 74c8-8 8-14 0-22M120 78c10-10 10-16 0-26"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.35"
      />
      <ellipse cx="140" cy="46" rx="10" ry="14" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
    </svg>
  );
}

export const PANEL_ART: Record<string, () => ReactElement> = {
  "panel-1": AtticEstablishing,
  "panel-2": TenseCloseUp,
  "panel-3": StairDescent,
  "panel-4": StepDetail,
  "panel-5": DoorDetail,
  "panel-6": AtmosphereFinal,
};
