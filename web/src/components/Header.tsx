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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 8H17V3H7V8H5C3.34 8 2 9.34 2 11V17H6V21H18V17H22V11C22 9.34 20.66 8 19 8ZM9 5H15V8H9V5ZM16 19H8V14H16V19ZM18 15H20V11C20 10.45 19.55 10 19 10H5C4.45 10 4 10.45 4 11V15H6V12H18V15Z"/>
          </svg>
          PartyPrint
        </div>

        <div className="printer-status">
          <div className={`status-dot ${isHealthy === false ? 'error' : ''}`}></div>
          {isHealthy === null ? (
            'Checking printer...'
          ) : isHealthy ? (
            activePrinter ? `Ready: ${activePrinter}` : 'Server ready'
          ) : (
            'Printer unavailable'
          )}
        </div>
      </div>
    </header>
  );
};