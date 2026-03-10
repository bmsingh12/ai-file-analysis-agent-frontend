"use client";

import type { ChangeEventHandler, FormEventHandler } from "react";

interface AskSectionProps {
  question: string;
  loading: boolean;
  readyToAsk: boolean;
  onQuestionChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function AskSection({
  question,
  loading,
  readyToAsk,
  onQuestionChange,
  onSubmit,
}: AskSectionProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-fuchsia-950/20 backdrop-blur-sm">
      <div className="mb-5">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-fuchsia-300">Ask</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Query the uploaded content</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          value={question}
          onChange={onQuestionChange}
          placeholder="Ask a question about the uploaded file"
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-fuchsia-300"
        />
        <button
          type="submit"
          disabled={loading || !readyToAsk || !question.trim()}
          className="rounded-full bg-fuchsia-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-fuchsia-200 disabled:cursor-not-allowed disabled:bg-stone-600 disabled:text-stone-300"
        >
          {loading ? "Asking..." : "Ask question"}
        </button>
      </form>

      {!readyToAsk && (
        <p className="mt-4 text-sm text-stone-400">Upload a file first to enable questions.</p>
      )}
    </section>
  );
}
