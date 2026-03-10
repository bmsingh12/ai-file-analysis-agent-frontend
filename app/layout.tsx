import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI File Analysis",
  description: "Upload files and ask questions about their contents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-stone-950 text-stone-100 antialiased`}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_32%),linear-gradient(180deg,_#111827_0%,_#020617_55%,_#000000_100%)]">
          <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-cyan-300">AI File Analysis</p>
                <h1 className="mt-2 text-2xl font-semibold text-white">Shared workspace for uploads and questions</h1>
              </div>
              {/* <p className="max-w-xs text-right text-sm text-stone-400">
                Layout state stays mounted across route changes while shared UI remains interactive.
              </p> */}
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
