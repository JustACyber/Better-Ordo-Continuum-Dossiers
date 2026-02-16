import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrdoService } from '../services/firebase';
import { Character } from '../types';

const Registry: React.FC = () => {
  const [characters, setCharacters] = useState<Record<string, Character>>({});
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = OrdoService.subscribeAll((data) => {
      setCharacters(data);
    });
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const handleCreate = async () => {
    const name = prompt("ИНИЦИАЛИЗАЦИЯ НОВОГО ПРОТОКОЛА.\nВВЕДИТЕ ИДЕНТИФИКАТОР:");
    if (name && name.trim()) {
      try {
        const id = await OrdoService.create(name);
        navigate(`/dossier/${id}`);
      } catch (e) {
        alert("Creation failed: " + e);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    const conf = prompt(`ПОДТВЕРДИТЕ УДАЛЕНИЕ: ${name}\nВВЕДИТЕ "УДАЛИТЬ":`);
    if (conf === "УДАЛИТЬ") {
      await OrdoService.delete(id);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-[140px] flex flex-col justify-center items-center border-b-2 border-ordo-gold bg-[radial-gradient(circle_at_center,#1a0f0f_0%,#000_100%)] relative z-10 shadow-2xl shrink-0">
        <div className="absolute inset-0 flex justify-between items-center px-5 pointer-events-none">
          <span className="text-4xl text-ordo-crimson opacity-50">✠</span>
          <span className="text-4xl text-ordo-crimson opacity-50">✠</span>
        </div>
        <h1 className="font-header text-6xl tracking-[8px] font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#8a6e00] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
          ORDO CONTINUUM
        </h1>
        <div className="text-sm text-ordo-crimson tracking-[6px] mt-2 border-t border-ordo-crimson pt-1">
          PERSONNEL REGISTRY
        </div>
      </header>

      <main className="flex-1 p-10 overflow-y-auto relative">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-12 w-full max-w-[1600px] mx-auto pb-20">
          {Object.values(characters).map((char) => (
            <div
              key={char.id}
              onClick={() => navigate(`/dossier/${char.id}`)}
              className="bg-[rgba(14,12,12,0.9)] border border-ordo-gold-dim h-[500px] flex flex-col relative transition-all duration-400 cursor-pointer shadow-2xl hover:-translate-y-2 hover:border-ordo-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] group"
            >
              {/* Corner Accents */}
              <div className="absolute top-[-1px] left-[-1px] w-[15px] h-[15px] border-l-2 border-t-2 border-ordo-gold transition-all duration-300 group-hover:w-[30px] group-hover:h-[30px]"></div>
              <div className="absolute top-[-1px] right-[-1px] w-[15px] h-[15px] border-r-2 border-t-2 border-ordo-gold transition-all duration-300 group-hover:w-[30px] group-hover:h-[30px]"></div>
              <div className="absolute bottom-[-1px] left-[-1px] w-[15px] h-[15px] border-l-2 border-b-2 border-ordo-gold transition-all duration-300 group-hover:w-[30px] group-hover:h-[30px]"></div>
              <div className="absolute bottom-[-1px] right-[-1px] w-[15px] h-[15px] border-r-2 border-b-2 border-ordo-gold transition-all duration-300 group-hover:w-[30px] group-hover:h-[30px]"></div>

              <div 
                onClick={(e) => handleDelete(e, char.id, char.meta.name)}
                className="absolute top-4 right-4 w-9 h-9 bg-[rgba(0,0,0,0.8)] border border-ordo-crimson text-ordo-crimson text-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 hover:bg-ordo-crimson hover:text-black hover:shadow-[0_0_15px_#8a0000]"
              >
                ×
              </div>

              <div className="flex-1 overflow-hidden border-b-2 border-ordo-crimson bg-black">
                {char.meta.image ? (
                  <img src={char.meta.image} alt={char.meta.name} className="w-full h-full object-cover sepia-[0.4] brightness-75 transition-all duration-500 group-hover:sepia-0 group-hover:brightness-100 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#333]">NO IMAGE</div>
                )}
              </div>

              <div className="h-[90px] bg-[#080808] flex flex-col justify-center items-center border-t border-ordo-gold-dim">
                <div className="font-header text-2xl text-ordo-gold uppercase tracking-[3px] drop-shadow-md">{char.meta.name}</div>
                <div className="font-body text-base text-ordo-crimson tracking-widest italic mt-1">{char.meta.rank || 'Рекрут'}</div>
              </div>
            </div>
          ))}

          {/* New Protocol Card */}
          <div 
            onClick={handleCreate}
            className="bg-[rgba(255,255,255,0.01)] border-2 border-dashed border-ordo-gold-dim h-[500px] flex flex-col justify-center items-center cursor-pointer transition-all hover:bg-[rgba(212,175,55,0.05)] hover:border-solid hover:border-ordo-gold group"
          >
            <div className="text-[5rem] text-ordo-gold-dim mb-5 transition-transform duration-300 group-hover:text-ordo-gold group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_#d4af37]">+</div>
            <div className="text-ordo-gold tracking-[4px] font-bold font-header">НОВЫЙ ПРОТОКОЛ</div>
          </div>
        </div>
      </main>

      <footer className="h-[50px] border-t border-ordo-gold-dim flex justify-between items-center px-10 bg-[#050505] z-10 text-xs tracking-[2px] text-ordo-gold-dim font-header shrink-0">
        <div>{now.toISOString().split('T')[1].split('.')[0]} ULT</div>
        <div className="text-ordo-crimson">CONNECTION SECURE</div>
        <div>SYS.VER. 4.2.0 CLOUD</div>
      </footer>
    </div>
  );
};

export default Registry;
