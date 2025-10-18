export interface PrinterInfo {
  name: string;
  isDefault: boolean;
}

export interface FileInfo {
  name: string;
  url: string;
  size: number;
  created: string;
}

export interface UploadResponse {
  ok: boolean;
  file: FileInfo;
  jobId?: string;
}

export interface HealthResponse {
  status: string;
}