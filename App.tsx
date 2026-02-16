import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { OrdoService } from './services/firebase';
import Registry from './pages/Registry';
import Dossier from './pages/Dossier';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrdoService.init()
      .then(() => setLoading(false))
      .catch((err) => {
        console.error("Auth Failed", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-ordo-bg flex flex-col items-center justify-center z-50 text-ordo-gold font-header">
        <div className="animate-pulse text-2xl tracking-[5px]">CONNECTING TO CLOUD...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-ordo-bg bg-ordo-pattern text-ordo-gold font-body border-4 border-double border-ordo-border flex flex-col overflow-hidden relative selection:bg-ordo-gold selection:text-black">
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-50"></div>
        <Routes>
          <Route path="/" element={<Registry />} />
          <Route path="/dossier/:id" element={<Dossier />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
