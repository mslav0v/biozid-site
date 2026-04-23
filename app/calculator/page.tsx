"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Edges } from '@react-three/drei';
import * as THREE from 'three';

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

const PANEL_A = PANEL_TYPES[0]; 
const PANEL_B = PANEL_TYPES[1]; 

const getWallLetter = (index: number) => String.fromCharCode(65 + index);
const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

function calculatePolygonArea(points: {x: number, y: number}[]) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    let j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

function TemplateInfo() {
  const searchParams = useSearchParams();
  const templateArea = searchParams.get('templateArea');
  const modelName = searchParams.get('modelName');

  if (!templateArea || !modelName) return null;

  return (
    <div className="bg-teal-50 border border-teal-200 p-3 rounded mb-4 text-xs text-teal-800 leading-relaxed shadow-inner">
      <strong>Избран модел: {modelName}</strong><br/>
      Ориентировъчна площ: {templateArea} м². 
      Качете чертеж на терена си по-долу и начертайте външните стени, за да изчислим точната спецификация за панелите.
    </div>
  );
}

export default function Calculator() {
  const [unit, setUnit] = useState<'cm' | 'm'>('cm');
  
  const [floors, setFloors] = useState<any[]>([
    { id: 1, name: 'Етаж 1', walls: [], markedPoints: [], underlay: null, ppm: null, height: 2.80, bgOffsetX: 0, bgOffsetY: 0, bgScale: 1 }
  ]);
  const [activeFloorId, setActiveFloorId] = useState<number>(1);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [globalWallHeight, setGlobalWallHeight] = useState<number>(2.80);
  
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientLocation, setClientLocation] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<any>(null);
  const [drawingMode, setDrawingMode] = useState<'none' | 'wall' | 'point'>('none'); 
  const [wallType, setWallType] = useState<'Външна' | 'Вътрешна'>('Външна');
  
  const [pixelsPerMeter, setPixelsPerMeter] = useState<number | null>(null);
  const [calibrationModal, setCalibrationModal] = useState<boolean>(false);
  const [calibAreaInput, setCalibAreaInput] = useState<string>(''); 
  const [calibHeightInput, setCalibHeightInput] = useState<string>('280');

  const [editingWallId, setEditingWallId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editHeightValue, setEditHeightValue] = useState<string>('');

  const [actionHistory, setActionHistory] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [projectResult, setProjectResult] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const stateRefs = useRef({
      drawingMode, wallType, floors, activeFloorId, activeFloorIndex: floors.findIndex(f => f.id === activeFloorId), unit, pixelsPerMeter, actionHistory, globalWallHeight
  });

  useEffect(() => {
      stateRefs.current = { drawingMode, wallType, floors, activeFloorId, activeFloorIndex: floors.findIndex(f => f.id === activeFloorId), unit, pixelsPerMeter, actionHistory, globalWallHeight };
  }, [drawingMode, wallType, floors, activeFloorId, unit, pixelsPerMeter, actionHistory, globalWallHeight]);

  const activeFloor = floors.find(f => f.id === activeFloorId);

  useEffect(() => {
    if (activeFloor) {
      setUploadedImageUrl(activeFloor.underlay);
      setPixelsPerMeter(activeFloor.ppm);
      setGlobalWallHeight(activeFloor.height);
    }
  }, [activeFloorId, floors]);

  const handleAddFloor = () => {
      const newId = floors.length > 0 ? Math.max(...floors.map(f => f.id)) + 1 : 1;
      const inheritPpm = floors[0]?.ppm || null;
      const newFloor = { id: newId, name: `Етаж ${newId}`, walls: [], markedPoints: [], underlay: null, ppm: inheritPpm, height: 2.80, bgOffsetX: 0, bgOffsetY: 0, bgScale: 1 };
      setFloors(prev => [...prev, newFloor]);
      setActiveFloorId(newId);
      setViewMode('2D'); // Автоматично превключване към 2D
  };

  const saveWallToState = (wallId: string, displayId: string, lengthInMeters: number, coords: any) => {
      const newWall = {
          id: wallId, displayId: displayId, length: lengthInMeters, height: stateRefs.current.globalWallHeight, type: stateRefs.current.wallType, cutouts: [], coords: coords 
      };
      setFloors(prev => prev.map((floor) => {
          if (floor.id !== stateRefs.current.activeFloorId) return floor;
          return { ...floor, walls: [...floor.walls, newWall] };
      }));
      setActionHistory(prev => [...prev, { type: 'wall', floorId: stateRefs.current.activeFloorId, elementId: wallId }]);
  };

  const updateCanvasBackground = useCallback((imageUrl: string | null, offsetX = 0, offsetY = 0, customScale = 1) => {
    if (!fabricCanvas.current || !fabric) return;
    const canvas = fabricCanvas.current;

    // Изчистване на подложката, ако няма такава за етажа
    if (!imageUrl) {
        if (typeof canvas.setBackgroundImage === 'function') {
            canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
        } else {
            canvas.backgroundImage = null;
            canvas.renderAll();
        }
        return;
    }

    const nativeImg = new window.Image();
    nativeImg.onload = () => {
      const FabricImageClass = fabric.FabricImage || fabric.Image;
      const img = new FabricImageClass(nativeImg);
      const canvasW = canvas.width || canvas.getWidth?.() || 800;
      const canvasH = canvas.height || canvas.getHeight?.() || 600;
      
      const baseScale = Math.min(canvasW / img.width, canvasH / img.height) * 0.9;
      const finalScale = baseScale * customScale;
      
      img.set({ 
          originX: 'center', originY: 'center', 
          left: (canvasW / 2) + offsetX, 
          top: (canvasH / 2) + offsetY, 
          scaleX: finalScale, scaleY: finalScale, 
          opacity: 0.5, selectable: false, evented: false 
      });
      
      if (typeof canvas.setBackgroundImage === 'function') {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      } else { 
        canvas.backgroundImage = img; 
        canvas.renderAll(); 
      }
    };
    nativeImg.src = imageUrl;
  }, []);

  useEffect(() => {
    if (viewMode === '2D' && activeFloor) {
        updateCanvasBackground(activeFloor.underlay, activeFloor.bgOffsetX, activeFloor.bgOffsetY, activeFloor.bgScale);
    }
  }, [activeFloor?.underlay, activeFloor?.bgOffsetX, activeFloor?.bgOffsetY, activeFloor?.bgScale, viewMode, updateCanvasBackground]);

  const adjustBg = (type: 'x' | 'y' | 'scale', val: number) => {
      setFloors(prev => prev.map(f => {
          if (f.id === activeFloorId) {
              const newF = { ...f };
              if (type === 'x') newF.bgOffsetX = (f.bgOffsetX || 0) + val;
              if (type === 'y') newF.bgOffsetY = (f.bgOffsetY || 0) + val;
              if (type === 'scale') newF.bgScale = Math.max(0.1, (f.bgScale || 1) + val);
              return newF;
          }
          return f;
      }));
  };

  const getSafePointer = (o: any, canvas: any) => {
      if (!canvas) return { x: 0, y: 0 };
      if (typeof canvas.getPointer === 'function') return canvas.getPointer(o.e);
      if (o.scenePoint) return o.scenePoint;
      if (o.pointer) return o.pointer;
      
      const rect = canvas.getElement().getBoundingClientRect();
      return {
          x: (o.e.clientX || o.e.touches?.[0]?.clientX) - rect.left,
          y: (o.e.clientY || o.e.touches?.[0]?.clientY) - rect.top
      };
  };

  // --- КОРИГИРАНА ФУНКЦИЯ ЗА ПУНКТИРИ И ПОДРЕЖДАНЕ НА ТОЧКИ ---
  const redrawGuideLines = useCallback((canvas: any, points: any[]) => {
      if (!canvas) return;
      
      // Премахваме старите линии
      const objects = canvas.getObjects();
      objects.forEach((obj: any) => {
          if (obj.customType === 'guide-line') canvas.remove(obj);
      });
      
      // Добавяме новите пунктирани линии
      if (points.length > 1) {
          for (let i = 1; i < points.length; i++) {
              const line = new fabric.Line([points[i-1].x, points[i-1].y, points[i].x, points[i].y], {
                  stroke: 'rgba(244, 63, 94, 0.6)', strokeWidth: 2, strokeDashArray: [5, 5], selectable: false, evented: false, customType: 'guide-line'
              });
              canvas.add(line);
          }
      }
      // Затваряме фигурата визуално
      if (points.length > 2) {
          const line = new fabric.Line([points[points.length-1].x, points[points.length-1].y, points[0].x, points[0].y], {
              stroke: 'rgba(244, 63, 94, 0.6)', strokeWidth: 2, strokeDashArray: [5, 5], selectable: false, evented: false, customType: 'guide-line'
          });
          canvas.add(line);
      }

      // Изтегляме всички червени точки най-отпред, за да не се закриват от линиите
      canvas.getObjects().forEach((obj: any) => {
          if (obj.type === 'circle') {
              if (typeof canvas.bringToFront === 'function') canvas.bringToFront(obj);
              else if (typeof obj.bringToFront === 'function') obj.bringToFront();
          }
      });

      canvas.renderAll();
  }, []);

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
          if (lastAction.type === 'wall') {
            return { ...floor, walls: floor.walls.filter((w: any) => w.id !== lastAction.elementId) };
          }
          if (lastAction.type === 'point') {
            const newPoints = floor.markedPoints.filter((p: any) => p.id !== lastAction.elementId);
            if (fabricCanvas.current) redrawGuideLines(fabricCanvas.current, newPoints);
            return { ...floor, markedPoints: newPoints };
          }
          return floor;
      }));

      setActionHistory(prev => prev.slice(0, -1));
  }, [redrawGuideLines]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); handleUndo(); } };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  useEffect(() => {
    if (typeof window !== 'undefined' && canvasRef.current && viewMode === '2D' && fabric) {
      
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
      }

      fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
        width: canvasRef.current.parentElement?.clientWidth || 800,
        height: canvasRef.current.parentElement?.clientHeight || 600,
        selection: false,
      });

      const canvas = fabricCanvas.current;

      let isDrawing = false;
      let currentLine: any = null;
      let startX = 0;
      let startY = 0;
      let tempElementId = '';

      const applyMagneticSnap = (pt: {x: number, y: number}, excludePointId?: string) => {
          let snapX = pt.x; 
          let snapY = pt.y; 
          let minDist = 30;

          stateRefs.current.floors.forEach(f => {
              f.markedPoints.forEach((p: any) => {
                  if (p.id === excludePointId) return; 
                  let d = Math.hypot(pt.x - p.x, pt.y - p.y);
                  if (d < minDist) { minDist = d; snapX = p.x; snapY = p.y; }
              });
              f.walls.forEach((w: any) => {
                  let d1 = Math.hypot(pt.x - w.coords.x1, pt.y - w.coords.y1);
                  if (d1 < minDist) { minDist = d1; snapX = w.coords.x1; snapY = w.coords.y1; }
                  
                  let d2 = Math.hypot(pt.x - w.coords.x2, pt.y - w.coords.y2);
                  if (d2 < minDist) { minDist = d2; snapX = w.coords.x2; snapY = w.coords.y2; }
              });
          });
          return { x: snapX, y: snapY };
      };

      canvas.on('mouse:down', (o: any) => {
        if (o.target && o.target.type === 'circle') return;

        let pointer = getSafePointer(o, canvas);
        if (!pointer) return;
        pointer = applyMagneticSnap(pointer);

        if (stateRefs.current.drawingMode === 'point') {
            const pointId = generateUniqueId();
            const circle = new fabric.Circle({ 
                radius: 4, fill: '#f43f5e', left: pointer.x, top: pointer.y, // РАДИУС 4 ЗА ФИННИ ТОЧКИ
                originX: 'center', originY: 'center', customId: pointId, 
                selectable: true, hasControls: false, hasBorders: false, hoverCursor: 'move' 
            });
            canvas.add(circle);
            
            const currentFloor = stateRefs.current.floors[stateRefs.current.activeFloorIndex];
            const newPoints = [...currentFloor.markedPoints, { id: pointId, x: pointer.x, y: pointer.y }];
            
            setFloors(prev => prev.map(f => f.id === stateRefs.current.activeFloorId ? { ...f, markedPoints: newPoints } : f));
            setActionHistory(prev => [...prev, { type: 'point', floorId: stateRefs.current.activeFloorId, elementId: pointId }]);
            
            redrawGuideLines(canvas, newPoints);
            return;
        }

        if (stateRefs.current.drawingMode === 'none') return;
        isDrawing = true;
        
        startX = pointer.x; startY = pointer.y;
        tempElementId = generateUniqueId();
        
        let strokeColor = stateRefs.current.wallType === 'Външна' ? '#0d9488' : '#64748b'; 
        let strokeWidth = stateRefs.current.wallType === 'Външна' ? 6 : 4;

        currentLine = new fabric.Line([startX, startY, startX, startY], {
          strokeWidth, fill: strokeColor, stroke: strokeColor, originX: 'center', originY: 'center', selectable: false, evented: false, strokeLineCap: 'round', customId: tempElementId
        });
        canvas.add(currentLine);
      });

      canvas.on('mouse:move', (o: any) => {
        if (!isDrawing || !currentLine) return;
        let pointer = getSafePointer(o, canvas);
        if (!pointer) return;

        pointer = applyMagneticSnap(pointer);

        let snapX = pointer.x; let snapY = pointer.y;
        
        if (stateRefs.current.drawingMode === 'wall') {
            let dx = pointer.x - startX; let dy = pointer.y - startY;
            let angle = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
            
            if (snapX === pointer.x && snapY === pointer.y) {
               if (angle < 8 || angle > 172) snapY = startY; 
               else if (Math.abs(angle - 90) < 8) snapX = startX;
            }
        }
        currentLine.set({ x2: snapX, y2: snapY });
        canvas.renderAll();
      });

      canvas.on('mouse:up', () => {
        if (!isDrawing || !currentLine) return;
        isDrawing = false;
        
        const lengthInPixels = Math.hypot(currentLine.x2 - currentLine.x1, currentLine.y2 - currentLine.y1);
        const coords = { x1: currentLine.x1, y1: currentLine.y1, x2: currentLine.x2, y2: currentLine.y2 };
        
        if (lengthInPixels < 5) {
            canvas.remove(currentLine); currentLine = null; return;
        }

        const mode = stateRefs.current.drawingMode;
        const currentFloor = stateRefs.current.floors[stateRefs.current.activeFloorIndex];

        if (mode === 'wall') {
            const displayId = getWallLetter(currentFloor.walls.length);
            const wallId = `wall-${tempElementId}`;
            currentLine.set({ customId: wallId });

            if (!stateRefs.current.pixelsPerMeter) {
                alert("Моля, първо калибрирайте етажа, като маркирате ъглите му и въведете общата площ.");
                canvas.remove(currentLine);
                setDrawingMode('none');
            } else {
                const lengthInMeters = lengthInPixels / stateRefs.current.pixelsPerMeter;
                saveWallToState(wallId, displayId, lengthInMeters, coords);
            }
        } 
        currentLine = null;
      });

      // --- ВЛАЧЕНЕ НА ЪГЛИТЕ ---
      canvas.on('object:moving', (o: any) => {
          if (o.target && o.target.type === 'circle') {
              let snapped = applyMagneticSnap({ x: o.target.left, y: o.target.top }, o.target.customId);
              o.target.set({ left: snapped.x, top: snapped.y });

              const currentFloor = stateRefs.current.floors[stateRefs.current.activeFloorIndex];
              const pointId = o.target.customId;
              const newPoints = currentFloor.markedPoints.map((p: any) => 
                  p.id === pointId ? { ...p, x: snapped.x, y: snapped.y } : p
              );
              redrawGuideLines(canvas, newPoints);
          }
      });

      canvas.on('object:modified', (o: any) => {
          if (o.target && o.target.type === 'circle') {
              const pointId = o.target.customId;
              setFloors(prev => prev.map(f => {
                  if (f.id === stateRefs.current.activeFloorId) {
                      return { ...f, markedPoints: f.markedPoints.map((p: any) => p.id === pointId ? { ...p, x: o.target.left, y: o.target.top } : p) };
                  }
                  return f;
              }));
          }
      });

      // Зареждаме съществуващите обекти за етажа
      const currentFloorData = stateRefs.current.floors[stateRefs.current.activeFloorIndex];
      if (currentFloorData) {
        
        const prevFloor = stateRefs.current.floors.find(f => f.id === currentFloorData.id - 1);
        if (prevFloor) {
            prevFloor.walls.forEach((w: any) => {
                const line = new fabric.Line([w.coords.x1, w.coords.y1, w.coords.x2, w.coords.y2], {
                    strokeWidth: 4, stroke: '#94a3b8', strokeDashArray: [5, 5], opacity: 0.5, selectable: false, evented: false
                });
                canvas.add(line);
            });
        }

        currentFloorData.walls.forEach((w: any) => {
            let strokeColor = w.type === 'Външна' ? '#0d9488' : '#64748b'; 
            let strokeWidth = w.type === 'Външна' ? 6 : 4;
            const line = new fabric.Line([w.coords.x1, w.coords.y1, w.coords.x2, w.coords.y2], {
              strokeWidth, fill: strokeColor, stroke: strokeColor, originX: 'center', originY: 'center', selectable: false, evented: false, strokeLineCap: 'round', customId: w.id
            });
            canvas.add(line);
        });

        if (currentFloorData.markedPoints.length > 0) {
            currentFloorData.markedPoints.forEach((p: any) => {
                const circle = new fabric.Circle({ 
                    radius: 4, fill: '#f43f5e', left: p.x, top: p.y, // РАДИУС 4
                    originX: 'center', originY: 'center', customId: p.id, 
                    selectable: true, hasControls: false, hasBorders: false, hoverCursor: 'move'
                });
                canvas.add(circle);
            });
            redrawGuideLines(canvas, currentFloorData.markedPoints);
        }
      }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeFloorId, redrawGuideLines]); 

  const handleWallEditSave = (wallId: string) => {
      const newL = parseFloat(editValue);
      const newH = parseFloat(editHeightValue);
      if(!newL || newL <= 0 || !newH || newH <= 0) { setEditingWallId(null); return; }

      const newLengthInMeters = unit === 'cm' ? newL / 100 : newL;
      const newHeightInMeters = unit === 'cm' ? newH / 100 : newH;
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

          const newX2 = wall.coords.x1 + Math.cos(angle) * newLengthInPixels;
          const newY2 = wall.coords.y1 + Math.sin(angle) * newLengthInPixels;

          const updatedWalls = floor.walls.map((w: any) => {
              if (w.id === wallId) {
                  if (fabricCanvas.current) {
                      const obj = fabricCanvas.current.getObjects().find((o:any) => o.customId === w.id);
                      if (obj) { obj.set({ x2: newX2, y2: newY2 }); }
                  }
                  return { ...w, length: newLengthInMeters, height: newHeightInMeters, coords: { ...w.coords, x2: newX2, y2: newY2 } };
              }

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

  const handleAreaCalibrationSubmit = () => {
      const realArea = parseFloat(calibAreaInput);
      const hVal = parseFloat(calibHeightInput);

      if(!realArea || realArea <= 0 || !hVal || hVal <= 0 || !activeFloor || activeFloor.markedPoints.length < 3) {
          alert("Моля, въведете валидна площ и височина.");
          return;
      }

      const points = activeFloor.markedPoints;
      const pixelArea = calculatePolygonArea(points);
      
      if (pixelArea === 0) {
          alert("Маркираните точки не образуват валиден многоъгълник.");
          return;
      }

      const ppm = Math.sqrt(pixelArea / realArea);
      const wallHeightInMeters = unit === 'cm' ? hVal / 100 : hVal;
      
      setPixelsPerMeter(ppm);
      setGlobalWallHeight(wallHeightInMeters);

      const newWalls: any[] = [];
      for (let i = 0; i < points.length; i++) {
          const p1 = points[i];
          const p2 = points[(i + 1) % points.length];
          const lengthInPixels = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const wallId = `wall-auto-${generateUniqueId()}`;
          const displayId = getWallLetter(activeFloor.walls.length + newWalls.length);

          newWalls.push({
              id: wallId, displayId: displayId, length: lengthInPixels / ppm, height: wallHeightInMeters, type: 'Външна', cutouts: [], coords: { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
          });
      }
      
      setFloors(prev => prev.map(f => {
          if (f.id === activeFloorId) return { ...f, ppm: ppm, height: wallHeightInMeters, walls: [...f.walls, ...newWalls], markedPoints: [] };
          return f;
      }));

      if (fabricCanvas.current) {
          fabricCanvas.current.getObjects().forEach((obj: any) => {
              if (obj.type === 'circle' || obj.customType === 'guide-line') fabricCanvas.current.remove(obj);
          });
          fabricCanvas.current.renderAll();
      }

      setCalibrationModal(false); 
      setCalibAreaInput(''); 
      setDrawingMode('wall');
  };

  const handleGenerateWallsOnly = () => {
      if (!activeFloor || activeFloor.markedPoints.length < 3 || !pixelsPerMeter) return;
      
      const points = activeFloor.markedPoints;
      const wallHeightInMeters = activeFloor.height || globalWallHeight;
      const newWalls: any[] = [];
      
      for (let i = 0; i < points.length; i++) {
          const p1 = points[i];
          const p2 = points[(i + 1) % points.length];
          const lengthInPixels = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const wallId = `wall-auto-${generateUniqueId()}`;
          const displayId = getWallLetter(activeFloor.walls.length + newWalls.length);

          newWalls.push({
              id: wallId, displayId: displayId, length: lengthInPixels / pixelsPerMeter, height: wallHeightInMeters, type: 'Външна', cutouts: [], coords: { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
          });
      }
      
      setFloors(prev => prev.map(f => {
          if (f.id === activeFloorId) return { ...f, walls: [...f.walls, ...newWalls], markedPoints: [] };
          return f;
      }));

      if (fabricCanvas.current) {
          fabricCanvas.current.getObjects().forEach((obj: any) => {
              if (obj.type === 'circle' || obj.customType === 'guide-line') fabricCanvas.current.remove(obj);
          });
          fabricCanvas.current.renderAll();
      }
      setDrawingMode('wall');
  };

  const getActiveWalls = () => floors.find(f => f.id === activeFloorId)?.walls || [];

  const optimizeWallCore = (wallLengthMeters: number, wallHeightMeters: number, wall: any, isHorizontal: boolean) => {
    let minAreaWaste = Infinity;
    let bestRowsData: any[] = [];
    let bestStats = null;

    const pA = isHorizontal ? { ...PANEL_A, w: PANEL_A.h, h: PANEL_A.w } : PANEL_A;
    const pB = isHorizontal ? { ...PANEL_B, w: PANEL_B.h, h: PANEL_B.w } : PANEL_B;

    const maxRowsA = Math.ceil(wallHeightMeters / pA.h) + 1;
    const maxRowsB = Math.ceil(wallHeightMeters / pB.h) + 1;

    for (let aRows = 0; aRows <= maxRowsA; aRows++) {
      for (let bRows = 0; bRows <= maxRowsB; bRows++) {
        if (aRows === 0 && bRows === 0) continue;
        let currentTotalHeight = (aRows * pA.h) + (bRows * pB.h);
        
        if (currentTotalHeight >= wallHeightMeters) {
          let sequence = [];
          let tempA = aRows, tempB = bRows;
          while (tempA > 0 || tempB > 0) {
            if (tempA > 0) { sequence.push(pA); tempA--; }
            if (tempB > 0) { sequence.push(pB); tempB--; }
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

    if (!bestStats) bestStats = { aFull: 0, aHalf: 0, bFull: 0, bHalf: 0, custom: 0, totalAreaUsed: Infinity };
    return { ...wall, letter: wall.displayId, length: wallLengthMeters, height: wallHeightMeters, rows: bestRowsData.reverse(), stats: bestStats, orientation: isHorizontal ? 'Хор' : 'Верт' };
  };

  const optimizeWall = (length: number, height: number, wall: any) => {
      const vertical = optimizeWallCore(length, height, wall, false);
      const horizontal = optimizeWallCore(length, height, wall, true);
      return horizontal.stats.totalAreaUsed < vertical.stats.totalAreaUsed ? horizontal : vertical;
  };

  const handleCalculateProject = () => {
    let projectWalls: any[] = [];
    let globalStats = { aFull: 0, aHalf: 0, bFull: 0, bHalf: 0, custom: 0, totalAreaUsed: 0 };
    
    let allProcessedWalls: any[] = [];
    let currentElevation = 0;

    floors.forEach((floor, fIndex) => {
        let cornerAdjustments: Record<string, number> = {};
        const extWalls = floor.walls.filter((w: any) => w.type === 'Външна');
        
        for(let i=0; i<extWalls.length; i++) {
            for(let j=i+1; j<extWalls.length; j++) {
                const w1 = extWalls[i]; const w2 = extWalls[j];
                const pts1 = [{x: w1.coords.x1, y: w1.coords.y1}, {x: w1.coords.x2, y: w1.coords.y2}];
                const pts2 = [{x: w2.coords.x1, y: w2.coords.y1}, {x: w2.coords.x2, y: w2.coords.y2}];

                let connected = false;
                for(let p1 of pts1) {
                    for(let p2 of pts2) {
                        if (Math.hypot(p1.x - p2.x, p1.y - p2.y) < 5) connected = true;
                    }
                }
                if (connected) { cornerAdjustments[w1.id] = (cornerAdjustments[w1.id] || 0) + 0.10; }
            }
        }

        floor.walls.forEach((wall: any) => {
            allProcessedWalls.push({
                ...wall,
                floorIndex: fIndex,
                structuralLength: wall.length + (cornerAdjustments[wall.id] || 0),
                baseElevation: currentElevation,
                merged: false 
            });
        });
        currentElevation += floor.height || globalWallHeight;
    });

    for (let i = 0; i < allProcessedWalls.length; i++) {
        let w1 = allProcessedWalls[i];
        if (w1.merged || w1.type !== 'Външна') continue;

        let totalMergedHeight = w1.height;
        let mergedFloors = [w1.floorIndex];

        for (let j = i + 1; j < allProcessedWalls.length; j++) {
            let w2 = allProcessedWalls[j];
            if (w2.merged || w2.type !== 'Външна' || w2.floorIndex <= w1.floorIndex) continue;

            const d1 = Math.hypot(w1.coords.x1 - w2.coords.x1, w1.coords.y1 - w2.coords.y1);
            const d2 = Math.hypot(w1.coords.x2 - w2.coords.x2, w1.coords.y2 - w2.coords.y2);
            const d3 = Math.hypot(w1.coords.x1 - w2.coords.x2, w1.coords.y1 - w2.coords.y2); 
            const d4 = Math.hypot(w1.coords.x2 - w2.coords.x1, w1.coords.y2 - w2.coords.y1);

            if ((d1 < 35 && d2 < 35) || (d3 < 35 && d4 < 35)) {
                totalMergedHeight += w2.height;
                w2.merged = true;
                mergedFloors.push(w2.floorIndex);
            }
        }

        const optimized = optimizeWall(w1.structuralLength, totalMergedHeight, w1);
        
        if (optimized && optimized.stats) {
            projectWalls.push({
                ...optimized, 
                floorName: `Етаж ${w1.floorIndex + 1}${mergedFloors.length > 1 ? `-${mergedFloors[mergedFloors.length-1]+1}` : ''}`, 
                elevation: w1.baseElevation, 
                floorId: floors[w1.floorIndex].id 
            });
            globalStats.aFull += optimized.stats.aFull;
            globalStats.aHalf += optimized.stats.aHalf;
            globalStats.bFull += optimized.stats.bFull;
            globalStats.bHalf += optimized.stats.bHalf;
            globalStats.custom += optimized.stats.custom;
            globalStats.totalAreaUsed += optimized.stats.totalAreaUsed;
        }
    }

    setProjectResult({ walls: projectWalls, globalStats, floorsData: floors });
    setViewMode('3D');
  };

 const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setUploadedImageUrl(b64); 
      setFloors(prev => prev.map(f => f.id === activeFloorId ? { ...f, underlay: b64 } : f));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitQuote = async () => {
    if (!clientName || !clientPhone || !clientLocation) {
      alert("Моля, попълнете всички Ваши данни, включително населено място.");
      return;
    }
    setOrderStatus('sending');
    try {
      const payload = {
        clientName, clientPhone, clientLocation,
        totalArea: projectResult?.globalStats.totalAreaUsed || 0,
        underlayUrl: floors[0].underlay,
        cadData: projectResult?.walls || []
      };
      const res = await fetch('/api/quotes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (res.ok) {
        setOrderStatus('success');
        setTimeout(() => { setIsOrderModalOpen(false); setOrderStatus('idle'); }, 2000);
      } else { throw new Error(); }
    } catch (err) {
      alert("Възникна грешка при изпращането.");
      setOrderStatus('idle');
    }
  };

  const Scene3D = ({ project }: any) => {
    const walls = project.walls;
    const baseFloors = project.floorsData;
    
    const floor1 = walls.filter((w: any) => w.floorId === 1);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    (floor1.length ? floor1 : walls).forEach((w: any) => {
        minX = Math.min(minX, w.coords.x1, w.coords.x2);
        maxX = Math.max(maxX, w.coords.x1, w.coords.x2);
        minY = Math.min(minY, w.coords.y1, w.coords.y2);
        maxY = Math.max(maxY, w.coords.y1, w.coords.y2);
    });
    const centerX = minX === Infinity ? 0 : (minX + maxX) / 2;
    const centerY = minY === Infinity ? 0 : (minY + maxY) / 2;

    return (
      <Canvas camera={{ position: [0, 20, 30], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 30, 10]} intensity={1.5} castShadow />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        
        <group position={[0, -5, 0]}>
            {baseFloors.map((fl: any, idx: number) => {
                if (fl.walls.length < 3) return null;
                
                let fMinX = Infinity, fMaxX = -Infinity, fMinY = Infinity, fMaxY = -Infinity;
                fl.walls.forEach((w: any) => {
                    fMinX = Math.min(fMinX, w.coords.x1, w.coords.x2); fMaxX = Math.max(fMaxX, w.coords.x1, w.coords.x2);
                    fMinY = Math.min(fMinY, w.coords.y1, w.coords.y2); fMaxY = Math.max(fMaxY, w.coords.y1, w.coords.y2);
                });
                
                const flW = (fMaxX - fMinX) / (fl.ppm || 50);
                const flD = (fMaxY - fMinY) / (fl.ppm || 50);
                const cX = ((fMinX + fMaxX) / 2 - centerX) / (fl.ppm || 50);
                const cZ = ((fMinY + fMaxY) / 2 - centerY) / (fl.ppm || 50);
                
                let elev = 0;
                for(let i=0; i<idx; i++) elev += baseFloors[i].height;

                return (
                    <mesh key={`slab-${fl.id}`} position={[cX, elev, cZ]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[flW + 0.2, flD + 0.2]} />
                        <meshStandardMaterial color="#cbd5e1" side={THREE.DoubleSide} />
                    </mesh>
                );
            })}

            {walls.map((wall: any) => {
                const ppm = baseFloors.find((f:any) => f.id === wall.floorId)?.ppm || 50;
                const cx = (wall.coords.x1 + wall.coords.x2) / 2;
                const cy = (wall.coords.y1 + wall.coords.y2) / 2;
                const posX = (cx - centerX) / ppm;
                const posZ = (cy - centerY) / ppm;
                
                const dx = wall.coords.x2 - wall.coords.x1;
                const dy = wall.coords.y2 - wall.coords.y1;
                const rotY = -Math.atan2(dy, dx);

                return (
                    <group key={`wall-group-${wall.id}`} position={[posX, wall.elevation, posZ]} rotation={[0, rotY, 0]}>
                        <Text position={[0, wall.height + 0.5, 0]} fontSize={0.3} color="#14b8a6" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf">
                            {wall.letter} ({wall.orientation})
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
        <div className="w-80 flex flex-col gap-4 bg-white p-5 rounded-xl shadow-lg border border-slate-200 overflow-y-auto z-20">
            
            <Suspense fallback={<div className="text-xs text-slate-400">Зареждане на данни...</div>}>
               <TemplateInfo />
            </Suspense>

            {/* ИЗБОР НА ЕТАЖ С ДОБАВЯНЕ */}
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-1">
                 <h3 className="text-[10px] font-bold uppercase text-slate-400">Етаж за чертане</h3>
                 <button onClick={handleAddFloor} className="text-[10px] font-bold text-teal-600 hover:text-teal-800 uppercase tracking-widest flex items-center gap-1">+ Нов Етаж</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {floors.map(f => (
                  <button key={f.id} onClick={() => { setActiveFloorId(f.id); setViewMode('2D'); }} className={`px-3 py-2 text-[10px] font-bold rounded border transition ${activeFloorId === f.id && viewMode === '2D' ? 'bg-teal-600 text-white border-teal-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {!uploadedImageUrl ? (
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-teal-300 border-dashed rounded cursor-pointer bg-teal-50 hover:bg-teal-100 transition text-center p-4 group">
                        <span className="text-[10px] text-teal-800 font-bold uppercase">1. Качи подложка за {activeFloor?.name}</span>
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
                    {/* Контролен панел за нагласяне на подложка (показва се само за етаж 2+) */}
                    {activeFloorId > 1 && (
                        <div className="bg-slate-100 p-2 rounded mb-1 border border-slate-200">
                            <span className="text-[10px] font-bold uppercase text-slate-500 mb-2 block text-center">Подравняване на чертежа</span>
                            <div className="grid grid-cols-3 gap-1 mb-1 max-w-[150px] mx-auto">
                                <div></div>
                                <button onClick={() => adjustBg('y', -10)} className="bg-white rounded shadow text-xs py-1 hover:bg-teal-50">⬆️</button>
                                <div></div>
                                <button onClick={() => adjustBg('x', -10)} className="bg-white rounded shadow text-xs py-1 hover:bg-teal-50">⬅️</button>
                                <button onClick={() => adjustBg('y', 10)} className="bg-white rounded shadow text-xs py-1 hover:bg-teal-50">⬇️</button>
                                <button onClick={() => adjustBg('x', 10)} className="bg-white rounded shadow text-xs py-1 hover:bg-teal-50">➡️</button>
                            </div>
                            <div className="flex gap-1 justify-center max-w-[150px] mx-auto">
                                <button onClick={() => adjustBg('scale', -0.02)} className="flex-1 bg-white rounded shadow text-xs py-1 font-bold text-slate-500 hover:bg-teal-50">-</button>
                                <span className="text-[10px] flex items-center px-1 text-slate-400">Мащаб</span>
                                <button onClick={() => adjustBg('scale', 0.02)} className="flex-1 bg-white rounded shadow text-xs py-1 font-bold text-slate-500 hover:bg-teal-50">+</button>
                            </div>
                        </div>
                    )}

                    {!pixelsPerMeter ? (
                        <div className="bg-orange-50 border-2 border-orange-400 p-4 rounded-xl shadow-inner">
                            <strong className="text-orange-900 uppercase tracking-wide text-xs block mb-2">⚠️ Задължително: Калибриране!</strong>
                            <span className="text-xs text-orange-800 leading-relaxed font-medium">
                                Изберете "Маркирай ъгъл" и очертайте ъглите <strong className="text-rose-600 text-sm uppercase underline decoration-2 underline-offset-4">последователно в кръг</strong> по контура на сградата.
                            </span>
                        </div>
                    ) : (
                        <div className="bg-teal-50 border border-teal-200 p-3 rounded text-xs text-teal-800 leading-relaxed shadow-inner">
                            <strong>Мащабът е зададен!</strong><br/>
                            Може да продължите с чертането. Можете и да местите ъглите, за да ги нагласите перфектно.
                        </div>
                    )}

                    <div className="border-b border-slate-100 pb-4 mt-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">2. Инструменти за Чертане</h3>
                        
                        <div className="flex gap-2 mb-3 bg-slate-100 p-1 rounded">
                            <button onClick={() => setWallType('Външна')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition ${wallType === 'Външна' ? 'bg-white shadow text-teal-700' : 'text-slate-500 hover:text-slate-700'}`}>Външна Стена</button>
                            <button onClick={() => setWallType('Вътрешна')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition ${wallType === 'Вътрешна' ? 'bg-white shadow text-slate-700' : 'text-slate-500 hover:text-slate-700'}`}>Вътрешна Стена</button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <button onClick={() => setDrawingMode(drawingMode === 'point' ? 'none' : 'point')} className={`p-2 text-[10px] font-bold uppercase rounded border transition ${drawingMode === 'point' ? 'bg-rose-500 text-white border-rose-600 shadow-inner' : 'bg-white text-slate-700 hover:bg-rose-50 border-slate-200'}`}>
                                {drawingMode === 'point' ? 'Спри' : 'Маркирай ъгъл'}
                            </button>
                            <button onClick={() => setDrawingMode(drawingMode === 'wall' ? 'none' : 'wall')} className={`p-2 text-[10px] font-bold uppercase rounded border transition ${drawingMode === 'wall' ? 'bg-teal-600 text-white border-teal-700 shadow-inner' : 'bg-white text-slate-700 hover:bg-teal-50 border-slate-200'}`}>
                                {drawingMode === 'wall' ? 'Спри чертане' : 'Чертай Стена'}
                            </button>
                        </div>
                        
                        {activeFloor && activeFloor.markedPoints.length >= 3 && (
                           <button onClick={() => {
                               if (pixelsPerMeter) handleGenerateWallsOnly();
                               else setCalibrationModal(true); 
                           }} className="w-full mt-2 bg-slate-900 text-white p-2 rounded text-[10px] font-bold uppercase hover:bg-teal-600 transition shadow">
                               {pixelsPerMeter ? 'Очертай автоматично' : `Калибрирай по площ (${activeFloor.markedPoints.length} точки)`}
                           </button>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Списък Елементи ({getActiveWalls().length})</h3>
                        <ul className="space-y-2 overflow-y-auto pr-1 flex-1">
                            {getActiveWalls().map((w: any) => {
                                const displayLength = unit === 'cm' ? (w.length * 100).toFixed(1) : w.length.toFixed(2);
                                const displayHeight = unit === 'cm' ? (w.height * 100).toFixed(0) : w.height.toFixed(2);
                                
                                return (
                                    <li key={`list-${w.id}`} className="bg-slate-50 p-2 rounded border border-slate-200 text-xs flex flex-col gap-1 shadow-sm hover:border-teal-300 transition text-slate-800">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">Стена {w.displayId} <span className="text-[10px] font-normal text-slate-400">({w.type})</span></span>
                                            
                                            {editingWallId === w.id ? (
                                                <div className="flex items-center gap-1">
                                                    <input 
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-12 p-1 text-right border border-teal-500 rounded text-xs outline-none bg-white font-bold text-teal-800"
                                                        placeholder="Дължина"
                                                    />
                                                    <input 
                                                        value={editHeightValue}
                                                        onChange={(e) => setEditHeightValue(e.target.value)}
                                                        className="w-12 p-1 text-right border border-orange-500 rounded text-xs outline-none bg-white font-bold text-orange-800"
                                                        placeholder="Височина"
                                                    />
                                                    <button onClick={() => handleWallEditSave(w.id)} className="bg-teal-600 text-white px-2 py-1 rounded text-[10px] font-bold">OK</button>
                                                </div>
                                            ) : (
                                                <span 
                                                    className="font-black text-teal-600 cursor-pointer hover:underline underline-offset-2 decoration-teal-300 px-1 rounded hover:bg-teal-50 transition"
                                                    onClick={() => { setEditingWallId(w.id); setEditValue(displayLength); setEditHeightValue(displayHeight); }}
                                                    title="Кликни за редакция на Дължина и Височина"
                                                >
                                                    L: {displayLength} / H: {displayHeight} {unit}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <button onClick={handleCalculateProject} disabled={floors.every(f => f.walls.length === 0)} className={`w-full text-white py-3 mt-2 rounded text-xs font-bold uppercase tracking-widest shadow-lg transition ${floors.every(f => f.walls.length === 0) ? 'bg-slate-300 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-500'}`}>
                        Изгради 3D Модел
                    </button>
                </>
            )}
        </div>

        {/* РАБОТНО ПРОСТРАНСТВО */}
        <div key={viewMode} className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 relative overflow-hidden flex flex-col">
            
            {viewMode === '2D' && (
                <div className={`flex-1 bg-slate-100 relative overflow-hidden ${drawingMode !== 'none' ? 'cursor-crosshair' : 'cursor-default'}`}>
                    
                    <div className="absolute top-4 right-4 z-40">
                        {uploadedImageUrl && (
                             <button 
                                onClick={handleUndo} 
                                disabled={actionHistory.length === 0} 
                                className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition ${actionHistory.length > 0 ? 'bg-white shadow-lg text-slate-700 hover:bg-slate-900 hover:text-white border border-slate-200' : 'bg-white/50 text-slate-400 cursor-not-allowed border border-transparent'}`}
                            >
                                <span>Назад</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded ${actionHistory.length > 0 ? 'bg-slate-100 text-slate-500' : 'bg-transparent text-slate-300'}`}>Ctrl+Z</span>
                            </button>
                        )}
                    </div>

                    <div className="absolute inset-0 z-10 w-full h-full">
                         <canvas ref={canvasRef} className="w-full h-full" />
                    </div>

                    {!uploadedImageUrl && (
                        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest bg-white">
                            Качете чертеж от лявото меню, за да започнете проектирането на {activeFloor?.name}
                        </div>
                    )}
                </div>
            )}

            {viewMode === '3D' && (
                <div className="flex-1 bg-slate-50 flex flex-col relative text-slate-800">
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
                                <button onClick={() => setIsOrderModalOpen(true)} className="w-full mt-5 bg-slate-900 text-white py-3 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-teal-600 transition shadow">Изпрати запитване</button>
                            </div>
                            <Scene3D project={projectResult} />
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

      {/* МОДАЛ ЗА КАЛИБРИРАНЕ ЧРЕЗ ПЛОЩ */}
      {calibrationModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in text-slate-800">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center border-t-4 border-teal-500 relative">
                  <button onClick={() => setCalibrationModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-xl leading-none">&times;</button>
                  <h2 className="font-bold text-lg mb-2">Калибриране чрез Площ</h2>
                  <p className="text-xs text-slate-500 mb-6 font-light">Въведете общата квадратура на маркирания етаж и стандартната му височина.</p>
                  
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col gap-1 text-left">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Обща площ на етажа (кв.м.)</label>
                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <input 
                                type="number" 
                                value={calibAreaInput} 
                                onChange={(e) => setCalibAreaInput(e.target.value)} 
                                placeholder="Напр. 100" 
                                className="w-full bg-transparent text-lg font-bold outline-none text-right"
                                autoFocus
                            />
                            <span className="font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded text-sm">m²</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Височина на етажа ({unit})</label>
                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <input 
                                type="number" 
                                value={calibHeightInput} 
                                onChange={(e) => setCalibHeightInput(e.target.value)} 
                                placeholder="Височина" 
                                className="w-full bg-transparent text-lg font-bold outline-none text-right"
                            />
                            <span className="font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded text-sm">{unit}</span>
                        </div>
                    </div>
                  </div>

                  <button onClick={handleAreaCalibrationSubmit} disabled={!calibAreaInput} className={`w-full text-white p-3 rounded text-xs font-bold uppercase tracking-widest transition shadow ${calibAreaInput ? 'bg-teal-600 hover:bg-slate-900' : 'bg-slate-300 cursor-not-allowed'}`}>
                      Запази и Авто-генерирай
                  </button>
              </div>
          </div>
      )}
      
      {/* МОДАЛ ЗА ОФЕРТА */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in text-slate-800">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h2 className="font-bold text-lg">Изпрати запитване</h2>
                  <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-400 hover:text-slate-800 text-2xl leading-none">&times;</button>
              </div>
              <p className="text-xs text-slate-500 mb-6 font-light">Спецификацията и пълният CAD модел ще бъдат изпратени към инженерите за остойностяване.</p>
              
              <div className="space-y-4 mb-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Вашето Име</label>
                  <input 
                    type="text" 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-teal-500 transition font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Телефон за връзка</label>
                  <input 
                    type="tel" 
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-teal-500 transition font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Населено място (Обект)</label>
                  <input 
                    type="text" 
                    value={clientLocation}
                    onChange={(e) => setClientLocation(e.target.value)}
                    className="w-full p-3 bg-slate-100 border border-teal-200 rounded text-sm outline-none focus:border-teal-500 transition font-bold text-teal-800"
                    placeholder="Напр. София"
                  />
                </div>
              </div>
              
              {orderStatus === 'idle' ? (
                  <button onClick={handleSubmitQuote} className="w-full bg-teal-600 text-white p-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition shadow-lg">Изпрати</button>
              ) : orderStatus === 'sending' ? (
                  <div className="w-full flex justify-center py-3"><div className="w-6 h-6 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div></div>
              ) : orderStatus === 'success' ? (
                  <button className="w-full bg-green-500 text-white p-3 rounded text-xs font-bold uppercase tracking-widest">Успешно изпратено!</button>
              ) : (
                <button onClick={handleSubmitQuote} className="w-full bg-red-600 text-white p-3 rounded text-xs font-bold uppercase">Грешка. Опитай пак.</button>
              )}
          </div>
        </div>
      )}
    </main>
  );
}