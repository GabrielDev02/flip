import { SkeletonBlock } from "@/pwa/shared/componentes/SkeletonBlock/SkeletonBlock";

export function BudgetsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonBlock className="h-56 rounded-3xl" />
      <SkeletonBlock className="h-6 w-32" />
      {[0, 1, 2].map((index) => (
        <SkeletonBlock key={index} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}
