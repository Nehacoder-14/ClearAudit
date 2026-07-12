export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#4B1218] flex items-center justify-center text-[#FAF7F2] font-serif font-bold text-xl shadow-md">
              C
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1E1C1B]">
              Clear<span className="text-[#8B2635]">Audit</span>
            </span>
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
