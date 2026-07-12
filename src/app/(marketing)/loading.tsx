"use client";

import Spinner from "@/components/ui/Spinner";

export default function MarketingLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-[#5C5651]">Loading...</p>
      </div>
    </div>
  );
}
