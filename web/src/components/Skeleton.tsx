"use client";

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-stone-100 animate-pulse">
      <div className="h-4 bg-stone-200 rounded-full w-1/3 mb-6" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="mb-4">
          <div className="h-3 bg-stone-100 rounded-full w-1/4 mb-2" />
          <div className="h-4 bg-stone-200 rounded-full w-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex justify-between items-center py-4 border-b border-stone-100 last:border-0 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-stone-200" />
        <div className="h-4 bg-stone-200 rounded-full w-32" />
      </div>
      <div className="h-4 bg-stone-200 rounded-full w-20" />
    </div>
  );
}
