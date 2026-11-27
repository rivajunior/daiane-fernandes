export type AreaArtName = 'plate' | 'path' | 'sprout' | 'planner' | 'tangle' | 'book'

// Open paths are drawn as lines; `art__leaf` paths are filled leaves.
const DRAWINGS: Record<AreaArtName, React.ReactElement> = {
  // A plate with a leaf, between fork and knife.
  plate: (
    <>
      <circle cx="60" cy="46" r="27" />
      <circle cx="60" cy="46" r="18" />
      <path d="M21 23v16c0 4 6 4 6 0V23M24 23v47M96 23c-6 5-6 20 0 23v24M96 23v23" />
      <path className="art__leaf" d="M52 55c-2-14 7-21 20-21 1 13-7 22-20 21z" />
      <path d="M49 59l18-18" />
    </>
  ),
  // A tangled line that ends in a leaf.
  tangle: (
    <>
      <path d="M15 58c10-30 33-23 26-6s-26 4-10-11 33 3 19 17-26-9-4-15 20 20 31 15c7-3 7-13 16-20" />
      <path className="art__leaf" d="M93 38c-2-12 5-20 15-21 2 11-4 20-15 21z" />
      <path d="M93 38l10-14" />
    </>
  ),
  // Open hands holding a sprout.
  sprout: (
    <>
      <path d="M19 54c9-3 15 1 22 9 5 5 13 7 18 4M19 66c8 1 12 7 20 12 7 4 17 3 21-2M101 54c-9-3-15 1-22 9-5 5-13 7-18 4M101 66c-8 1-12 7-20 12-7 4-17 3-21-2M60 60V35" />
      <path
        className="art__leaf"
        d="M60 42c-14 1-20-9-20-17 12-1 20 6 20 17zM60 35c12 0 19-10 18-20-12 1-19 9-18 20z"
      />
    </>
  ),
  // A winding path with stepping points and leaves.
  path: (
    <>
      <path d="M14 72c18 0 18-20 36-20s18-14 32-18 18-12 22-18" />
      <circle cx="24" cy="70" r="4" />
      <circle cx="52" cy="52" r="4" />
      <circle cx="82" cy="34" r="4" />
      <path
        className="art__leaf"
        d="M52 48c-10-2-14-10-12-18 10 2 14 9 12 18zM84 31c0-10 7-16 16-15 0 10-6 15-16 15zM30 66c4-9 12-12 20-9-4 8-11 11-20 9z"
      />
    </>
  ),
  // A weekly planner with a leaf in one of its days.
  planner: (
    <>
      <rect x="27" y="18" width="66" height="62" rx="6" />
      <path d="M27 34h66M43 11v14M77 11v14M38 46h8M56 46h8M74 46h8M38 58h8M56 58h8M38 70h8" />
      <path className="art__leaf" d="M68 71c-1-10 7-17 18-17 0 10-7 18-18 17z" />
      <path d="M65 74l13-13" />
    </>
  ),
  // An open book with a leaf growing out of it.
  book: (
    <>
      <path d="M60 36c-10-8-24-9-39-5v46c15-4 29-3 39 5 10-8 24-9 39-5V31c-15-4-29-3-39 5zM60 36v46M31 44c7-1 13 0 20 3M31 55c7-1 13 0 20 3M31 66c7-1 13 0 20 3M69 47c7-3 13-4 20-3M69 58c7-3 13-4 20-3M60 36V20" />
      <path className="art__leaf" d="M60 25c-1-11 7-18 18-18 0 11-7 19-18 18z" />
    </>
  ),
}

export function AreaArt({ name }: { name: AreaArtName }): React.ReactElement {
  return (
    <svg className="art" viewBox="0 0 120 92" aria-hidden="true" focusable="false">
      {DRAWINGS[name]}
    </svg>
  )
}
