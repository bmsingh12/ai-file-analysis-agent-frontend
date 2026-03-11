"use client";

import { UploadResponse } from "@/app/lib/UploadResponse";
import type { ChangeEventHandler, FormEventHandler } from "react";

interface FileUploadSectionProps {
  file: File | null;
  uploadedFile: UploadResponse | null;
  loading: boolean;
  sessionId: string | null;
  loadingSession: boolean;
  error: string | null;
  onFileChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function FileUploadSection({
  file,
  uploadedFile,
  loading,
  sessionId,
  loadingSession,
  error,
  onFileChange,
  onSubmit,
}: FileUploadSectionProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-sm">
      <div className="mb-5">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Upload
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Choose a file to analyze
        </h2>
        <p className="mt-2 text-sm text-stone-300">
          Start a session, upload a document, then ask follow-up questions.
        </p>
      </div>

      <div className="mb-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-cyan-300">
          Session
        </p>
        <p className="mt-2 text-sm text-stone-200">
          {loadingSession
            ? "Creating session..."
            : sessionId
              ? `Ready: ${sessionId.slice(0, 8)}...`
              : "No session"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="file"
          onChange={onFileChange}
          className="block w-full cursor-pointer rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-3 text-sm text-stone-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:file:bg-cyan-300"
        />

        <button
          type="submit"
          disabled={loading || !file}
          className="cursor-pointer rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-stone-600 disabled:text-stone-300"
        >
          {loading ? "Uploading..." : "Upload file"}
        </button>
      </form>

      <div
        className={
          uploadedFile
            ? "mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
            : "mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
        }
      >
        <p
          className={
            uploadedFile
              ? "text-sm font-medium uppercase tracking-wide text-emerald-300"
              : "text-xs font-medium uppercase tracking-wide text-cyan-300"
          }
        >
          Uploaded File
        </p>
        <p className="mt-2 text-sm text-stone-200">
          {uploadedFile ? (
            <span>
              Uploaded{" "}
              <span className="font-semibold text-white">
                {uploadedFile.filename}
              </span>{" "}
              with {uploadedFile.chunks_created} chunks.
            </span>
          ) : (
            "No file uploaded yet"
          )}
        </p>
      </div>

      {/* {uploadedFile && (
        <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          Uploaded{" "}
          <span className="font-semibold text-white">
            {uploadedFile.filename}
          </span>{" "}
          with {uploadedFile.chunks_created} chunks.
        </div>
      )} */}

      {error && (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
    </section>
  );
}
