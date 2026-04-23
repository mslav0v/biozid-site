"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Edges } from '@react-three/drei';
import { useState, useEffect } from 'react';

interface CadEditorProps {
  walls: any[];
  onSave?: (updatedWalls: any[]) => void;
  isSaving?: boolean;
}

// СТАНДАРТНИ ПАНЕЛИ ОТ КАЛКУЛАТОРА
const STANDARD_PANELS = [
  { id: 'P1', name: '2.50м x 1.25м', w: 2.50, h: 1.25 },
  { id: 'P2', name: '2.44м x 1.44м', w: 2.44, h: 1.44 },
  { id: 'P3', name: '1.25м x 1.25м', w: 1.25, h: 1.25 },
  { id: 'P4', name: '1.22м x 1.22м', w: 1.22, h: 1.22 },
  { id: 'P5', name: '0.625м x 1.25м', w: 0.625, h: 1.25 },
  { id: 'P6', name: '0.61м x 1.44м', w: 0.61, h: 1.44 },
];

export default function CadEditor({ walls, onSave, isSaving }: CadEditorProps) {
  const [localWalls, setLocalWalls] = useState<any[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<{wIdx: number, rIdx: number, pIdx: number} | null>(null);
  
  const [activeTab, setActiveTab] = useState<'walls' | 'panels'>('walls');
  const [selectedWallIdx, setSelectedWallIdx] = useState<number | null>(null);

  // Състояния за добавяне на панел и преизчисляване
  const [newPanelWidth, setNewPanelWidth] = useState<number>(1.25);
  const [newPanelRow, setNewPanelRow] = useState<number>(0);
  const [recalcPanelId, setRecalcPanelId] = useState<string>('P1'); // По подразбиране най-големият

  useEffect(() => {
    if (walls) setLocalWalls(JSON.parse(JSON.stringify(walls)));
  }, [walls]);

  if (!localWalls || localWalls.length === 0) {
    return <div className="flex items-center justify-center h-64 text-slate-500 text-xs uppercase tracking-widest">Няма генерирани стени за този проект.</div>;
  }

  // --- ИЗЧИСЛЯВАНЕ НА МАЩАБ ---
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let totalPx = 0, totalM = 0;

  localWalls.forEach((w: any) => {
    minX = Math.min(minX, w.coords.x1, w.coords.x2);
    maxX = Math.max(maxX, w.coords.x1, w.coords.x2);
    minY = Math.min(minY, w.coords.y1, w.coords.y2);
    maxY = Math.max(maxY, w.coords.y1, w.coords.y2);
    const pxLen = Math.hypot(w.coords.x2 - w.coords.x1, w.coords.y2 - w.coords.y1);
    totalPx += pxLen;
    totalM += w.length;
  });
  
  const centerX = minX === Infinity ? 0 : (minX + maxX) / 2;
  const centerY = minY === Infinity ? 0 : (minY + maxY) / 2;
  const scale = totalM > 0 ? (totalPx / totalM) : 50; 

  // --- ФУНКЦИИ ЗА ПАНЕЛИ ---
  const handleDeletePanel = () => {
    if (!selectedPanel) return;
    const { wIdx, rIdx, pIdx } = selectedPanel;
    const updatedWalls = [...localWalls];
    updatedWalls[wIdx].rows[rIdx].panels.splice(pIdx, 1);
    setLocalWalls(updatedWalls);
    setSelectedPanel(null);
  };

  const handleRotatePanel = () => {
    if (!selectedPanel) return;
    const { wIdx, rIdx, pIdx } = selectedPanel;
    const updatedWalls = [...localWalls];
    const panel = updatedWalls[wIdx].rows[rIdx].panels[pIdx];
    const rowHeight = updatedWalls[wIdx].rows[rIdx].height;
    const currentWidth = panel.width;
    const currentHeight = panel.height || rowHeight;

    panel.width = currentHeight;
    panel.height = currentWidth;
    panel.type = 'custom';
    setLocalWalls(updatedWalls);
  };

  const handleSplitPanel = () => {
    if (!selectedPanel) return;
    const { wIdx, rIdx, pIdx } = selectedPanel;
    const updatedWalls = [...localWalls];
    const panel = updatedWalls[wIdx].rows[rIdx].panels[pIdx];
    const halfWidth = panel.width / 2;
    
    const panel1 = { ...panel, width: halfWidth, type: 'custom' };
    const panel2 = { ...panel, width: halfWidth, type: 'custom' };

    updatedWalls[wIdx].rows[rIdx].panels.splice(pIdx, 1, panel1, panel2);
    setLocalWalls(updatedWalls);
  };

  const handleAddPanel = (wIdx: number, autoFill: boolean = false) => {
    const updatedWalls = [...localWalls];
    const wall = updatedWalls[wIdx];
    const targetRow = wall.rows[newPanelRow];
    
    if (!targetRow) return alert("Избраният ред не съществува!");

    let widthToAdd = newPanelWidth;

    if (autoFill) {
      const currentWidthInRow = targetRow.panels.reduce((sum: number, p: any) => sum + p.width, 0);
      const gap = wall.length - currentWidthInRow;
      if (gap <= 0.01) return alert("Няма празно място в този ред!");
      widthToAdd = gap;
    }

    const newPanel = {
      width: widthToAdd,
      height: targetRow.height,
      type: 'custom'
    };

    targetRow.panels.push(newPanel);
    setLocalWalls(updatedWalls);
  };

  // --- ПРЕИЗЧИСЛЯВАНЕ С РЕАЛНИ РАЗМЕРИ ---
  const handleRecalculateWall = (wIdx: number) => {
    const updatedWalls = [...localWalls];
    const wall = updatedWalls[wIdx];
    
    // Вземаме избрания панел от падащото меню
    const panelToUse = STANDARD_PANELS.find(p => p.id === recalcPanelId) || STANDARD_PANELS[0];
    const STANDARD_WIDTH = panelToUse.w;
    const STANDARD_HEIGHT = panelToUse.h; 

    const newRows = [];
    let remainingHeight = wall.height;

    // Генерираме редове, докато покрием височината
    while (remainingHeight > 0.01) {
      const currentRowHeight = Math.min(STANDARD_HEIGHT, remainingHeight);
      let remainingWidth = wall.length;
      const currentPanels = [];

      // Генерираме панели за текущия ред
      while (remainingWidth > 0.01) {
        const currentPanelWidth = Math.min(STANDARD_WIDTH, remainingWidth);
        const isCustom = currentPanelWidth < STANDARD_WIDTH - 0.01 || currentRowHeight < STANDARD_HEIGHT - 0.01;
        
        currentPanels.push({
          width: currentPanelWidth,
          height: currentRowHeight,
          type: isCustom ? 'custom' : 'standard'
        });
        
        remainingWidth -= currentPanelWidth;
      }

      newRows.push({
        height: currentRowHeight,
        panels: currentPanels
      });

      remainingHeight -= currentRowHeight;
    }

    wall.rows = newRows;
    setLocalWalls(updatedWalls);
    setSelectedPanel(null);
  };

  const handleWallChange = (wIdx: number, field: string, value: string | number) => {
    const updatedWalls = [...localWalls];
    updatedWalls[wIdx] = { ...updatedWalls[wIdx], [field]: value };
    setLocalWalls(updatedWalls);
  };

  const activePanelData = selectedPanel ? localWalls[selectedPanel.wIdx]?.rows[selectedPanel.rIdx]?.panels[selectedPanel.pIdx] : null;
  const activeRowHeight = selectedPanel ? localWalls[selectedPanel.wIdx]?.rows[selectedPanel.rIdx]?.height : null;

  return (
    <div className="flex flex-col gap-4 font-sans">
      
      <div className="flex justify-end">
        <button 
          onClick={() => onSave && onSave(localWalls)}
          disabled={isSaving}
          className="bg-teal-600 text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? "Запазване..." : "💾 Запази промените в базата"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
        <div className="w-full lg:w-2/5 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
          
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button onClick={() => { setActiveTab('walls'); setSelectedPanel(null); }} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition ${activeTab === 'walls' ? 'bg-white text-teal-600 border-b-2 border-teal-600' : 'text-slate-400 hover:bg-slate-100'}`}>
              Стени
            </button>
            <button onClick={() => setActiveTab('panels')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition ${activeTab === 'panels' ? 'bg-white text-teal-600 border-b-2 border-teal-600' : 'text-slate-400 hover:bg-slate-100'}`}>
              Панели {selectedPanel ? '(1 Избран)' : ''}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-white">
            
            {activeTab === 'walls' && (
              <div className="space-y-4">
                {localWalls.map((wall: any, idx: number) => (
                  <div key={idx} className={`p-5 rounded-xl border transition ${selectedWallIdx === idx ? 'border-teal-500 bg-teal-50/30 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-slate-300 cursor-pointer'}`} onClick={() => setSelectedWallIdx(idx)}>
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Стена {wall.letter}</h3>
                      <span className="text-[10px] bg-white border border-slate-200 px-3 py-1.5 rounded text-slate-500 font-bold uppercase shadow-sm">
                        Панели: {wall.rows.reduce((acc: number, row: any) => acc + row.panels.length, 0)}
                      </span>
                    </div>
                    
                    {selectedWallIdx === idx && (
                      <div className="space-y-4 pt-4 mt-4 border-t border-slate-200/50 animate-in fade-in cursor-default" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Дължина (м)</label>
                            <input type="number" step="0.1" value={wall.length} onChange={(e) => handleWallChange(idx, 'length', parseFloat(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-700 outline-teal-500 transition focus:shadow-md" />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Височина (м)</label>
                            <input type="number" step="0.1" value={wall.height} onChange={(e) => handleWallChange(idx, 'height', parseFloat(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-700 outline-teal-500 transition focus:shadow-md" />
                          </div>
                        </div>

                        {/* СЕКЦИЯ ЗА ПРЕИЗЧИСЛЯВАНЕ С ИЗБОР НА ПАНЕЛ */}
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 mt-2">
                          <label className="text-[10px] uppercase font-bold text-teal-700 block mb-2">Избери базов панел за запълване:</label>
                          <select 
                            value={recalcPanelId} 
                            onChange={(e) => setRecalcPanelId(e.target.value)} 
                            className="w-full bg-white border border-teal-200 rounded p-2 text-xs font-bold text-slate-700 outline-teal-500 mb-3"
                          >
                            {STANDARD_PANELS.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => handleRecalculateWall(idx)}
                            className="w-full bg-teal-600 text-white py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-teal-700 transition shadow-sm"
                          >
                            🔄 Преизчисли стената
                          </button>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-3 border-b border-slate-100 pb-2">➕ Добави нов панел</h4>
                          
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Ширина (м)</label>
                              <input type="number" step="0.1" value={newPanelWidth} onChange={(e) => setNewPanelWidth(parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-bold text-slate-700 outline-teal-500" />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Към Ред</label>
                              <select value={newPanelRow} onChange={(e) => setNewPanelRow(parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-bold text-slate-700 outline-teal-500">
                                {wall.rows.map((_: any, rIdx: number) => (
                                  <option key={rIdx} value={rIdx}>Ред {rIdx + 1}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => handleAddPanel(idx, false)} className="flex-1 bg-slate-800 text-white py-2 rounded text-[9px] font-bold uppercase tracking-widest hover:bg-slate-700 transition">
                              Ръчно
                            </button>
                            <button onClick={() => handleAddPanel(idx, true)} className="flex-1 bg-teal-100 text-teal-700 border border-teal-200 py-2 rounded text-[9px] font-bold uppercase tracking-widest hover:bg-teal-600 hover:text-white transition">
                              🪄 Авто-Запълване
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'panels' && (
              <div>
                {!selectedPanel ? (
                  <div className="text-center p-12 text-slate-400 text-sm italic border-2 border-dashed border-slate-100 rounded-xl mt-4">Кликнете върху панел от 3D модела вдясно, за да го редактирате.</div>
                ) : activePanelData ? (
                  <div className="space-y-6 animate-in fade-in pt-2">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                       <h3 className="text-[11px] font-bold uppercase tracking-widest text-teal-600 border-b border-slate-200 pb-3 mb-4">Свойства на панела</h3>
                       <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center"><span className="text-slate-500 text-xs font-bold uppercase">Ширина:</span><span className="font-black text-slate-800">{activePanelData.width.toFixed(3)} м</span></div>
                          <div className="flex justify-between items-center"><span className="text-slate-500 text-xs font-bold uppercase">Височина:</span><span className="font-black text-slate-800">{(activePanelData.height || activeRowHeight).toFixed(3)} м</span></div>
                          <div className="flex justify-between items-center"><span className="text-slate-500 text-xs font-bold uppercase">Тип сряз:</span>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${activePanelData.type === 'custom' ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-700'}`}>
                              {activePanelData.type === 'custom' ? 'Изрязан' : 'Стандартен'}
                            </span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                       <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-800 mb-4 border-b border-slate-100 pb-2">Инструменти</h3>
                       <button onClick={handleRotatePanel} className="w-full bg-slate-50 text-slate-600 border border-slate-200 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition">Завърти (Хориз/Верт)</button>
                       <button onClick={handleSplitPanel} className="w-full bg-slate-50 text-slate-600 border border-slate-200 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition">Раздели на две</button>
                       <button onClick={handleDeletePanel} className="w-full bg-red-50 text-red-600 border border-red-100 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition mt-2">Изтрий панела</button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* ДЯСНА ЧАСТ: 3D CAD ВИЗУАЛИЗАЦИЯ */}
        <div className="w-full lg:w-3/5 h-full bg-slate-900 rounded-xl overflow-hidden relative shadow-inner">
          <Canvas camera={{ position: [0, 15, 25], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 30, 10]} intensity={1.5} castShadow />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            
            <group position={[0, -2, 0]}>
              {localWalls.map((wall: any, wIdx: number) => {
                const cx = (wall.coords.x1 + wall.coords.x2) / 2;
                const cy = (wall.coords.y1 + wall.coords.y2) / 2;
                const posX = (cx - centerX) / scale;
                const posZ = (cy - centerY) / scale;
                const dx = wall.coords.x2 - wall.coords.x1;
                const dy = wall.coords.y2 - wall.coords.y1;
                const rotY = -Math.atan2(dy, dx);

                return (
                  <group key={`wall-${wall.id}`} position={[posX, 0, posZ]} rotation={[0, rotY, 0]}>
                    <Text position={[0, wall.height + 0.8, 0]} fontSize={0.4} color="#14b8a6" anchorX="center" anchorY="middle">
                      Стена {wall.letter}
                    </Text>
                    
                    <group position={[-wall.length / 2, 0, 0]}>
                      {wall.rows.map((row: any, rIdx: number) => {
                        let currentX = 0;
                        let currentY = 0;
                        for(let i = 0; i < rIdx; i++) currentY += wall.rows[i].height;

                        return row.panels.map((panel: any, pIdx: number) => {
                          const pX = currentX + panel.width / 2;
                          const actualPanelHeight = panel.height || row.height;
                          const pY = currentY + actualPanelHeight / 2;
                          
                          currentX += panel.width;
                          
                          const isSelected = selectedPanel?.wIdx === wIdx && selectedPanel?.rIdx === rIdx && selectedPanel?.pIdx === pIdx;
                          let color = wall.type === 'Външна' ? '#e2e8f0' : '#f8fafc'; 
                          if (panel.type === 'custom') color = "#ffedd5";
                          if (isSelected) color = "#14b8a6"; 

                          return (
                            <mesh 
                              key={`panel-${rIdx}-${pIdx}-${wall.id}`} 
                              position={[pX, pY, 0]}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPanel({ wIdx, rIdx, pIdx });
                                setActiveTab('panels');
                              }}
                              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
                              onPointerOut={() => { document.body.style.cursor = 'auto'; }}
                            >
                              <boxGeometry args={[panel.width, actualPanelHeight, wall.type === 'Външна' ? 0.20 : 0.10]} />
                              <meshStandardMaterial color={color} emissive={isSelected ? "#14b8a6" : "#000000"} emissiveIntensity={isSelected ? 0.2 : 0} />
                              <Edges scale={1} threshold={15} color={isSelected ? "#ffffff" : "#334155"} />
                            </mesh>
                          );
                        });
                      })}
                    </group>
                  </group>
                );
              })}
            </group>
          </Canvas>
        </div>
        
      </div>
    </div>
  );
}