import { useState } from 'react';
import { Header } from './components/Header';
import { UploadCard } from './components/UploadCard';
import { FileList } from './components/FileList';
import { QRCode } from './components/QRCode';
import { Footer } from './components/Footer';
import './styles.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger a refresh of the file list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app">
      <Header />

      <main className="main">
        <div className="grid">
          <UploadCard onUploadSuccess={handleUploadSuccess} />
          <FileList refreshTrigger={refreshTrigger} />
          <QRCode />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;