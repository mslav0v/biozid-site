"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Edges } from '@react-three/drei';

// ЗАЩИТЕН ИМПОРТ НА FABRIC.JS ЗА NEXT.JS (TURBOPACK)
let fabric: any = null;
if (typeof window !== 'undefined') {
  const f = require('fabric');
  fabric = f.fabric || f.default || f;
}

// --- КОНСТАНТИ И РАЗМЕРИ НА ПАНЕЛИТЕ БИОЗИД ---
const PANEL_TYPES = [
  { id: 'P1', name: '2.50м x 1.25м', w: 2.50, h: 1.25 },
  { id: 'P2', name: '2.44м x 1.44м', w: 2.44, h: 1.44 },
  { id: 'P3', name: '1.25м x 1.25м', w: 1.25, h: 1.25 },
  { id: 'P4', name: '1.22м x 1.22м', w: 1.22, h: 1.22 },
  { id: 'P5', name: '0.625м x 1.25м', w: 0.625, h: 1.25 },
  { id: 'P6', name: '0.61м x 1.44м', w: 0.61, h: 1.44 },
];

const PANEL_A = PANEL_TYPES[0]; // Референция за съвместимост с алгоритъма
const PANEL_B = PANEL_TYPES[1]; // Референция за съвместимост с алгоритъма

const getWallLetter = (index: number) => String.fromCharCode(65 + index);
const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

// Математика за намиране на най-близката стена
function sqr(x: number) { return x * x; }
function dist2(v: any, w: any) { return sqr(v.x - w.x) + sqr(v.y - w.y); }
function distToSegmentSquared(p: any, v: any, w: any) {
  let l2 = dist2(v, w);
  if (l2 === 0) return dist2(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}
function distToSegment(p: any, v: any, w: any) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

export default function Calculator() {
  const [unit, setUnit] = useState<'cm' | 'm'>('cm');
  const [floors, setFloors] = useState<any[]>([{ id: 1, name: 'Етаж 1', walls: [] }]);
  const [activeFloorId, setActiveFloorId] = useState<number>(1);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [globalWallHeight, setGlobalWallHeight] = useState<number>(2.80);
  
  // ЧЕРТАНЕ
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<any>(null);
  const [drawingMode, setDrawingMode] = useState<'none' | 'wall'>('none');
  const [wallType, setWallType] = useState<'Външна' | 'Вътрешна'>('Външна');
  
  // КАЛИБРИРАНЕ
  const [pixelsPerMeter, setPixelsPerMeter] = useState<number | null>(null);
  const [calibrationModal, setCalibrationModal] = useState<{isOpen: boolean, pixelLength: number, elementId: string, displayId: string, coords: any} | null>(null);
  const [calibInput, setCalibInput] = useState<string>('');
  const [calibHeightInput, setCalibHeightInput] = useState<string>('280');

  // РЕДАКЦИЯ НА РАЗМЕРИ
  const [editingWallId, setEditingWallId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // ИСТОРИЯ
  const [actionHistory, setActionHistory] = useState<any[]>([]);

  // РЕЗУЛТАТ
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [projectResult, setProjectResult] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  // РЕФОВЕ ЗА FABRIC EVENTS
  const stateRefs = useRef({
      drawingMode, wallType, floors, activeFloorIndex: floors.findIndex(f => f.id === activeFloorId), unit, pixelsPerMeter, actionHistory, globalWallHeight
  });

  useEffect(() => {
      stateRefs.current = { drawingMode, wallType, floors, activeFloorIndex: floors.findIndex(f => f.id === activeFloorId), unit, pixelsPerMeter, actionHistory, globalWallHeight };
  }, [drawingMode, wallType, floors, activeFloorId, unit, pixelsPerMeter, actionHistory, globalWallHeight]);

  const saveWallToState = (wallId: string, displayId: string, lengthInMeters: number, coords: any) => {
      const newWall = {
          id: wallId, displayId: displayId, length: lengthInMeters, height: stateRefs.current.globalWallHeight, type: stateRefs.current.wallType, cutouts: [], coords: coords 
      };
      setFloors(prev => prev.map((floor, i) => {
          if (i !== stateRefs.current.activeFloorIndex) return floor;
          return { ...floor, walls: [...floor.walls, newWall] };
      }));
      setActionHistory(prev => [...prev, { type: 'wall', floorId: stateRefs.current.floors[stateRefs.current.activeFloorIndex].id, elementId: wallId }]);
  };

  // --- ИНИЦИАЛИЗАЦИЯ НА FABRIC.JS ---
  useEffect(() => {
    if (typeof window !== 'undefined' && canvasRef.current && !fabricCanvas.current && viewMode === '2D' && fabric) {
      fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
        width: canvasRef.current.parentElement?.clientWidth || 800,
        height: canvasRef.current.parentElement?.clientHeight || 600,
        selection: false,
      });

      let isDrawing = false;
      let currentLine: any = null;
      let startX = 0;
      let startY = 0;
      let tempElementId = '';

      const getSafePointer = (o: any) => {
          if (fabricCanvas.current && typeof fabricCanvas.current.getPointer === 'function') return fabricCanvas.current.getPointer(o.e);
          return o.scenePoint || o.pointer || { x: o.e.layerX || o.e.clientX, y: o.e.layerY || o.e.clientY };
      };

      fabricCanvas.current.on('mouse:down', (o: any) => {
        if (stateRefs.current.drawingMode === 'none') return;
        isDrawing = true;
        
        const pointer = getSafePointer(o);
        if (!pointer) return;

        startX = pointer.x; startY = pointer.y;
        tempElementId = generateUniqueId();
        
        let strokeColor = stateRefs.current.wallType === 'Външна' ? '#0d9488' : '#64748b'; 
        let strokeWidth = stateRefs.current.wallType === 'Външна' ? 6 : 4;

        currentLine = new fabric.Line([startX, startY, startX, startY], {
          strokeWidth, fill: strokeColor, stroke: strokeColor, originX: 'center', originY: 'center', selectable: false, evented: false, strokeLineCap: 'round', customId: tempElementId
        });
        fabricCanvas.current.add(currentLine);
      });

      fabricCanvas.current.on('mouse:move', (o: any) => {
        if (!isDrawing || !currentLine) return;
        const pointer = getSafePointer(o);
        if (!pointer) return;

        let snapX = pointer.x; let snapY = pointer.y;
        let minDist = 20; 
        
        if (stateRefs.current.drawingMode === 'wall') {
            stateRefs.current.floors[stateRefs.current.activeFloorIndex].walls.forEach((w: any) => {
                const pts = [{x: w.coords.x1, y: w.coords.y1}, {x: w.coords.x2, y: w.coords.y2}];
                pts.forEach(p => {
                    let d = Math.hypot(pointer.x - p.x, pointer.y - p.y);
                    if (d < minDist) { minDist = d; snapX = p.x; snapY = p.y; }
                });
            });

            if (minDist === 20) {
                let dx = pointer.x - startX; let dy = pointer.y - startY;
                let angle = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
                if (angle < 8 || angle > 172) snapY = startY; 
                else if (Math.abs(angle - 90) < 8) snapX = startX;
            }
        }
        currentLine.set({ x2: snapX, y2: snapY });
        fabricCanvas.current.renderAll();
      });

      fabricCanvas.current.on('mouse:up', () => {
        if (!isDrawing || !currentLine) return;
        isDrawing = false;
        
        const lengthInPixels = Math.hypot(currentLine.x2 - currentLine.x1, currentLine.y2 - currentLine.y1);
        const coords = { x1: currentLine.x1, y1: currentLine.y1, x2: currentLine.x2, y2: currentLine.y2 };
        
        if (lengthInPixels < 5) {
            fabricCanvas.current.remove(currentLine); currentLine = null; return;
        }

        const mode = stateRefs.current.drawingMode;
        const activeFloor = stateRefs.current.floors[stateRefs.current.activeFloorIndex];

        if (mode === 'wall') {
            const displayId = getWallLetter(activeFloor.walls.length);
            const wallId = `wall-${tempElementId}`;
            currentLine.set({ customId: wallId });

            if (!stateRefs.current.pixelsPerMeter) {
                setDrawingMode('none');
                setCalibrationModal({ isOpen: true, pixelLength: lengthInPixels, elementId: wallId, displayId, coords });
            } else {
                const lengthInMeters = lengthInPixels / stateRefs.current.pixelsPerMeter;
                saveWallToState(wallId, displayId, lengthInMeters, coords);
            }
        } 
        currentLine = null;
      });
    }

    const handleResize = () => {
        if (fabricCanvas.current && canvasRef.current?.parentElement) {
            const newWidth = canvasRef.current.parentElement.clientWidth;
            const newHeight = canvasRef.current.parentElement.clientHeight;
            if (typeof fabricCanvas.current.setDimensions === 'function') fabricCanvas.current.setDimensions({ width: newWidth, height: newHeight });
            else { fabricCanvas.current.width = newWidth; fabricCanvas.current.height = newHeight; }
            fabricCanvas.current.renderAll();
        }
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); if (fabricCanvas.current) { fabricCanvas.current.dispose(); fabricCanvas.current = null; }};
  }, [viewMode]); 

  useEffect(() => {
      if (uploadedImageUrl && fabricCanvas.current && fabric) {
          const nativeImg = new window.Image();
          nativeImg.onload = () => {
              const FabricImageClass = fabric.FabricImage || fabric.Image;
              const img = new FabricImageClass(nativeImg);
              const canvasW = fabricCanvas.current.width || fabricCanvas.current.getWidth?.() || 800;
              const canvasH = fabricCanvas.current.height || fabricCanvas.current.getHeight?.() || 600;
              const scale = Math.min(canvasW / img.width, canvasH / img.height) * 0.9;
              
              img.set({ originX: 'center', originY: 'center', left: canvasW / 2, top: canvasH / 2, scaleX: scale, scaleY: scale, opacity: 0.5, selectable: false, evented: false });
              
              if (typeof fabricCanvas.current.setBackgroundImage === 'function') fabricCanvas.current.setBackgroundImage(img, fabricCanvas.current.renderAll.bind(fabricCanvas.current));
              else { fabricCanvas.current.backgroundImage = img; fabricCanvas.current.renderAll(); }
          };
          nativeImg.src = uploadedImageUrl;
      }
  }, [uploadedImageUrl, viewMode]);

  // --- УМНА РЕДАКЦИЯ НА РАЗМЕРИ ---
  const handleWallLengthEdit = (wallId: string) => {
      const val = parseFloat(editValue);
      if(!val || val <= 0) { setEditingWallId(null); return; }

      const newLengthInMeters = unit === 'cm' ? val / 100 : val;
      const ppm = stateRefs.current.pixelsPerMeter;
      if (!ppm) return;

      const newLengthInPixels = newLengthInMeters * ppm;

      setFloors(prev => prev.map(floor => {
          if (floor.id !== activeFloorId) return floor;

          const wall = floor.walls.find((w: any) => w.id === wallId);
          if (!wall) return floor;

          const dx = wall.coords.x2 - wall.coords.x1;
          const dy = wall.coords.y2 - wall.coords.y1;
          const angle = Math.atan2(dy, dx);

          const oldX2 = wall.coords.x2;
          const oldY2 = wall.coords.y2;

          // Изчисляваме новата крайна точка
          const newX2 = wall.coords.x1 + Math.cos(angle) * newLengthInPixels;
          const newY2 = wall.coords.y1 + Math.sin(angle) * newLengthInPixels;

          const updatedWalls = floor.walls.map((w: any) => {
              // 1. Обновяваме самата редактирана стена
              if (w.id === wallId) {
                  if (fabricCanvas.current) {
                      const obj = fabricCanvas.current.getObjects().find((o:any) => o.customId === w.id);
                      if (obj) { obj.set({ x2: newX2, y2: newY2 }); }
                  }
                  return { ...w, length: newLengthInMeters, coords: { ...w.coords, x2: newX2, y2: newY2 } };
              }

              // 2. Дърпаме прикачените стени (Умно снапване)
              let changed = false;
              let newCoords = { ...w.coords };
              
              if (Math.hypot(w.coords.x1 - oldX2, w.coords.y1 - oldY2) < 5) {
                  newCoords.x1 = newX2; newCoords.y1 = newY2; changed = true;
              }
              if (Math.hypot(w.coords.x2 - oldX2, w.coords.y2 - oldY2) < 5) {
                  newCoords.x2 = newX2; newCoords.y2 = newY2; changed = true;
              }

              if (changed) {
                  const newLenPx = Math.hypot(newCoords.x2 - newCoords.x1, newCoords.y2 - newCoords.y1);
                  if (fabricCanvas.current) {
                      const obj = fabricCanvas.current.getObjects().find((o:any) => o.customId === w.id);
                      if (obj) { obj.set({ x1: newCoords.x1, y1: newCoords.y1, x2: newCoords.x2, y2: newCoords.y2 }); }
                  }
                  return { ...w, length: newLenPx / ppm, coords: newCoords };
              }
              return w;
          });

          if (fabricCanvas.current) fabricCanvas.current.renderAll();
          return { ...floor, walls: updatedWalls };
      }));

      setEditingWallId(null);
  };

  const handleUndo = useCallback(() => {
      if (stateRefs.current.actionHistory.length === 0) return;
      const lastAction = stateRefs.current.actionHistory[stateRefs.current.actionHistory.length - 1];

      if (fabricCanvas.current) {
          const allObjects = fabricCanvas.current.getObjects();
          const targetObj = allObjects.find((o: any) => o.customId === lastAction.elementId);
          if (targetObj) { fabricCanvas.current.remove(targetObj); fabricCanvas.current.renderAll(); }
      }

      setFloors(prev => prev.map(floor => {
          if (floor.id !== lastAction.floorId) return floor;
          if (lastAction.type === 'wall') return { ...floor, walls: floor.walls.filter((w: any) => w.id !== lastAction.elementId) };
          return floor;
      }));

      if (stateRefs.current.actionHistory.length === 1 && lastAction.type === 'wall') setPixelsPerMeter(null);
      setActionHistory(prev => prev.slice(0, -1));
  }, []);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); handleUndo(); } };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  const handleCalibrationSubmit = () => {
      const val = parseFloat(calibInput);
      const hVal = parseFloat(calibHeightInput);
      if(!val || val <= 0 || !hVal || hVal <= 0 || !calibrationModal) return;

      const lengthInMeters = unit === 'cm' ? val / 100 : val;
      const wallHeightInMeters = unit === 'cm' ? hVal / 100 : hVal;
      const ppm = calibrationModal.pixelLength / lengthInMeters;
      
      setPixelsPerMeter(ppm);
      setGlobalWallHeight(wallHeightInMeters);
      saveWallToState(calibrationModal.elementId, calibrationModal.displayId, lengthInMeters, calibrationModal.coords);
      
      setCalibrationModal(null); setCalibInput(''); setDrawingMode('wall');
  };

  const getActiveWalls = () => floors.find(f => f.id === activeFloorId)?.walls || [];

  const optimizeWall = (wallLengthMeters: number, wallHeightMeters: number, wall: any) => {
    let minAreaWaste = Infinity;
    let bestRowsData: any[] = [];
    let bestStats = null;

    const maxRowsA = Math.ceil(wallHeightMeters / PANEL_A.h) + 1;
    const maxRowsB = Math.ceil(wallHeightMeters / PANEL_B.h) + 1;

    for (let aRows = 0; aRows <= maxRowsA; aRows++) {
      for (let bRows = 0; bRows <= maxRowsB; bRows++) {
        if (aRows === 0 && bRows === 0) continue;
        let currentTotalHeight = (aRows * PANEL_A.h) + (bRows * PANEL_B.h);
        
        if (currentTotalHeight >= wallHeightMeters) {
          let sequence = [];
          let tempA = aRows, tempB = bRows;
          while (tempA > 0 || tempB > 0) {
            if (tempA > 0) { sequence.push(PANEL_A); tempA--; }
            if (tempB > 0) { sequence.push(PANEL_B); tempB--; }
          }

          let currentRowsData: any[] = [];
          let stats = { aFull: 0, aHalf: 0, bFull: 0, bHalf: 0, custom: 0, totalAreaUsed: 0 };

          sequence.forEach((panel, index) => {
            let remainingW = wallLengthMeters;
            let isEven = index % 2 !== 0;
            let rowPanels = [];
            
            let isLastRow = index === sequence.length - 1;
            let actualRowHeight = panel.h;
            if (isLastRow && currentTotalHeight > wallHeightMeters) {
               actualRowHeight = panel.h - (currentTotalHeight - wallHeightMeters);
            }

            if (isEven) {
              let halfW = panel.w / 2;
              rowPanels.push({ type: 'half', panelId: panel.id, width: halfW });
              remainingW -= halfW;
              if (panel.id === 'P1') stats.aHalf++; else stats.bHalf++;
              stats.totalAreaUsed += (halfW * panel.h);
            }

            while (remainingW >= panel.w) {
              rowPanels.push({ type: 'full', panelId: panel.id, width: panel.w });
              remainingW -= panel.w;
              if (panel.id === 'P1') stats.aFull++; else stats.bFull++;
              stats.totalAreaUsed += (panel.w * panel.h);
            }

            if (remainingW > 0.01) {
              rowPanels.push({ type: 'custom', panelId: panel.id, width: remainingW });
              stats.custom++;
              stats.totalAreaUsed += (panel.w * panel.h); 
            }
            currentRowsData.push({ panels: rowPanels, height: actualRowHeight, origHeight: panel.h });
          });

          let waste = stats.totalAreaUsed - (wallLengthMeters * wallHeightMeters);
          if (waste < minAreaWaste) {
            minAreaWaste = waste; bestRowsData = currentRowsData; bestStats = stats;
          }
        }
      }
    }

    if (!bestStats) bestStats = { aFull: 0, aHalf: 0, bFull: 0, bHalf: 0, custom: 0, totalAreaUsed: 0 };
    return { ...wall, letter: wall.displayId, length: wallLengthMeters, height: wallHeightMeters, rows: bestRowsData.reverse(), stats: bestStats };
  };

  const handleCalculateProject = () => {
    let projectWalls: any[] = [];
    let globalStats = { aFull: 0, aHalf: 0, bFull: 0, bHalf: 0, custom: 0, totalAreaUsed: 0 };

    floors.forEach(floor => {
        let cornerAdjustments: Record<string, number> = {};
        const extWalls = floor.walls.filter((w: any) => w.type === 'Външна');
        
        for(let i=0; i<extWalls.length; i++) {
            for(let j=i+1; j<extWalls.length; j++) {
                const w1 = extWalls[i];
                const w2 = extWalls[j];
                const pts1 = [{x: w1.coords.x1, y: w1.coords.y1}, {x: w1.coords.x2, y: w1.coords.y2}];
                const pts2 = [{x: w2.coords.x1, y: w2.coords.y1}, {x: w2.coords.x2, y: w2.coords.y2}];

                let connected = false;
                for(let p1 of pts1) {
                    for(let p2 of pts2) {
                        if (Math.hypot(p1.x - p2.x, p1.y - p2.y) < 5) connected = true;
                    }
                }
                if (connected) {
                    cornerAdjustments[w1.id] = (cornerAdjustments[w1.id] || 0) + 0.10;
                }
            }
        }

        floor.walls.forEach((wall: any) => {
            const structuralLength = wall.length + (cornerAdjustments[wall.id] || 0);
            const optimized = optimizeWall(structuralLength, wall.height, wall);
            
            if (optimized && optimized.stats) {
                projectWalls.push({...optimized, floorName: floor.name});
                globalStats.aFull += optimized.stats.aFull;
                globalStats.aHalf += optimized.stats.aHalf;
                globalStats.bFull += optimized.stats.bFull;
                globalStats.bHalf += optimized.stats.bHalf;
                globalStats.custom += optimized.stats.custom;
                globalStats.totalAreaUsed += optimized.stats.totalAreaUsed;
            }
        });
    });

    setProjectResult({ walls: projectWalls, globalStats });
    setViewMode('3D');
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedImageUrl(URL.createObjectURL(file)); 
  };

  const Scene3D = ({ walls }: any) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    walls.forEach((w: any) => {
        minX = Math.min(minX, w.coords.x1, w.coords.x2);
        maxX = Math.max(maxX, w.coords.x1, w.coords.x2);
        minY = Math.min(minY, w.coords.y1, w.coords.y2);
        maxY = Math.max(maxY, w.coords.y1, w.coords.y2);
    });
    const centerX = minX === Infinity ? 0 : (minX + maxX) / 2;
    const centerY = minY === Infinity ? 0 : (minY + maxY) / 2;
    const scale = pixelsPerMeter || 50;

    return (
      <Canvas camera={{ position: [0, 20, 30], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 30, 10]} intensity={1.5} castShadow />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        
        <group position={[0, -2, 0]}>
            {walls.map((wall: any, wIdx: number) => {
                const cx = (wall.coords.x1 + wall.coords.x2) / 2;
                const cy = (wall.coords.y1 + wall.coords.y2) / 2;
                const posX = (cx - centerX) / scale;
                const posZ = (cy - centerY) / scale;
                
                const dx = wall.coords.x2 - wall.coords.x1;
                const dy = wall.coords.y2 - wall.coords.y1;
                const rotY = -Math.atan2(dy, dx);

                return (
                    <group key={`wall-group-${wall.id}`} position={[posX, 0, posZ]} rotation={[0, rotY, 0]}>
                        <Text position={[0, wall.height + 0.5, 0]} fontSize={0.3} color="#14b8a6" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf">
                            {wall.letter} ({wall.type})
                        </Text>
                        
                        <group position={[-wall.length / 2, 0, 0]}>
                            {wall.rows.map((r: any, rIdx: number) => {
                                let currentX = 0, currentY = 0;
                                for(let i=0; i<rIdx; i++) currentY += wall.rows[i].height;

                                return r.panels.map((p: any, pIdx: number) => {
                                    const pX = currentX + p.width / 2;
                                    const pY = currentY + r.height / 2;
                                    currentX += p.width;
                                    let color = wall.type === 'Външна' ? '#e2e8f0' : '#f8fafc'; 
                                    if (p.type === 'custom') color = "#ffedd5";

                                    return (
                                        <mesh key={`panel-${rIdx}-${pIdx}-${wall.id}`} position={[pX, pY, 0]}>
                                            <boxGeometry args={[p.width, r.height, wall.type === 'Външна' ? 0.20 : 0.10]} />
                                            <meshStandardMaterial color={color} />
                                            <Edges scale={1} threshold={15} color="#334155" />
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
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-24 pb-20 px-4 relative overflow-hidden flex flex-col">
      
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 h-16">
        <div className="flex items-center justify-between px-6 py-3 max-w-[1800px] mx-auto h-full">
          <div className="flex items-center gap-8">
            <Link href="/">
              <Image src="/logo.png" alt="БИОЗИД" width={100} height={30} priority className="cursor-pointer" />
            </Link>
            
            {/* ДОБАВЕНО ОСНОВНО МЕНЮ НА САЙТА */}
            <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600 uppercase tracking-widest">
                <Link href="/" className="hover:text-teal-600 transition">Начало</Link>
                <Link href="/about" className="hover:text-teal-600 transition">За нас</Link>
                <Link href="/panels" className="hover:text-teal-600 transition">Панели</Link>
                <Link href="/calculator" className="text-teal-600 border-b-2 border-teal-600 pb-1">Калкулатор</Link>
                <Link href="/contacts" className="hover:text-teal-600 transition">Контакти</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Мерна единица:</span>
                  <select value={unit} onChange={(e) => setUnit(e.target.value as any)} className="bg-slate-100 text-teal-700 text-xs font-bold p-2 rounded outline-none cursor-pointer border border-slate-200 focus:border-teal-500">
                      <option value="cm">Сантиметри (cm)</option>
                      <option value="m">Метри (m)</option>
                  </select>
              </div>
              <button onClick={() => setViewMode(viewMode === '2D' ? '3D' : '2D')} className="bg-slate-900 text-white text-xs font-bold px-6 py-2 rounded uppercase tracking-wider hover:bg-teal-600 transition shadow">
                  {viewMode === '2D' ? 'Към 3D Модел' : 'Към CAD Чертеж'}
              </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 gap-6 max-w-[1800px] mx-auto w-full h-[calc(100vh-8rem)]">
        
        {/* ЛЯВ ПАНЕЛ */}
        <div className="w-80 flex flex-col gap-4 bg-white p-5 rounded-xl shadow-lg border border-slate-200 overflow-y-auto">
            
            {!uploadedImageUrl ? (
                <div className="flex flex-col gap-3">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-teal-300 border-dashed rounded cursor-pointer bg-teal-50 hover:bg-teal-100 transition text-center p-4 group">
                        <span className="text-[10px] text-teal-800 font-bold uppercase">1. Качи подложка (чертеж)</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                    <div className="bg-slate-50 p-3 rounded text-[10px] text-slate-600 leading-relaxed border border-slate-100">
                        Подложката е основата, върху която трябва да начертаете външните и вътрешните стени. 
                        Тя служи за мащабиране на вашия проект.
                        <br /><br />
                        <strong>Поддържани формати:</strong> .jpg, .png, .pdf (като изображение)
                    </div>
                </div>
            ) : (
                <>
                    {/* ПАНЕЛ ЗА ИНСТРУКЦИИ СПРЯМО КАЛИБРОВКАТА */}
                    {!pixelsPerMeter ? (
                        <div className="bg-orange-50 border border-orange-200 p-3 rounded text-xs text-orange-800 leading-relaxed shadow-inner">
                            <strong>Важно: Калибриране на мащаба!</strong><br/>
                            Изберете "Чертай Стена" и очертайте стена, чиято дължина знаете. Това ще определи точния мащаб на целия чертеж!
                        </div>
                    ) : (
                        <div className="bg-teal-50 border border-teal-200 p-3 rounded text-xs text-teal-800 leading-relaxed shadow-inner">
                            <strong>Мащабът е зададен!</strong><br/>
                            Може да продължите с чертането. За промяна на размер, кликнете върху неговата стойност в списъка по-долу.
                        </div>
                    )}

                    <div className="border-b border-slate-100 pb-4 mt-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">2. Инструменти за Чертане</h3>
                        
                        <div className="flex gap-2 mb-3 bg-slate-100 p-1 rounded">
                            <button onClick={() => setWallType('Външна')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition ${wallType === 'Външна' ? 'bg-white shadow text-teal-700' : 'text-slate-500 hover:text-slate-700'}`}>Външна Стена</button>
                            <button onClick={() => setWallType('Вътрешна')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition ${wallType === 'Вътрешна' ? 'bg-white shadow text-slate-700' : 'text-slate-500 hover:text-slate-700'}`}>Вътрешна Стена</button>
                        </div>

                        <div className="grid grid-cols-1 gap-2 mb-2">
                            <button onClick={() => setDrawingMode(drawingMode === 'wall' ? 'none' : 'wall')} className={`p-2 text-[10px] font-bold uppercase rounded border transition ${drawingMode === 'wall' ? 'bg-teal-600 text-white border-teal-700 shadow-inner' : 'bg-white text-slate-700 hover:bg-teal-50 border-slate-200'}`}>{drawingMode === 'wall' ? 'Спри чертането' : 'Чертай Стена'}</button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Списък Елементи ({getActiveWalls().length})</h3>
                        <ul className="space-y-2 overflow-y-auto pr-1 flex-1">
                            {getActiveWalls().map((w: any) => {
                                const displayLength = unit === 'cm' ? (w.length * 100).toFixed(1) : w.length.toFixed(2);
                                
                                return (
                                    <li key={`list-${w.id}`} className="bg-slate-50 p-2 rounded border border-slate-200 text-xs flex flex-col gap-1 shadow-sm hover:border-teal-300 transition">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-700">Стена {w.displayId} <span className="text-[10px] font-normal text-slate-400">({w.type})</span></span>
                                            
                                            {editingWallId === w.id ? (
                                                <div className="flex items-center gap-1">
                                                    <input 
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => handleWallLengthEdit(w.id)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleWallLengthEdit(w.id)}
                                                        className="w-16 p-1 text-right border border-teal-500 rounded text-xs outline-none bg-white font-bold text-teal-800"
                                                    />
                                                    <span className="text-[10px] text-slate-400">{unit}</span>
                                                </div>
                                            ) : (
                                                <span 
                                                    className="font-black text-teal-600 cursor-pointer hover:underline underline-offset-2 decoration-teal-300 px-1 rounded hover:bg-teal-50 transition"
                                                    onClick={() => { setEditingWallId(w.id); setEditValue(displayLength); }}
                                                    title="Кликни за редакция"
                                                >
                                                    {displayLength} {unit}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <button onClick={handleCalculateProject} disabled={getActiveWalls().length === 0} className={`w-full text-white py-3 mt-2 rounded text-xs font-bold uppercase tracking-widest shadow-lg transition ${getActiveWalls().length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-500'}`}>
                        Изгради 3D Модел
                    </button>
                </>
            )}
        </div>

        {/* РАБОТНО ПРОСТРАНСТВО */}
        <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 relative overflow-hidden flex flex-col">
            
            {viewMode === '2D' && (
                <div className={`flex-1 bg-slate-100 relative overflow-hidden ${drawingMode !== 'none' ? 'cursor-crosshair' : 'cursor-default'}`}>
                    
                    {/* ПЛАВАЩ БУТОН ЗА ВРЪЩАНЕ НАЗАД ВДЯСНО */}
                    {uploadedImageUrl && (
                        <div className="absolute top-4 right-4 z-20">
                             <button 
                                onClick={handleUndo} 
                                disabled={actionHistory.length === 0} 
                                className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition ${actionHistory.length > 0 ? 'bg-white shadow-lg text-slate-700 hover:bg-slate-900 hover:text-white border border-slate-200' : 'bg-white/50 text-slate-400 cursor-not-allowed border border-transparent'}`}
                            >
                                <span>Назад</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded ${actionHistory.length > 0 ? 'bg-slate-100 text-slate-500' : 'bg-transparent text-slate-300'}`}>Ctrl+Z</span>
                            </button>
                        </div>
                    )}

                    <div className="absolute inset-0 z-10 w-full h-full">
                         <canvas ref={canvasRef} className="w-full h-full" />
                    </div>
                    {!uploadedImageUrl && (
                        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest bg-white">
                            Качете чертеж от лявото меню, за да започнете проектирането
                        </div>
                    )}
                </div>
            )}

            {viewMode === '3D' && (
                <div className="flex-1 bg-slate-50 flex flex-col relative">
                    {projectResult ? (
                        <>
                            <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur p-5 rounded-xl shadow-xl border border-slate-200 min-w-[300px]">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-600 border-b border-slate-100 pb-3 mb-3">Производствена Спецификация</h3>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between"><span className="text-slate-500">Общо цели панели:</span><span className="font-bold">{projectResult.globalStats.aFull + projectResult.globalStats.bFull} бр.</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Къстъм срязове:</span><span className="font-bold text-orange-500">{projectResult.globalStats.custom} бр.</span></div>
                                    <div className="flex justify-between pt-2 border-t border-slate-100"><span className="text-slate-500">Защипване ъгли:</span><span className="font-bold text-teal-600">Активно (+10см)</span></div>
                                    <div className="flex justify-between pt-2 mt-2 border-t border-slate-200"><span className="text-slate-600 font-bold uppercase">Обща квадратура:</span><span className="font-black text-teal-600 text-sm">{projectResult.globalStats.totalAreaUsed.toFixed(1)} м²</span></div>
                                </div>
                                <button onClick={() => setIsOrderModalOpen(true)} className="w-full mt-5 bg-slate-900 text-white py-3 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-teal-600 transition shadow">Изпрати за Оферта</button>
                            </div>
                            <Scene3D walls={projectResult.walls} />
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                            Начертайте стени в 2D режим и генерирайте модела
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>

      {/* МОДАЛ ЗА КАЛИБРИРАНЕ НА ПЪРВАТА СТЕНА */}
      {calibrationModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center border-t-4 border-teal-500">
                  <h2 className="font-bold text-lg text-slate-800 mb-2">Калибриране на проекта</h2>
                  <p className="text-xs text-slate-500 mb-6 font-light">Въведете реалните размери на току-що начертаната стена. Това ще настрои автоматично мащаба за всички измервания.</p>
                  
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col gap-1 text-left">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Реална дължина</label>
                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <input 
                                type="number" 
                                value={calibInput} 
                                onChange={(e) => setCalibInput(e.target.value)} 
                                placeholder="Дължина" 
                                className="w-full bg-transparent text-lg font-bold text-slate-800 outline-none text-right"
                                autoFocus
                            />
                            <span className="font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded text-sm">{unit}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Височина на стената</label>
                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <input 
                                type="number" 
                                value={calibHeightInput} 
                                onChange={(e) => setCalibHeightInput(e.target.value)} 
                                placeholder="Височина" 
                                className="w-full bg-transparent text-lg font-bold text-slate-800 outline-none text-right"
                            />
                            <span className="font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded text-sm">{unit}</span>
                        </div>
                    </div>
                  </div>

                  <button onClick={handleCalibrationSubmit} disabled={!calibInput} className={`w-full text-white p-3 rounded text-xs font-bold uppercase tracking-widest transition shadow ${calibInput ? 'bg-teal-600 hover:bg-slate-900' : 'bg-slate-300 cursor-not-allowed'}`}>Запази Настройките</button>
              </div>
          </div>
      )}
      
      {/* МОДАЛ ЗА ОФЕРТА */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h2 className="font-bold text-lg text-slate-800">Изпрати запитване</h2>
                  <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-400 hover:text-slate-800 text-2xl leading-none">&times;</button>
              </div>
              <p className="text-xs text-slate-500 mb-6 font-light">Спецификацията и 3D CAD моделът ще бъдат изпратени към инженерите за остойностяване.</p>
              <input type="text" placeholder="Име" className="w-full p-3 mb-4 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-teal-500 transition"/>
              <input type="tel" placeholder="Телефон" className="w-full p-3 mb-6 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-teal-500 transition"/>
              
              {orderStatus === 'idle' ? (
                  <button onClick={() => {setOrderStatus('sending'); setTimeout(()=> {setOrderStatus('success'); setTimeout(()=> {setIsOrderModalOpen(false); setOrderStatus('idle');}, 2000)}, 1500)}} className="w-full bg-teal-600 text-white p-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition shadow-lg">Изпрати</button>
              ) : orderStatus === 'sending' ? (
                  <div className="w-full flex justify-center py-3"><div className="w-6 h-6 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div></div>
              ) : (
                  <button className="w-full bg-green-500 text-white p-3 rounded text-xs font-bold uppercase tracking-widest">Успешно изпратено</button>
              )}
          </div>
        </div>
      )}
    </main>
  );
}