import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// --- HELPER COMPONENTS ---

const CrackSVG = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 200 200" className={className} style={style}>
      <defs>
          <filter id="shatterglow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
      </defs>
      {/* Central Impact Hole */}
      <path d="M85,90 L100,80 L115,95 L110,110 L90,115 L80,100 Z" fill="rgba(0,0,0,0.9)" stroke="rgba(200,255,200,0.9)" strokeWidth="2" />
      
      {/* Spiderweb Cracks */}
      <g stroke="rgba(200,255,200,0.7)" strokeWidth="1.5" fill="none" filter="url(#shatterglow)">
        {/* Main Radials */}
        <path d="M100,80 L100,20" />
        <path d="M115,95 L170,120" />
        <path d="M110,110 L140,180" />
        <path d="M90,115 L40,160" />
        <path d="M80,100 L20,80" />
        <path d="M85,90 L40,30" />
        
        {/* Concentric / Jagged connections */}
        <path d="M95,60 L120,70 L130,100 L110,130 L70,120 L60,90 Z" opacity="0.6" />
        <path d="M110,40 L150,80 L150,140 L100,160 L40,120 L50,50 Z" strokeDasharray="5,5" opacity="0.4" />
      </g>
  </svg>
);

const GlassShards = ({ x, y }: { x: number, y: number }) => {
    // Generate random shards
    const shards = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 100, // Spread X
        r: Math.random() * 360, // Rotation
        s: 0.5 + Math.random(), // Size scale
        d: Math.random() * 0.5 // Delay
    }));

    return (
        <div className="absolute pointer-events-none z-50" style={{ left: x, top: y, width: 0, height: 0 }}>
            {shards.map(s => (
                <div 
                    key={s.id}
                    className="absolute bg-[#afffaf] opacity-80"
                    style={{
                        width: `${8 * s.s}px`,
                        height: `${12 * s.s}px`,
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        animation: `fall 0.8s ease-in forwards`,
                        animationDelay: `${s.d * 0.1}s`,
                        transformOrigin: 'center'
                    }}
                >
                    <style>{`
                        @keyframes fall {
                            0% { transform: translate(0, 0) rotate(${s.r}deg); opacity: 0.8; }
                            100% { transform: translate(${s.dx}px, ${300 + Math.random() * 200}px) rotate(${s.r + 180}deg); opacity: 0; }
                        }
                    `}</style>
                </div>
            ))}
        </div>
    )
};

const SideChoice: React.FC = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoverSide, setHoverSide] = useState<'resistance' | 'empire' | null>(null);
  const [selection, setSelection] = useState<'resistance' | 'empire' | null>(null);
  
  // Resistance Animation States
  const [impactStage, setImpactStage] = useState(0); 
  const [isShaking, setIsShaking] = useState(false);
  // Store coordinates for shards relative to the Resistance container
  const [shardSpawns, setShardSpawns] = useState<{id: number, x: string, y: string}[]>([]);
  
  // Empire Animation States
  const [isEmpireActive, setIsEmpireActive] = useState(false);
  const [waveRadius, setWaveRadius] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setMousePos({ x: clientX, y: clientY });

    if (!selection && containerRef.current) {
      const width = containerRef.current.clientWidth;
      setHoverSide(clientX < width / 2 ? 'resistance' : 'empire');
    }
  };

  const handleResistanceClick = () => {
    if (selection) return;
    setSelection('resistance');
    
    // Impact Sequence
    const sequence = async () => {
        // Shot 1
        await new Promise(r => setTimeout(r, 400));
        setImpactStage(1);
        setIsShaking(true);
        setShardSpawns(prev => [...prev, { id: 1, x: '15%', y: '15%' }]); // Match Shot 1 coords
        setTimeout(() => setIsShaking(false), 100);

        // Shot 2
        await new Promise(r => setTimeout(r, 400));
        setImpactStage(2);
        setIsShaking(true);
        setShardSpawns(prev => [...prev, { id: 2, x: '70%', y: '70%' }]); // Match Shot 2 coords
        setTimeout(() => setIsShaking(false), 100);

        // Shot 3 (Final)
        await new Promise(r => setTimeout(r, 300));
        setImpactStage(3);
        setIsShaking(true);
        setShardSpawns(prev => [...prev, { id: 3, x: '40%', y: '40%' }]); // Match Shot 3 coords
        setTimeout(() => setIsShaking(false), 100);

        setTimeout(() => {
            navigate('/resistance/registry');
        }, 1200);
    };
    sequence();
  };

  const handleEmpireClick = () => {
    if (selection) return;
    setSelection('empire');
    setIsEmpireActive(true);
    
    setTimeout(() => {
        navigate('/registry');
    }, 2000); 
  };

  // Wave Animation Loop
  useEffect(() => {
    if (isEmpireActive) {
        const startTime = performance.now();
        const duration = 2000; 
        const startRadius = 0;
        const endRadius = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);

        const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            setWaveRadius(startRadius + (endRadius - startRadius) * ease);

            if (progress < 1) {
                requestRef.current = requestAnimationFrame(animate);
            }
        };
        requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isEmpireActive]);

  // Logic to calculate relative mouse X for the Empire container
  const empireContainerOffset = selection === 'empire' ? 0 : window.innerWidth / 2;
  const relativeMouseX = mousePos.x - empireContainerOffset;
  const relativeMouseY = mousePos.y;

  // WAVE PARAMETERS
  const waveWidth = 300; 
  const trailingEdge = Math.max(0, waveRadius - waveWidth);

  // MASK GENERATION
  const getMaskStyle = () => {
      // 1. If Active (Clicked): ONLY show the Wave. Disable flashlight.
      if (isEmpireActive) {
          return {
            WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent ${trailingEdge}px, black ${trailingEdge + 20}px, black ${waveRadius - 50}px, transparent ${waveRadius + 50}px)`,
            maskImage: `radial-gradient(circle at 50% 50%, transparent ${trailingEdge}px, black ${trailingEdge + 20}px, black ${waveRadius - 50}px, transparent ${waveRadius + 50}px)`,
          };
      }

      // 2. If Inactive (Hovering): Show flashlight.
      // Small radius (120px), sharp drop-off to transparent.
      return {
        WebkitMaskImage: `radial-gradient(circle 120px at ${relativeMouseX}px ${relativeMouseY}px, black 0%, transparent 80%, transparent 100%)`,
        maskImage: `radial-gradient(circle 120px at ${relativeMouseX}px ${relativeMouseY}px, black 0%, transparent 80%, transparent 100%)`,
      };
  };

  const getResistanceMaskStyle = () => {
    // Reveal noise around cursor
    // If selected (active), maybe show full noise or keep it hidden? Let's just keep flashlight behavior until transition.
    return {
        WebkitMaskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 70%, transparent 100%)`,
        maskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 70%, transparent 100%)`,
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden flex bg-black cursor-crosshair font-header ${isShaking ? 'animate-shake' : ''}`}
      onMouseMove={handleMouseMove}
    >
        <style>{`
            @keyframes shake {
                0%, 100% { transform: translate(0, 0); }
                10%, 30%, 50%, 70%, 90% { transform: translate(-8px, 8px); }
                20%, 40%, 60%, 80% { transform: translate(8px, -8px); }
            }
            .animate-shake {
                animation: shake 0.1s cubic-bezier(.36,.07,.19,.97) both;
            }

            @keyframes glitch-skew {
                0% { transform: skew(0deg); }
                20% { transform: skew(-10deg); filter: hue-rotate(90deg); }
                40% { transform: skew(10deg); filter: hue-rotate(-90deg); }
                60% { transform: skew(-5deg); }
                80% { transform: skew(5deg); }
                100% { transform: skew(0deg); }
            }
            .resistance-glitch-active {
                animation: glitch-skew 0.2s infinite;
            }

            .hex-bg {
                background-image: url("data:image/svg+xml,%3Csvg width='56' height='100' viewBox='0 0 56 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='rgba(0, 204, 255, 0.25)' stroke='%2300ccff' stroke-width='1' stroke-opacity='0.6'/%3E%3Cpath d='M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34' fill='rgba(0, 204, 255, 0.25)' stroke='%2300ccff' stroke-width='1' stroke-opacity='0.6'/%3E%3C/svg%3E");
            }

            .noise-bg {
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E");
            }
        `}</style>

      {/* --- RESISTANCE SIDE (LEFT) --- */}
      <div 
        className={`relative h-full transition-all duration-700 ease-in-out overflow-hidden z-20 border-r-2 border-white/20 ${
            selection === 'resistance' ? 'w-full' : selection === 'empire' ? 'w-0' : 'w-1/2'
        }`}
        onClick={handleResistanceClick}
      >
        <div className="absolute inset-0 bg-[#0a110a]">
            {/* Base weak noise */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay noise-bg"></div>
            
            {/* Flashlight revealed intense noise */}
            {selection !== 'empire' && (
                <div 
                    className="absolute inset-0 z-30 pointer-events-none bg-green-900 mix-blend-hard-light noise-bg opacity-40"
                    style={getResistanceMaskStyle()}
                ></div>
            )}
        </div>

        <div className={`relative h-full flex flex-col items-center justify-center p-10 transition-all 
            ${isShaking ? 'resistance-glitch-active' : ''} 
        `}>
            <h2 className="glitch-target text-6xl md:text-8xl font-mono font-bold text-[#0f0] tracking-tighter uppercase mb-4" style={{ textShadow: '2px 2px 0px #000, -1px -1px 0 #0f0' }}>
                RESIST
            </h2>
            <div className="border border-[#0f0] px-6 py-2 bg-[#000] text-[#0f0] font-mono text-xl tracking-widest hover:bg-[#0f0] hover:text-black transition-colors cursor-pointer shadow-[0_0_15px_#0f0]">
                JOIN THE CAUSE
            </div>
            <div className="absolute bottom-10 left-10 font-mono text-[#0f0] text-xs opacity-50">
                SYS.OVERRIDE_ACTIVE<br/>
                SIGNAL: UNSTABLE
            </div>
        </div>

        {/* BULLET IMPACT LAYER */}
        <div className="absolute inset-0 pointer-events-none z-50">
            {impactStage >= 1 && (
                <>
                    <CrackSVG className="absolute w-[400px] h-[400px]" style={{ top: '15%', left: '15%', transform: 'translate(-50%, -50%) rotate(15deg)' }} />
                    <GlassShards x={100} y={100} /> {/* Hardcoded approximates for shard spawn, CSS % is harder for absolute div, usually we use ref but this is visual hack */}
                </>
            )}
            {impactStage >= 2 && (
                <CrackSVG className="absolute w-[500px] h-[500px]" style={{ bottom: '10%', right: '10%', transform: 'translate(50%, 50%) rotate(-20deg)' }} />
            )}
            {impactStage >= 3 && (
                <CrackSVG className="absolute w-[600px] h-[600px]" style={{ top: '40%', left: '40%', transform: 'translate(-50%, -50%) rotate(45deg)' }} />
            )}
            
            {/* Shard Spawner (using percentage based positioning container) */}
            {shardSpawns.map(spawn => (
                <div key={spawn.id} className="absolute w-0 h-0" style={{ left: spawn.x, top: spawn.y }}>
                    <GlassShards x={0} y={0} />
                </div>
            ))}
        </div>
      </div>

      {/* --- EMPIRE SIDE (RIGHT) --- */}
      <div 
        className={`relative h-full bg-ordo-bg flex flex-col items-center justify-center transition-all duration-700 ease-in-out z-10 ${
            selection === 'empire' ? 'w-full' : selection === 'resistance' ? 'w-0' : 'w-1/2'
        }`}
        onClick={handleEmpireClick}
      >
        <div className="absolute inset-0 bg-ordo-pattern opacity-40 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-black via-transparent to-transparent opacity-80"></div>

        {/* HEX GRID with DYNAMIC MASK - Completely Replaced */}
        {selection !== 'resistance' && (
            <div 
                className="absolute inset-0 z-30 pointer-events-none hex-bg transition-opacity duration-500"
                style={getMaskStyle()}
            ></div>
        )}
        
        {/* COLLISION RING (The "Clearing" Boundary - Trailing Edge) */}
        {isEmpireActive && trailingEdge > 0 && (
            <div 
                className="absolute z-50 rounded-full pointer-events-none border-2 border-white shadow-[0_0_30px_white,inset_0_0_20px_white] opacity-80"
                style={{
                    left: '50%',
                    top: '50%',
                    width: `${trailingEdge * 2}px`,
                    height: `${trailingEdge * 2}px`,
                    transform: 'translate(-50%, -50%)',
                }}
            ></div>
        )}

        {/* Hover Highlight Ring (Only if not clicked yet) */}
        {!isEmpireActive && (
             <div 
                className="absolute w-[120px] h-[120px] border border-[#00ccff] rounded-full opacity-20 pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#00ccff]"
                style={{ left: relativeMouseX, top: relativeMouseY }}
             ></div>
        )}

        {/* Content */}
        <div className="relative z-40 text-center">
            <h2 className="text-6xl md:text-8xl font-header font-bold text-transparent bg-clip-text bg-gradient-to-b from-ordo-gold to-[#8a6e00] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] tracking-[10px] uppercase mb-4">
                EMPIRE
            </h2>
            <div className="border border-ordo-gold px-8 py-3 text-ordo-gold font-header text-xl tracking-[5px] hover:bg-ordo-gold hover:text-black transition-all cursor-pointer inline-block shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                ACCESS REGISTRY
            </div>
             <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1px] h-[80px] bg-gradient-to-b from-transparent to-ordo-gold"></div>
             <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[1px] h-[80px] bg-gradient-to-t from-transparent to-ordo-gold"></div>
        </div>
      </div>

      {/* --- CENTER CLASH LINE --- */}
      {!selection && (
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] -ml-[1px] z-30 pointer-events-none">
              <div className="h-full w-full bg-gradient-to-b from-transparent via-white to-transparent opacity-50 shadow-[0_0_15px_white]"></div>
          </div>
      )}

    </div>
  );
};

export default SideChoice;