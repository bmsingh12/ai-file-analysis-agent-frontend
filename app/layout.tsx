import type { Metadata } from "next";
import "./ui/global.css";
import { inter } from '@/app/ui/fonts';

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
      <body className={`${inter.className} bg-stone-950 text-stone-100 antialiased`}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_32%),linear-gradient(180deg,_#111827_0%,_#020617_55%,_#000000_100%)]">
          <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-cyan-300">AI File Analysis</p>
                <h1 className="mt-2 text-2xl font-semibold text-white">Shared workspace for uploads and questions</h1>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
