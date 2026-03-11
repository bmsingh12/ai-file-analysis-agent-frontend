"use client";

import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { SourceCitation } from "@/app/lib/SourceCitation";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface DocumentViewerProps {
  source: SourceCitation | null;
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl: string;
}

function normalizeSnippet(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function DocumentViewer({
  source,
  isOpen,
  onClose,
  apiBaseUrl,
}: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);

  const fileUrl = useMemo(() => {
    if (!source?.file_url) return null;
    return `${apiBaseUrl.replace(/\/+$/, "")}${source.file_url}`;
  }, [apiBaseUrl, source]);

  const snippet = useMemo(() => {
    return source?.content ? normalizeSnippet(source.content) : "";
  }, [source]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-3xl transform flex-col border-l border-white/10 bg-slate-950 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
              Document Viewer
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {source?.filename ?? "Document"}
            </h2>
            <p className="mt-2 text-sm text-stone-300">
              {source?.page != null ? `Page ${source.page}` : "Page unknown"}
              {numPages ? ` • ${numPages} total pages` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-stone-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
          >
            Close
          </button>
        </div>

        {!source || !fileUrl ? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-stone-400">
            Select a source to preview the document.
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-6">
            <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Highlighted source snippet
              </div>
              <p className="whitespace-pre-wrap">{snippet}</p>
            </div>

            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={
                <div className="text-sm text-stone-400">Loading PDF…</div>
              }
              error={
                <div className="text-sm text-red-300">Failed to load PDF.</div>
              }
            >
              <Page
                pageNumber={source.page ?? 1}
                width={760}
                renderAnnotationLayer
                renderTextLayer
              />
            </Document>
          </div>
        )}
      </aside>
    </div>
  );
}
