import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#EADFCF] bg-[#FFFDF9] p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#4B1218]/10">
          <FileQuestion className="h-7 w-7 text-[#8B2635]" />
        </div>

        <p className="font-serif text-6xl font-bold text-[#4B1218]">404</p>

        <h2 className="mt-2 font-serif text-xl font-bold text-[#1E1C1B]">
          Page not found
        </h2>

        <p className="mt-2 text-sm text-[#5C5651]">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#4B1218] px-5 py-2.5 text-sm font-medium text-[#FAF7F2] shadow-sm transition-colors hover:bg-[#8B2635]"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
