interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={["animate-pulse rounded-lg bg-neutral-100", className ?? "h-4 w-full"].join(" ")}
      aria-hidden="true"
    />
  );
}
