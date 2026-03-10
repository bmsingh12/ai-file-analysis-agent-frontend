"use client";

import { useState, ChangeEvent } from "react";
import type { SubmitEventHandler } from 'react';

import { AskSection } from "@/src/components/AskSection";
import { FileUploadSection } from "@/src/components/FileUploadSection";
import { uploadFile, askQuestion } from "../src/utils/api";
import { UploadResponse } from "./lib/UploadResponse";
import { AskResponse } from "./lib/AskResponse";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
    setUploadedFile(null);
    setAnswer(null);
    setError(null);
  };

  const handleUpload: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: UploadResponse = await uploadFile(file);
      setUploadedFile(response);
    } catch (err: unknown) {
      console.error("Upload error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAsk: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }
    if (!uploadedFile) {
      setError("No file uploaded yet.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response: AskResponse = await askQuestion(question);
      setAnswer(response.answer);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <FileUploadSection
          file={file}
          uploadedFile={uploadedFile}
          loading={loading}
          onFileChange={handleFileChange}
          onSubmit={handleUpload}
        />
        <AskSection
          question={question}
          loading={loading}
          readyToAsk={Boolean(uploadedFile)}
          onQuestionChange={(event) => setQuestion(event.target.value)}
          onSubmit={handleAsk}
        />
      </section>

      {(loading || error || answer) && (
        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
          {loading && <p className="text-sm text-cyan-200">Processing request...</p>}
          {error && <p className="text-sm text-rose-300">{error}</p>}
          {answer && (
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-300">Answer</p>
              <p className="text-base leading-7 text-stone-100">{answer}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
