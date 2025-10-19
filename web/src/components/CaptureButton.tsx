import React from 'react';

interface CaptureButtonProps {
  onCapture: () => void;
  disabled?: boolean;
}

export const CaptureButton: React.FC<CaptureButtonProps> = ({ onCapture, disabled }) => {
  return (
    <button
      className="capture-button"
      onClick={onCapture}
      disabled={disabled}
    >
      {disabled ? '👁️ Initializing...' : '📸 Capture & Print'}
    </button>
  );
};
