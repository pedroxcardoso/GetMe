/// <reference types="vite/client" />

export type Provider = "youtube" | "x" | "instagram" | "tiktok";
export type OutputFormat = "mp4" | "mp3";
export type Resolution = "2160" | "1080" | "720" | "480";
export type ColorTheme = "light" | "dark";

export interface ToolStatus {
  available: boolean;
  version: string | null;
  path: string | null;
  source: "configurado" | "encontrado" | "não encontrado";
}

export interface Capabilities {
  ytDlp: ToolStatus;
  ffmpeg: ToolStatus;
  downloadPath: string;
}

export interface AppSettings {
  downloadPath: string;
  openAfterDownload: boolean;
  theme: ColorTheme;
  toolPaths: {
    ytDlp: string;
    ffmpeg: string;
  };
}

export interface DownloadRequest {
  url: string;
  provider: Provider;
  format: OutputFormat;
  resolution: Resolution;
}

export interface DownloadEvent {
  id: string;
  provider: Provider;
  format: OutputFormat;
  status: "starting" | "downloading" | "done" | "error" | "cancelled";
  title: string;
  filePath: string | null;
  percent: number | null;
  speed: string;
  eta: string;
  message: string;
}

export interface HistoryEntry {
  id: string;
  provider: Provider;
  format: OutputFormat;
  title: string;
  filePath: string | null;
  destination: string;
  createdAt: string;
}

declare global {
  interface Window {
    getme: {
      readSettings(): Promise<AppSettings>;
      saveSettings(patch: Partial<AppSettings>): Promise<AppSettings>;
      inspectTools(): Promise<Capabilities>;
      chooseDownloadFolder(): Promise<string | null>;
      chooseToolPath(tool: "ytDlp" | "ffmpeg"): Promise<string | null>;
      openSetupPage(tool: "ytDlp" | "ffmpeg"): Promise<void>;
      readClipboard(): Promise<string>;
      startDownload(request: DownloadRequest): Promise<string>;
      cancelDownload(id: string): Promise<void>;
      onDownloadEvent(callback: (event: DownloadEvent) => void): () => void;
      listHistory(): Promise<HistoryEntry[]>;
      removeHistoryEntry(id: string): Promise<void>;
      openFile(path: string): Promise<void>;
      revealFile(path: string): Promise<void>;
    };
  }
}

export {};
