import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import TargetCursor from "@/components/ui/TargetCursor";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "ClearAudit — AI-Powered Contract Intelligence Platform",
  description: "Stop losing revenue to buried contract terms. Automatically audit, track, and search your contract portfolio with deep semantic intelligence.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF7F2] text-[#1E1C1B] selection:bg-[#4B1218] selection:text-[#FAF7F2]">
        <TargetCursor />
        {children}
      </body>
    </html>
  );
}
