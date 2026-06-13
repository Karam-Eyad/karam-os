// Shown instantly while any (app) page loads its data.
// Prevents the "blank flash" between navigation.
export default function Loading() {
  return (
    <div className="animate-pulse py-8">
      {/* Page header skeleton */}
      <div className="mb-7 flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded-md bg-surface-2" />
          <div className="h-7 w-44 rounded-lg bg-surface-2" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-surface-2" />
      </div>

      {/* Filter pills skeleton */}
      <div className="mb-5 flex gap-2">
        {[80, 60, 72, 64].map((w, i) => (
          <div
            key={i}
            className="h-8 rounded-lg bg-surface-2"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Card list skeleton */}
      <div className="space-y-3">
        {[1, 0.85, 0.7, 0.9, 0.6].map((opacity, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3.5"
            style={{ opacity }}
          >
            <div className="h-5 w-5 shrink-0 rounded-full bg-surface-2" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-3/5 rounded bg-surface-2" />
              <div className="h-2.5 w-1/4 rounded bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
