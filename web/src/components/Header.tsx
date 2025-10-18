import React, { useState, useEffect } from 'react';
import { checkHealth, getPrinters } from '../api';
import { PrinterInfo } from '../types';

export const Header: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [, setPrinters] = useState<PrinterInfo[]>([]);
  const [activePrinter, setActivePrinter] = useState<string>('');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await checkHealth();
        setIsHealthy(true);

        const printerList = await getPrinters();
        setPrinters(printerList);

        const defaultPrinter = printerList.find(p => p.isDefault);
        if (defaultPrinter) {
          setActivePrinter(defaultPrinter.name);
        } else if (printerList.length > 0) {
          setActivePrinter(printerList[0].name);
        }
      } catch (error) {
        console.error('Health check failed:', error);
        setIsHealthy(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 4V13c0 4.52-2.98 8.69-7 9.93-4.02-1.24-7-5.41-7-9.93V8.18l6-3zM10 9v2h4V9h-2zm0 4v2h4v-2h-2z"/>
          </svg>
          SPAWN'S HELLISH PHOTO BOOTH
        </div>

        <div className="printer-status">
          <div className={`status-dot ${isHealthy === false ? 'error' : ''}`}></div>
          {isHealthy === null ? (
            '🔮 Summoning printer...'
          ) : isHealthy ? (
            activePrinter ? `👹 READY TO PRINT: ${activePrinter}` : '💀 Server awakened'
          ) : (
            '⚠️ Printer in the shadows'
          )}
        </div>
      </div>
    </header>
  );
};