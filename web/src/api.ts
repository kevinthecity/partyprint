import { PrinterInfo, FileInfo, UploadResponse, HealthResponse } from './types';

const API_BASE = import.meta.env.DEV ? 'http://192.168.4.120:8000' : '';

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
}

export async function getPrinters(): Promise<PrinterInfo[]> {
  const response = await fetch(`${API_BASE}/printers`);
  if (!response.ok) {
    throw new Error('Failed to get printers');
  }
  return response.json();
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
}

export async function printFile(path: string): Promise<{ ok: boolean; jobId?: string }> {
  const response = await fetch(`${API_BASE}/print`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Print failed');
  }

  return response.json();
}

export async function getFiles(): Promise<FileInfo[]> {
  const response = await fetch(`${API_BASE}/files`);
  if (!response.ok) {
    throw new Error('Failed to get files');
  }
  return response.json();
}