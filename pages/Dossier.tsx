import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { OrdoService } from '../services/firebase';
import { Character, Attributes, Skills } from '../types';
import { ImperialInput, ImperialTextarea, StatBox, DataBlock, SectionHeader, DeleteBtn } from '../components/Components';
import { debounce } from 'lodash';

// Helper for modifiers
const getMod = (val: number) => Math.floor((val - 10) / 2);
const formatMod = (val: number) => (val >= 0 ? `+${val}` : `${val}`);

const SKILL_LIST = [
  { k: 'athletics', n: 'Атлетика', a: 'str' }, { k: 'acrobatics', n: 'Акробатика', a: 'dex' },
  { k: 'sleight', n: 'Ловкость рук', a: 'dex' }, { k: 'stealth', n: 'Скрытность', a: 'dex' },
  { k: 'history', n: 'История', a: 'int' }, { k: 'investigation', n: 'Расследование', a: 'int' },
  { k: 'tech', n: 'Техника', a: 'int' }, { k: 'programming', n: 'Программирование', a: 'int' },
  { k: 'fund_science', n: 'Фун. Физика', a: 'int' }, { k: 'weapons', n: 'Оружие', a: 'int' },
  { k: 'nature', n: 'Природа', a: 'int' }, { k: 'religion', n: 'Религия', a: 'int' },
  { k: 'perception', n: 'Восприятие', a: 'wis' }, { k: 'survival', n: 'Выживание', a: 'wis' },
  { k: 'medicine', n: 'Медицина', a: 'wis' }, { k: 'insight', n: 'Проницательность', a: 'wis' },
  { k: 'performance', n: 'Выступление', a: 'cha' }, { k: 'intimidation', n: 'Запугивание', a: 'cha' },
  { k: 'deception', n: 'Обман', a: 'cha' }, { k: 'persuasion', n: 'Убеждение', a: 'cha' }
] as const;

const ATTRIBUTES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

type PanelType = 'identity' | 'biometrics' | 'skills' | 'equipment' | 'psych' | 'psionics' | 'universalis';

const Dossier: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Character | null>(null);
  const [activePanel, setActivePanel] = useState<PanelType>('identity');
  const [now, setNow] = useState(new Date());

  // Subscribe to data
  useEffect(() => {
    if (!id) return;
    const unsub = OrdoService.subscribeOne(id, (char) => {
      if (char) setData(char);
      else alert("Protocol not found");
    });
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => { unsub(); clearInterval(timer); };
  }, [id]);

  // Debounced save
  const saveToDb = useMemo(() => debounce((newData: Character) => {
    if (!newData.id) return;
    OrdoService.update(newData.id, newData);
  }, 500), []);

  const update = useCallback((fn: (d: Character) => void) => {
    setData((prev) => {
      if (!prev) return null;
      const next = JSON.parse(JSON.stringify(prev)); // Deep copy for safety
      fn(next);
      saveToDb(next);
      return next;
    });
  }, [saveToDb]);

  const toggleLock = (panel: PanelType) => {
    update(d => {
      if (!d.locks) d.locks = {};
      d.locks[panel] = !d.locks[panel];
    });
  };

  // Derived calculations
  const level = data?.meta.level || 1;
  const pb = 2 + Math.floor((level - 1) / 4);
  const getAttrMod = (attr: keyof Attributes) => getMod(data?.stats[attr] || 10);
  
  // Generic list handler
  const addItem = (listPath: string[], item: any) => {
    update(d => {
      let target = d;
      for (let i = 0; i < listPath.length - 1; i++) target = target[listPath[i] as keyof Character] as any;
      const last = listPath[listPath.length - 1];
      if (Array.isArray((target as any)[last])) {
        (target as any)[last].push(item);
      }
    });
  };

  const removeItem = (listPath: string[], index: number) => {
    update(d => {
      let target = d;
      for (let i = 0; i < listPath.length - 1; i++) target = target[listPath[i] as keyof Character] as any;
      const last = listPath[listPath.length - 1];
      if (Array.isArray((target as any)[last])) {
        (target as any)[last].splice(index, 1);
      }
    });
  };

  if (!data) return <div className="text-ordo-gold text-center mt-20 font-header text-2xl animate-pulse">LOADING PROTOCOL...</div>;

  const isLocked = data.locks?.[activePanel];

  return (
    <div className="flex flex-col h-screen">
      <header className="h-[80px] border-b-2 border-ordo-gold bg-gradient-to-b from-[#1a0f0f] to-[#0f0b0b] flex justify-between items-center px-10 relative z-50 shadow-lg shrink-0">
        <div className="absolute bottom-[-5px] left-0 right-0 h-[3px] bg-ordo-crimson border-b border-black"></div>
        <div className="flex items-center">
          <Link to="/" className="border border-ordo-gold text-ordo-gold px-4 py-2 font-header hover:bg-ordo-gold hover:text-black transition-all mr-6">← REGISTRY</Link>
          <div className="font-header text-2xl text-ordo-gold font-bold flex items-center gap-4">
            <span className="text-4xl text-transparent bg-clip-text bg-gradient-to-b from-ordo-gold to-ordo-crimson transform scale-y-75">▼</span>
            <div>ORDO CONTINUUM <div className="text-xs text-ordo-crimson tracking-[4px] mt-1">Ex Tenebris Lux</div></div>
          </div>
        </div>
        <div className="font-header text-ordo-gold-dim border border-ordo-gold-dim px-4 py-1 bg-[rgba(0,0,0,0.3)]">
          {now.toISOString().split('T')[1].split('.')[0]} ULT
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-40">
        {/* SIDEBAR */}
        <aside className="w-[300px] bg-[rgba(15,11,11,0.95)] border-r border-ordo-gold-dim flex flex-col py-10 overflow-y-auto shrink-0">
          {(['identity', 'biometrics', 'skills', 'equipment', 'psych', 'psionics', 'universalis'] as PanelType[]).map(panel => {
             const labels: Record<string, string> = { identity: "I. Identitas", biometrics: "II. Corpus", skills: "III. Artes", equipment: "IV. Armamentum", psych: "V. Anima", psionics: "VI. Psionica", universalis: "VII. Universalis" };
             return (
              <div key={panel} className="flex items-center pr-4 hover:bg-[rgba(212,175,55,0.05)] transition-colors">
                <button 
                  onClick={() => setActivePanel(panel)}
                  className={`flex-1 text-left py-5 px-6 font-header text-base tracking-widest uppercase transition-all ${activePanel === panel ? 'text-ordo-gold border-l-2 border-ordo-gold bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.1)] to-transparent' : 'text-ordo-gold-dim'}`}
                >
                  {labels[panel]}
                </button>
                <input 
                  type="checkbox" 
                  checked={data.locks?.[panel] || false} 
                  onChange={() => toggleLock(panel)}
                  className="appearance-none w-5 h-5 border-2 border-ordo-gold-dim bg-[rgba(0,0,0,0.5)] checked:bg-ordo-crimson checked:border-ordo-crimson checked:shadow-[0_0_10px_#8a0000] cursor-pointer transition-all"
                />
              </div>
             );
          })}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-10 overflow-y-auto relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTEgMWgzOHYzOEgxVjF6IiBmaWxsPSIjMzMzIiBmaWxsLW9wYWNpdHk9IjAuMSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')]">
          {isLocked ? (
             <div className="flex flex-col h-full justify-center items-center text-ordo-crimson animate-[pulse_2s_infinite]">
               <div className="text-6xl mb-4">⛔</div>
               <h1 className="text-6xl font-header font-bold drop-shadow-[0_0_20px_#8a0000]">ACCESS DENIED</h1>
               <p className="font-header text-2xl tracking-[5px] mt-4">CLEARANCE LEVEL INSUFFICIENT</p>
             </div>
          ) : (
            <div className="max-w-[1200px] mx-auto animate-fadeIn pb-20">
              
              {/* --- IDENTITY PANEL --- */}
              {activePanel === 'identity' && (
                <>
                  <h1 className="font-header text-4xl text-ordo-gold text-center mb-10 border-b border-ordo-gold-dim pb-4">Sanctus Dossier</h1>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-8">
                    <DataBlock className="row-span-2">
                      <SectionHeader title="Imago / Облик" />
                      <div className="border-2 border-ordo-gold-dim p-1 bg-[rgba(0,0,0,0.3)] min-h-[400px] flex items-center justify-center relative">
                        {data.meta.image ? <img src={data.meta.image} alt="char" className="max-w-full max-h-[400px] block" /> : <span className="text-ordo-gold-dim">NO IMAGE</span>}
                        <button 
                          onClick={() => {
                            const url = prompt("Enter Image URL:");
                            if(url) update(d => d.meta.image = url);
                          }} 
                          className="absolute bottom-2 right-2 bg-[rgba(0,0,0,0.8)] border border-ordo-gold text-ordo-gold px-2 hover:bg-ordo-gold hover:text-black"
                        >
                          ↻
                        </button>
                      </div>
                    </DataBlock>

                    <DataBlock>
                      <SectionHeader title="Registrum Primus" />
                      {[
                        { l: "Имя", k: "name" }, { l: "Раса", k: "race" }, { l: "Возраст", k: "age" },
                        { l: "Ранг", k: "rank" }, { l: "Класс", k: "class" }, { l: "Архетип", k: "archetype" }
                      ].map(f => (
                        <div key={f.k} className="flex justify-between items-baseline py-2 border-b border-[rgba(212,175,55,0.2)]">
                          <span className="text-ordo-gold-dim italic text-lg mr-4">{f.l}:</span>
                          <ImperialInput 
                            value={(data.meta as any)[f.k]} 
                            onChange={(e) => { const v = e.target.value; update(d => (d.meta as any)[f.k] = v); }} 
                          />
                        </div>
                      ))}
                      <div className="mt-5 border-t border-ordo-gold-dim pt-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-ordo-gold italic">Уровень:</span>
                          <input type="number" className="bg-transparent text-white border border-ordo-gold w-16 text-center" value={data.meta.level} onChange={(e) => update(d => d.meta.level = parseInt(e.target.value))} />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-ordo-gold-dim italic">Бонус Мастерства:</span>
                          <span className="font-header font-bold text-ordo-crimson text-xl">+{pb}</span>
                        </div>
                      </div>
                    </DataBlock>

                    <DataBlock className="border-ordo-crimson bg-gradient-to-b from-[rgba(102,0,0,0.1)] to-transparent">
                      <h2 className="text-ordo-crimson font-header text-lg mb-4 uppercase tracking-wider border-b-2 border-ordo-crimson inline-block pr-5">Nota Bene</h2>
                      <ul className="pl-2">
                         {[{l:"Должность", k:"job"}, {l:"Допуск", k:"clearance"}, {l:"Связь", k:"comm"}].map(f => (
                           <li key={f.k} className="relative pl-6 mb-2 flex justify-between items-center border-l-2 border-ordo-crimson hover:bg-gradient-to-r hover:from-[rgba(138,0,0,0.1)] hover:to-transparent transition-all pr-2">
                             <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 bg-ordo-crimson rounded-full"></div>
                             <span className="text-ordo-gold-dim">{f.l}:</span>
                             <ImperialInput className="!w-1/2 !text-left" value={(data.meta as any)[f.k]} onChange={(e) => { const v = e.target.value; update(d => (d.meta as any)[f.k] = v); }} />
                           </li>
                         ))}
                      </ul>
                    </DataBlock>
                  </div>
                </>
              )}

              {/* --- BIOMETRICS PANEL --- */}
              {activePanel === 'biometrics' && (
                <>
                  <h1 className="font-header text-4xl text-ordo-gold text-center mb-10 border-b border-ordo-gold-dim pb-4">Parametri Corporis</h1>
                  <DataBlock className="mb-8">
                     <SectionHeader title="Vitalis Status" />
                     <div className="flex flex-wrap justify-around gap-8">
                        {/* HP */}
                        <div className="text-center">
                           <div className="text-ordo-gold-dim italic mb-2">Хиты (Тек / Макс)</div>
                           <div className="flex items-center justify-center gap-2">
                             <input type="number" className="w-20 bg-ordo-input border border-ordo-gold-dim text-center text-ordo-crimson font-header text-xl p-1" value={data.stats.hp_curr} onChange={(e) => update(d => d.stats.hp_curr = parseInt(e.target.value))} />
                             <span className="text-gray-400">/</span>
                             <input type="number" className="w-20 bg-ordo-input border border-ordo-gold-dim text-center text-white font-header text-xl p-1" value={data.stats.hp_max} onChange={(e) => update(d => d.stats.hp_max = parseInt(e.target.value))} />
                           </div>
                           <div className="w-full bg-gray-900 h-2 mt-2 relative border border-gray-700">
                             <div className="h-full bg-ordo-crimson transition-all" style={{width: `${Math.min(100, (data.stats.hp_curr / (data.stats.hp_max || 1)) * 100)}%`}}></div>
                           </div>
                        </div>
                        {/* AC */}
                        <div className="text-center">
                           <div className="text-ordo-gold-dim italic mb-2">Класс Брони</div>
                           <input type="number" className="w-24 h-16 bg-transparent border-2 border-ordo-gold text-center text-3xl font-header text-white" value={data.stats.ac} onChange={e => update(d => d.stats.ac = parseInt(e.target.value))} />
                        </div>
                        {/* Speed */}
                        <div className="text-center">
                           <div className="text-ordo-gold-dim italic mb-2">Мобильность</div>
                           <div className="flex items-center gap-2">
                             <input type="number" className="w-16 bg-ordo-input border border-ordo-gold-dim text-center text-white p-1" value={data.stats.speed_mod} onChange={e => update(d => d.stats.speed_mod = parseInt(e.target.value))} />
                             <span className="font-header text-xl text-white font-bold">{9 + (data.stats.speed_mod * 1.5)}м</span>
                           </div>
                        </div>
                     </div>
                  </DataBlock>

                  <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                     <div>
                       <SectionHeader title="Характеристики" />
                       <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 border border-ordo-gold-dim p-5 bg-[rgba(0,0,0,0.2)]">
                          {ATTRIBUTES.map(attr => (
                            <StatBox key={attr} label={attr.toUpperCase()} value={data.stats[attr]} modifier={formatMod(getAttrMod(attr))}>
                               <input type="number" className="w-full bg-transparent text-center font-header text-2xl text-gray-200 border-b border-transparent hover:border-ordo-gold focus:border-ordo-gold outline-none" value={data.stats[attr]} onChange={(e) => update(d => d.stats[attr] = parseInt(e.target.value) || 10)} />
                               <div className="text-ordo-crimson font-bold mt-1">{formatMod(getAttrMod(attr))}</div>
                            </StatBox>
                          ))}
                       </div>
                     </div>
                     <DataBlock>
                       <SectionHeader title="Спасброски" />
                       <table className="w-full border-collapse">
                         <tbody>
                           {ATTRIBUTES.map(attr => {
                             const isProf = (data.saves as any)[`prof_${attr}`];
                             const mod = getAttrMod(attr) + (isProf ? pb : 0);
                             return (
                               <tr key={attr} className="border-b border-[rgba(212,175,55,0.2)] hover:bg-[rgba(212,175,55,0.1)]">
                                 <td className="p-2 font-header text-ordo-gold font-bold">{attr.toUpperCase()}</td>
                                 <td className="p-2 text-center">
                                   <input type="checkbox" className="appearance-none w-4 h-4 border border-ordo-gold bg-transparent checked:bg-ordo-gold" checked={isProf} onChange={() => update(d => (d.saves as any)[`prof_${attr}`] = !isProf)} />
                                 </td>
                                 <td className="p-2 text-right font-header font-bold text-white">{formatMod(mod)}</td>
                               </tr>
                             )
                           })}
                         </tbody>
                       </table>
                     </DataBlock>
                  </div>
                </>
              )}

              {/* --- SKILLS PANEL --- */}
              {activePanel === 'skills' && (
                <>
                  <h1 className="font-header text-4xl text-ordo-gold text-center mb-10 border-b border-ordo-gold-dim pb-4">Matrix Competentia</h1>
                  <DataBlock>
                    <SectionHeader title="Общий Реестр Навыков" />
                    <table className="w-full border border-ordo-gold-dim text-left border-collapse">
                      <thead>
                        <tr className="bg-[rgba(212,175,55,0.1)] text-ordo-gold font-header text-sm">
                          <th className="p-3 border-b border-ordo-gold-dim">Название</th>
                          <th className="p-3 border-b border-ordo-gold-dim">Атр.</th>
                          <th className="p-3 border-b border-ordo-gold-dim text-center">Вл.</th>
                          <th className="p-3 border-b border-ordo-gold-dim text-center">Комп.</th>
                          <th className="p-3 border-b border-ordo-gold-dim text-center">Бонус</th>
                          <th className="p-3 border-b border-ordo-gold-dim text-right">Итог</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SKILL_LIST.map(skill => {
                          const val = (data.skills as any)[skill.k] || 0; // 0=none, 1=prof, 2=exp
                          const bonus = (data.skills.bonuses as any)[skill.k] || 0;
                          const attrMod = getAttrMod(skill.a as any);
                          const total = attrMod + (val === 1 ? pb : val === 2 ? pb * 2 : 0) + bonus;

                          return (
                            <tr key={skill.k} className="border-b border-[rgba(212,175,55,0.1)] hover:bg-[rgba(212,175,55,0.05)] transition-colors">
                              <td className="p-2 text-gray-300 font-body text-lg">{skill.n}</td>
                              <td className="p-2 text-ordo-gold-dim uppercase text-xs">{skill.a}</td>
                              <td className="p-2 text-center">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 border border-ordo-gold-dim bg-transparent checked:bg-ordo-gold appearance-none"
                                  checked={val >= 1}
                                  onChange={() => update(d => (d.skills as any)[skill.k] = val >= 1 ? 0 : 1)}
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 border border-ordo-crimson bg-transparent checked:bg-ordo-crimson appearance-none"
                                  checked={val === 2}
                                  onChange={() => update(d => (d.skills as any)[skill.k] = val === 2 ? 1 : 2)}
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input 
                                  type="number" 
                                  className="w-12 bg-transparent border-b border-ordo-gold-dim text-center text-gray-400 focus:border-ordo-gold outline-none" 
                                  value={bonus}
                                  onChange={(e) => update(d => { if(!d.skills.bonuses) d.skills.bonuses={}; (d.skills.bonuses as any)[skill.k] = parseInt(e.target.value)||0; })}
                                />
                              </td>
                              <td className="p-2 text-right font-header font-bold text-ordo-crimson text-lg">{formatMod(total)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </DataBlock>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                     <DataBlock>
                        <SectionHeader title="Боевые Умения" onAdd={() => addItem(['abilities'], {name: 'Новое умение', type: 'Боевое'})} />
                        <div className="space-y-2">
                           {data.abilities.map((ab, i) => (
                             <div key={i} className="flex justify-between items-center p-2 border border-[rgba(212,175,55,0.2)] bg-[rgba(0,0,0,0.3)] hover:border-ordo-gold cursor-pointer group">
                               <input className="bg-transparent border-none text-ordo-gold font-header w-full focus:outline-none" value={ab.name} onChange={(e) => update(d => d.abilities[i].name = e.target.value)} />
                               <DeleteBtn onClick={(e) => removeItem(['abilities'], i)} />
                             </div>
                           ))}
                        </div>
                     </DataBlock>
                     <DataBlock>
                        <SectionHeader title="Особенности" onAdd={() => addItem(['features'], {name: 'Новая особенность'})} />
                        <div className="space-y-2">
                           {data.features.map((ft, i) => (
                             <div key={i} className="flex justify-between items-center p-2 border border-[rgba(212,175,55,0.2)] bg-[rgba(0,0,0,0.3)] hover:border-ordo-gold cursor-pointer group">
                               <input className="bg-transparent border-none text-ordo-gold font-header w-full focus:outline-none" value={ft.name} onChange={(e) => update(d => d.features[i].name = e.target.value)} />
                               <DeleteBtn onClick={(e) => removeItem(['features'], i)} />
                             </div>
                           ))}
                        </div>
                     </DataBlock>
                  </div>
                </>
              )}

              {/* --- EQUIPMENT, PSYCH, PSIONICS, UNIVERSALIS panels omitted for brevity but follow same pattern --- */}
              {/* Implementing Equipment as example of lists */}
              {activePanel === 'equipment' && (
                 <>
                   <h1 className="font-header text-4xl text-ordo-gold text-center mb-10 border-b border-ordo-gold-dim pb-4">Armamentum Sacrum</h1>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <DataBlock>
                         <SectionHeader title="Оружие" onAdd={() => addItem(['combat', 'weapons'], {name: 'Новое Оружие', type: 'Меч'})} />
                         {data.combat.weapons.map((w, i) => (
                           <div key={i} className="flex justify-between items-center p-3 border-b border-[rgba(212,175,55,0.2)] hover:bg-[rgba(212,175,55,0.1)]">
                              <div className="flex-1">
                                <div className="text-xs text-ordo-gold-dim">{w.type}</div>
                                <input className="bg-transparent w-full text-white font-bold" value={w.name} onChange={(e) => update(d => d.combat.weapons[i].name = e.target.value)} />
                              </div>
                              <DeleteBtn onClick={(e) => removeItem(['combat', 'weapons'], i)} />
                           </div>
                         ))}
                      </DataBlock>
                      <DataBlock>
                         <SectionHeader title="Финансы" />
                         <table className="w-full text-ordo-gold-dim">
                           <tbody>
                             {['u', 'k', 'm', 'g'].map(curr => (
                               <tr key={curr}>
                                 <td className="p-2 uppercase">{curr}-Credits</td>
                                 <td><ImperialInput value={(data.money as any)[curr]} onChange={e => update(d => (d.money as any)[curr] = e.target.value)} /></td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                      </DataBlock>
                   </div>
                 </>
              )}

              {/* Fallback for other panels to avoid empty screen in this implementation */}
              {(activePanel === 'psych' || activePanel === 'psionics' || activePanel === 'universalis') && (
                 <div className="text-center text-ordo-gold-dim mt-20 italic">
                    [MODULE UNDER CONSTRUCTION - REFER TO LEGACY DATABASE]
                 </div>
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dossier;
