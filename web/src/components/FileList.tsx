import React, { useState, useEffect } from 'react';
import { getFiles, printFile } from '../api';
import { FileInfo } from '../types';

interface FileListProps {
  refreshTrigger: number;
}

export const FileList: React.FC<FileListProps> = ({ refreshTrigger }) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [printingFiles, setPrintingFiles] = useState<Set<string>>(new Set());

  const loadFiles = async () => {
    setLoading(true);
    try {
      const fileList = await getFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  const handlePrint = async (fileName: string) => {
    setPrintingFiles(prev => new Set(prev).add(fileName));

    try {
      await printFile(fileName);
      // Show success feedback briefly
      setTimeout(() => {
        setPrintingFiles(prev => {
          const next = new Set(prev);
          next.delete(fileName);
          return next;
        });
      }, 2000);
    } catch (error) {
      console.error('Print failed:', error);
      setPrintingFiles(prev => {
        const next = new Set(prev);
        next.delete(fileName);
        return next;
      });
      alert(`Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const openFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="card">
        <h2>💀 SOULS COLLECTED 💀</h2>
        <div className="empty-state">🔮 Summoning your images from the void...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>💀 SOULS COLLECTED 💀</h2>

      {files.length === 0 ? (
        <div className="empty-state">
          👻 The void is empty... No souls have been captured yet. Be the first!
        </div>
      ) : (
        <div className="file-list">
          {files.map((file) => (
            <div
              key={file.name}
              className="file-item"
              onClick={() => openFile(file.url)}
            >
              <img
                src={file.url}
                alt={file.name}
                className="file-thumbnail"
                onError={(e) => {
                  // Fallback for images that fail to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />

              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-meta">
                  {formatFileSize(file.size)} • {formatDate(file.created)}
                </div>
              </div>

              <button
                className="print-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrint(file.name);
                }}
                disabled={printingFiles.has(file.name)}
              >
                {printingFiles.has(file.name) ? '⚡ Summoning...' : '🔥 Print Again'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};