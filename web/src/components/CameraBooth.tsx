import React, { useEffect, useRef, useState } from 'react';
import { uploadFile } from '../api';
import { UploadProgress } from './UploadProgress';
import { CaptureButton } from './CaptureButton';
import { CameraOverlay } from './CameraOverlay';



export const CameraBooth: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsReady(true);
      } catch (err) {
        setError('Camera access denied or unavailable');
      }
    }
    initCamera();
  }, []);

  const capture = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const blob = await new Promise<Blob>(r => canvas.toBlob(b => r(b!), 'image/jpeg', 0.9));
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });

    setIsUploading(true);
    try {
      await uploadFile(file);
    } catch (err) {
      setError('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="camera-booth">
      {error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="camera-preview" />
          <CameraOverlay />
          {isUploading ? (
            <UploadProgress />
          ) : (
            <CaptureButton disabled={!isReady} onCapture={capture} />
          )}
        </>
      )}
    </div>
  );
};
