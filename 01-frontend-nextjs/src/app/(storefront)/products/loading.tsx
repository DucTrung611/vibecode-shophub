import { Skeleton } from "@/shared/components/Skeleton";

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-6">
      <Skeleton className="mb-4 h-8 w-40" />
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[3/4] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
