import React from 'react';

export const CameraOverlay: React.FC = () => (
  <div className="camera-overlay">
    <div className="glow-ring" />
    <div className="corner top-left" />
    <div className="corner top-right" />
    <div className="corner bottom-left" />
    <div className="corner bottom-right" />
  </div>
);
