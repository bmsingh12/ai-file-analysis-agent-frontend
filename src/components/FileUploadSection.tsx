"use client";

import type { ChangeEventHandler, FormEventHandler } from "react";

import type { UploadResponse } from "@/src/utils/api";

interface FileUploadSectionProps {
  file: File | null;
  uploadedFile: UploadResponse | null;
  loading: boolean;
  onFileChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function FileUploadSection({
  file,
  uploadedFile,
  loading,
  onFileChange,
  onSubmit,
}: FileUploadSectionProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-sm">
      <div className="mb-5">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">Upload</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Choose a file to analyze</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="file"
          onChange={onFileChange}
          className="block w-full rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-3 text-sm text-stone-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:file:bg-cyan-300 cursor-pointer"
        />
        <button
          type="submit"
          disabled={loading || !file}
          className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-stone-600 disabled:text-stone-300 cursor-pointer"
        >
          {loading ? "Uploading..." : "Upload file"}
        </button>
      </form>

      {uploadedFile && (
        <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          Uploaded <span className="font-semibold text-white">{uploadedFile.filename}</span> with {uploadedFile.chunks_created} chunks.
        </div>
      )}
    </section>
  );
}
