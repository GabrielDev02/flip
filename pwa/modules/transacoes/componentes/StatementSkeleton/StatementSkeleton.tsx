import { SkeletonBlock } from "@/pwa/shared/componentes/SkeletonBlock/SkeletonBlock";

export function StatementSkeleton() {
  return (
    <div className="space-y-4 pt-1">
      {Array.from({ length: 2 }).map((_, group) => (
        <div key={group} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="h-4 w-16" />
          </div>
          {Array.from({ length: 3 }).map((_, item) => (
            <div
              key={item}
              className="bg-surface-container-lowest rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_2px_8px_rgba(26,26,26,0.02)]"
            >
              <SkeletonBlock className="w-11 h-11 rounded-2xl" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-3 w-44" />
              </div>
              <SkeletonBlock className="h-4 w-16" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
