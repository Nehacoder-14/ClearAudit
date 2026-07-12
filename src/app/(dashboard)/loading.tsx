"use client";

import Skeleton from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="text" className="h-4 w-72" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#EADFCF] bg-[#FFFDF9] p-5 space-y-3"
          >
            <Skeleton variant="text" className="h-3 w-20" />
            <Skeleton variant="text" className="h-7 w-16" />
            <Skeleton variant="text" className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-[#EADFCF] bg-[#FFFDF9] p-5 space-y-4">
          <Skeleton variant="text" className="h-5 w-36" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton variant="circular" className="h-10 w-10 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="h-4 w-full" />
                <Skeleton variant="text" className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-[#EADFCF] bg-[#FFFDF9] p-5 space-y-4">
          <Skeleton variant="text" className="h-5 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" className="h-4 w-full" />
              <Skeleton variant="text" className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
