import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { OrdoService } from './services/firebase';
import Registry from './pages/Registry';
import Dossier from './pages/Dossier';
import SideChoice from './pages/SideChoice';
import ResistanceRegistry from './pages/ResistanceRegistry';
import ResistanceDossier from './pages/ResistanceDossier';

const Layout: React.FC = () => {
  const location = useLocation();
  const isSideChoice = location.pathname === '/';
  const isResistance = location.pathname.startsWith('/resistance');

  // Conditional border styling
  let borderClass = 'border-ordo-border';
  if (isSideChoice) borderClass = 'border-gray-800';
  if (isResistance) borderClass = 'border-res-dim'; // Will be handled in CSS inside Resistance pages generally, but good to have fallback

  return (
    <div className={`min-h-screen flex flex-col overflow-hidden relative transition-colors duration-500 ${isResistance ? '' : `bg-ordo-bg bg-ordo-pattern text-ordo-gold font-body border-4 border-double ${borderClass} selection:bg-ordo-gold selection:text-black`}`}>
      {!isResistance && <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-50"></div>}
      <Routes>
        <Route path="/" element={<SideChoice />} />
        <Route path="/registry" element={<Registry />} />
        <Route path="/dossier/:id" element={<Dossier />} />
        <Route path="/resistance/registry" element={<ResistanceRegistry />} />
        <Route path="/resistance/dossier/:id" element={<ResistanceDossier />} />
      </Routes>
    </div>
  );
};

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
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-green-500 font-mono">
        <div className="animate-pulse text-2xl tracking-[5px]">ESTABLISHING SECURE CONNECTION...</div>
      </div>
    );
  }

  return (
    <Router>
      <Layout />
    </Router>
  );
};

export default App;
