import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { CameraBooth } from './components/CameraBooth';
import { UploadCard } from './components/UploadCard';
import { FileList } from './components/FileList';
import { QRCode } from './components/QRCode';
import { Footer } from './components/Footer';
import './styles.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    setHasCamera(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  }, []);

  const handleUploadSuccess = () => setRefreshTrigger(prev => prev + 1);

  return (
    <div className="app">
      <Header />

      <main className="main">
        <div className="grid">
          {hasCamera ? (
            <CameraBooth onUploadSuccess={handleUploadSuccess} />
          ) : (
            <UploadCard onUploadSuccess={handleUploadSuccess} />
          )}
          <FileList refreshTrigger={refreshTrigger} />
          <QRCode />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
