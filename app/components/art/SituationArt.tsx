export type SituationArtName = 'plate' | 'tangle' | 'sprout' | 'path' | 'rain'

// Open paths are drawn as lines; `art__leaf` paths are filled leaves.
const DRAWINGS: Record<SituationArtName, React.ReactElement> = {
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
  // A rain cloud with a leaf growing beneath it.
  rain: (
    <>
      <path d="M33 50a14 14 0 0 1 3-27 20 20 0 0 1 37-3 16 16 0 0 1 17 24c-3 4-8 6-13 6H40c-3 0-5 0-7 0M44 60l-3 8M60 60l-3 8M76 60l-3 8" />
      <path className="art__leaf" d="M60 84c-1-9 6-14 15-14 0 9-6 15-15 14z" />
      <path d="M57 87l12-12" />
    </>
  ),
}

export function SituationArt({ name }: { name: SituationArtName }): React.ReactElement {
  return (
    <svg className="art" viewBox="0 0 120 92" aria-hidden="true" focusable="false">
      {DRAWINGS[name]}
    </svg>
  )
}
