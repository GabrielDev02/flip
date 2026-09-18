function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-container-high ${className}`} />;
}

export function HomeSkeleton() {
  return (
    <div className="flex flex-col space-y-5">
      {/* Hero card */}
      <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <Block className="h-4 w-28" />
          <Block className="h-8 w-8 rounded-full" />
        </div>
        <Block className="h-10 w-48" />
        <Block className="h-7 w-40 rounded-full" />
        <div className="grid grid-cols-4 gap-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Block className="h-11 w-11 rounded-full" />
              <Block className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Accounts scroll */}
      <div className="space-y-3">
        <Block className="h-5 w-44" />
        <div className="flex gap-3 -mx-margin px-margin overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm min-w-[155px] flex items-center gap-3 shrink-0"
            >
              <Block className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex flex-col gap-2 min-w-0 flex-1">
                <Block className="h-3 w-16" />
                <Block className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="space-y-3">
        <Block className="h-5 w-40" />
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Block className="h-11 w-11 rounded-full shrink-0" />
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <Block className="h-4 w-32" />
                  <Block className="h-3 w-14" />
                </div>
              </div>
              <Block className="h-4 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
