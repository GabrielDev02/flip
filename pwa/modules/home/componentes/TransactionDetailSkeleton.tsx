function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-container-high ${className}`} />;
}

export function TransactionDetailSkeleton() {
  return (
    <div className="font-pwa bg-surface min-h-screen flex flex-col">
      <nav className="w-full px-5 py-3 flex items-center justify-between">
        <Block className="w-10 h-10 rounded-full" />
        <Block className="h-4 w-36" />
        <div className="w-10 h-10" />
      </nav>

      <main className="flex-1 px-5 pb-10 flex flex-col gap-5">
        <section className="flex flex-col items-center text-center pt-3 gap-3">
          <Block className="w-16 h-16 rounded-full" />
          <Block className="h-5 w-40" />
          <Block className="h-8 w-28" />
          <Block className="h-3 w-36" />
          <Block className="h-6 w-24 rounded-full" />
        </section>

        <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Block className="h-3 w-24" />
              <Block className="h-3 w-28" />
            </div>
          ))}
        </section>

        <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Block className="h-9 w-9 rounded-xl shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <Block className="h-3 w-32" />
              <Block className="h-3 w-24" />
            </div>
          </div>
          <Block className="h-6 w-11 rounded-full shrink-0" />
        </section>

        <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3">
          <Block className="h-3 w-16" />
          <Block className="h-16 w-full rounded-xl" />
        </section>
      </main>
    </div>
  );
}
