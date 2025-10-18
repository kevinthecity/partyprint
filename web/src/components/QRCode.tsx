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
      <h2>Share PartyPrint</h2>

      <p style={{ marginBottom: '1rem', color: '#666' }}>
        Scan this QR code to access PartyPrint from your phone:
      </p>

      {qrCodeUrl && (
        <div className="qr-code">
          <img
            src={qrCodeUrl}
            alt="QR Code for PartyPrint"
            style={{ display: 'block' }}
            onError={(e) => {
              // Hide QR code if it fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      <p style={{ fontSize: '0.9rem', color: '#888' }}>
        {currentUrl || 'http://partyprint.local'}
      </p>

      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#aaa' }}>
        Make sure you're connected to the same WiFi network
      </div>
    </div>
  );
};