export interface SourceCitation {
  filename?: string | null;
  file_url?: string | null;
  page?: number | null;
  chunk_index?: number | null;
  content: string;
}
