import React, { useState, useEffect } from 'react';

export const QRCode: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Get the current URL
    const url = window.location.origin;
    setCurrentUrl(url);
  }, []);

  // Simple QR code generation using a free service
  const qrCodeUrl = currentUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`
    : '';

  return (
    <div className="card qr-section">
      <h2>⛓️ ENTER THE DARKNESS ⛓️</h2>

      <p style={{ marginBottom: '1rem', color: '#999', textShadow: '0 0 5px rgba(255, 0, 0, 0.3)' }}>
        📱 Scan this cursed QR code to summon Spawn's Photo Booth on your device:
      </p>

      {qrCodeUrl && (
        <div className="qr-code">
          <img
            src={qrCodeUrl}
            alt="QR Code for Spawn's Photo Booth"
            style={{ display: 'block' }}
            onError={(e) => {
              // Hide QR code if it fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      <p style={{ fontSize: '0.9rem', color: '#00ff00', textShadow: '0 0 5px rgba(0, 255, 0, 0.5)' }}>
        🔗 {currentUrl || 'http://spawn-booth.local'}
      </p>

      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#888' }}>
        ⚠️ Your device must be connected to the same WiFi network to enter Spawn's realm
      </div>
    </div>
  );
};