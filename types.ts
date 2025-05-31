
export interface PlaceholderRule {
  id: string;
  start: string;
  end: string;
}

export interface UploadedDocxFile {
  id: string;
  file: File;
  // arrayBuffer might be loaded on demand to save memory
}

export interface ExtractedPlaceholder {
  name: string; // The content between delimiters, e.g., "username" for "[username]"
}

export type ReplacementValues = Record<string, string>; // e.g. { "username": "JohnDoe" }

export enum AppState {
  IDLE,
  LOADING_FILES,
  EXTRACTING_PLACEHOLDERS,
  PROCESSING_FILES,
}
