import { LeafShape } from './Leaf'

/** A video call on a laptop, between a warm mug and a growing plant. */
export function OnlineCallArt(): React.ReactElement {
  return (
    <svg className="art online-call" viewBox="0 0 220 138" aria-hidden="true" focusable="false">
      <path
        className="art__tile"
        d="M40 20c30-18 98-20 136-2 30 15 36 62 18 90-16 24-60 24-102 22-40-2-66-8-74-34-8-27-2-62 22-76z"
      />
      {/* The desk. */}
      <path d="M8 124h204" />
      {/* The laptop. */}
      <rect className="art__paper" x="58" y="28" width="104" height="76" rx="6" />
      <rect x="64" y="34" width="92" height="64" rx="2" />
      <path d="M58 104l-12 12h128l-12-12M46 116v3c0 3 2 5 5 5h118c3 0 5-2 5-5v-3M98 111h24" />
      {/* The person on the call, and the call buttons. */}
      <path d="M97 71c-5-3-1-9-1-18 0-10 6-15 14-15s14 5 14 15c0 9 4 15-1 18" />
      <circle cx="110" cy="55" r="9" />
      <path d="M89 85c1-9 9-13 17-14l4 4 4-4c8 1 16 5 17 14" />
      <circle cx="99" cy="91.5" r="3" />
      <circle cx="110" cy="91.5" r="3" />
      <circle className="art__dot" cx="121" cy="91.5" r="4" />
      {/* The mug. */}
      <path d="M18 104h20v13c0 4-3 7-7 7h-6c-4 0-7-3-7-7zM38 108c8 0 8 10 0 10M24 96c-3-4 3-6 0-10M32 96c-3-4 3-6 0-10" />
      {/* The plant. */}
      <path d="M182 104h26l-3 18c0 1-1 2-2 2h-16c-1 0-2-1-2-2z" />
      <path className="art__stem" pathLength="1" d="M195 104c0-18 1-30-1-48" />
      <path className="art__stem" pathLength="1" d="M195 104c0-14-5-22-12-28" />
      <path className="art__stem" pathLength="1" d="M195 104c1-12 5-18 11-23" />
      <LeafShape x={194} y={57} turn={30} scale={0.9} />
      <LeafShape x={183} y={76} turn={-8} scale={0.85} />
      <LeafShape x={206} y={81} turn={62} scale={0.65} />
      <LeafShape x={195} y={78} turn={78} scale={0.55} />
    </svg>
  )
}
