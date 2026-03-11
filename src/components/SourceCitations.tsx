"use client";

import { useState } from "react";
import type { SourceCitation } from "@/app/lib/SourceCitation";

interface SourceCitationsProps {
  sources?: SourceCitation[] | null;
}

function truncateSource(content: string, maxLength = 180): string {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

export function SourceCitations({ sources }: SourceCitationsProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 text-left cursor-pointer"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Sources
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-stone-400">
            {sources.length} {sources.length === 1 ? "item" : "items"}
          </span>

          <svg
            className={`h-4 w-4 text-cyan-300 transition-transform duration-300 ease-in-out ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.512a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen
            ? "mt-3 grid-rows-[1fr] opacity-100"
            : "mt-0 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3">
            {sources.map((source, index) => (
              <div
                key={`${source.filename ?? "unknown"}-${
                  source.chunk_index ?? index
                }`}
                className="rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-stone-300"
              >
                <div className="mb-2 flex flex-wrap gap-2 text-[11px] text-cyan-200">
                  <span>{source.filename ?? "Unknown file"}</span>

                  {source.page !== null && source.page !== undefined ? (
                    <span>Page {source.page}</span>
                  ) : null}

                  {source.chunk_index !== null &&
                  source.chunk_index !== undefined ? (
                    <span>Chunk {source.chunk_index}</span>
                  ) : null}
                </div>

                <p className="whitespace-pre-wrap text-stone-300">
                  {truncateSource(source.content)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}