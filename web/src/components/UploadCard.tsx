import React, { useState, useRef } from 'react';
import { uploadFile } from '../api';

interface UploadCardProps {
  onUploadSuccess: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
  const maxSizeMB = 25;

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPG, PNG, and HEIC images are allowed.';
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB.`;
    }

    return null;
  };

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadStatus({ type: 'error', message: validationError });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const response = await uploadFile(file);

      if (response.ok) {
        setUploadStatus({
          type: 'success',
          message: '✅ SOUL CAPTURED! Your cursed image is being summoned to the printer... 👹'
        });
        onUploadSuccess();

        // Clear success message after 3 seconds
        setTimeout(() => {
          setUploadStatus({ type: null, message: '' });
        }, 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card">
      <h2>🎃 CAPTURE YOUR SOUL 🎃</h2>

      <div
        className={`upload-area ${isDragging ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,7H13V13H11V7M11,15H13V17H11V15Z"/>
          </svg>
        </div>

        <div className="upload-text">
          {isUploading ? '💀 Sending to the void...' : '👻 Drop your cursed photo here'}
        </div>

        <div className="upload-hint">
          or summon file browser (JPG, PNG, HEIC up to {maxSizeMB}MB)
        </div>

        <button
          className="upload-button"
          disabled={isUploading}
          onClick={(e) => {
            e.stopPropagation();
            openFileDialog();
          }}
        >
          {isUploading ? '⚡ UPLOADING...' : '🔥 UNLEASH PHOTO'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.heic"
          onChange={handleFileSelect}
          className="hidden-input"
        />
      </div>

      {isUploading && (
        <div className="upload-progress">
          <div className="progress-text">⚡ Channeling dark energies... Printing from the shadows... 🔮</div>
        </div>
      )}

      {uploadStatus.type === 'success' && (
        <div className="success-message">
          {uploadStatus.message}
        </div>
      )}

      {uploadStatus.type === 'error' && (
        <div className="error-message">
          {uploadStatus.message}
        </div>
      )}
    </div>
  );
};