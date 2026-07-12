"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#EADFCF] bg-[#FFFDF9] p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#4B1218]/10">
          <AlertTriangle className="h-7 w-7 text-[#8B2635]" />
        </div>

        <h2 className="font-serif text-xl font-bold text-[#1E1C1B]">
          Something went wrong
        </h2>

        <p className="mt-2 text-sm text-[#5C5651]">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>

        {error.digest && (
          <p className="mt-2 text-xs text-[#A69C90]">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4B1218] px-5 py-2.5 text-sm font-medium text-[#FAF7F2] shadow-sm transition-colors hover:bg-[#8B2635]"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <button
            onClick={() => router.refresh()}
            className="rounded-xl border border-[#EADFCF] bg-[#FAF7F2] px-5 py-2.5 text-sm font-medium text-[#5C5651] transition-colors hover:bg-[#EADFCF]"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
