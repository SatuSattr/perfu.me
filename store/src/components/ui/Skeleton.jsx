export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-[#f0f0f0] rounded ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white border border-[#e6e6e6] rounded-2xl overflow-hidden">
      <Skeleton className="h-56 lg:h-64 w-full" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-10 w-full mt-auto" />
      </div>
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="aspect-square rounded-2xl w-full" />
      <div className="flex gap-2 justify-center">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <Skeleton className="w-16 h-16 rounded-xl" />
        <Skeleton className="w-16 h-16 rounded-xl" />
      </div>
    </div>
  );
}
