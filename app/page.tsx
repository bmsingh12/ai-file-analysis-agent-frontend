"use client";

import { useState, ChangeEvent } from "react";
import type { SubmitEventHandler } from 'react';

import { uploadFile, askQuestion, UploadResponse, AskResponse } from "../src/utils/api";

export default function HomePage() {
  // --- State ---
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Handlers ---
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

  // --- Render ---
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI File Analysis</h1>

      {/* Upload Section */}
      <form onSubmit={handleUpload} className="mb-6">
        <input type="file" onChange={handleFileChange} />
        <button
          type="submit"
          disabled={loading || !file}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Upload
        </button>
      </form>

      {uploadedFile && (
        <div className="mb-4 text-green-700">
          Uploaded: {uploadedFile.filename} ({uploadedFile.chunks_created} chunks)
        </div>
      )}

      {/* Ask Section */}
      <form onSubmit={handleAsk} className="mb-6">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the uploaded file"
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          disabled={loading || !uploadedFile || !question.trim()}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Ask
        </button>
      </form>

      {/* Loading / Error / Answer */}
      {loading && <div className="mb-2 text-gray-600">Processing...</div>}
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {answer && (
        <div className="p-4 bg-gray-400 rounded border">
          <strong>Answer:</strong> {answer}
        </div>
      )}
    </div>
  );
}
