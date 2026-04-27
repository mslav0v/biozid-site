"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Edges } from '@react-three/drei';
import * as THREE from 'three'; 
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
    { id: 1, name: 'Етаж 1', walls: [], markedPoints: [], underlay: null, ppm: null, height: 2.80, bgOffsetX: 0, bgOffsetY: 0, bgScaleX: 1, bgScaleY: 1 }
  ]);
  const [activeFloorId, setActiveFloorId] = useState<number>(1);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [globalWallHeight, setGlobalWallHeight] = useState<number>(2.80);
  
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState(''); 
  const [clientLocation, setClientLocation] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<any>(null);
  const adjustIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [drawingMode, setDrawingMode] = useState<'none' | 'wall' | 'point' | 'move-bg' | 'calibrate'>('none'); 
  const [wallType, setWallType] = useState<'Външна' | 'Вътрешна'>('Външна');
  
  const [pixelsPerMeter, setPixelsPerMeter] = useState<number | null>(null);
  const [calibrationModal, setCalibrationModal] = useState<boolean>(false);
  const [calibLinePixels, setCalibLinePixels] = useState<number | null>(null);
  const [calibAreaInput, setCalibAreaInput] = useState<string>(''); 
  const [calibLengthInput, setCalibLengthInput] = useState<string>(''); 
  const [calibHeightInput, setCalibHeightInput] = useState<string>('280');

  const [editingWallId, setEditingWallId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editHeightValue, setEditHeightValue] = useState<string>('');

  const [actionHistory, setActionHistory] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [projectResult, setProjectResult] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const [filter3DFloor, setFilter3DFloor] = useState<number | 'all'>('all');

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
      const inheritPpm = floors.length > 0 ? floors[floors.length - 1].ppm : null;
      const newFloor = { id: newId, name: `Етаж ${newId}`, walls: [], markedPoints: [], underlay: null, ppm: inheritPpm, height: 2.80, bgOffsetX: 0, bgOffsetY: 0, bgScaleX: 1, bgScaleY: 1 };
      setFloors(prev => [...prev, newFloor]);
      setActiveFloorId(newId);
      setViewMode('2D'); 
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

  const updateCanvasBackground = useCallback((imageUrl: string | null, offsetX = 0, offsetY = 0, customScaleX = 1, customScaleY = 1) => {
    if (!fabricCanvas.current || !fabric) return;
    const canvas = fabricCanvas.current;

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
      const finalScaleX = baseScale * customScaleX;
      const finalScaleY = baseScale * customScaleY;
      
      img.set({ 
          originX: 'center', originY: 'center', 
          left: (canvasW / 2) + offsetX, 
          top: (canvasH / 2) + offsetY, 
          scaleX: finalScaleX, scaleY: finalScaleY, 
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
        updateCanvasBackground(activeFloor.underlay, activeFloor.bgOffsetX, activeFloor.bgOffsetY, activeFloor.bgScaleX, activeFloor.bgScaleY);
    }
  }, [activeFloor?.underlay, activeFloor?.bgOffsetX, activeFloor?.bgOffsetY, activeFloor?.bgScaleX, activeFloor?.bgScaleY, viewMode, updateCanvasBackground]);

  const setBgDirectly = (type: 'x' | 'y' | 'scaleX' | 'scaleY', valDelta: number) => {
      setFloors(prev => prev.map(f => {
          if (f.id === activeFloorId) {
              const newF = { ...f };
              if (type === 'x') newF.bgOffsetX = (newF.bgOffsetX || 0) + valDelta;
              if (type === 'y') newF.bgOffsetY = (newF.bgOffsetY || 0) + valDelta;
              if (type === 'scaleX') newF.bgScaleX = Math.max(0.01, (newF.bgScaleX || 1) + valDelta);
              if (type === 'scaleY') newF.bgScaleY = Math.max(0.01, (newF.bgScaleY || 1) + valDelta);
              return newF;
          }
          return f;
      }));
  };

  const startAdjust = (type: 'x' | 'y' | 'scaleX' | 'scaleY', valDelta: number) => {
      setBgDirectly(type, valDelta);
      adjustIntervalRef.current = setInterval(() => {
          setBgDirectly(type, valDelta);
      }, 50);
  };

  const stopAdjust = () => {
      if (adjustIntervalRef.current) {
          clearInterval(adjustIntervalRef.current);
          adjustIntervalRef.current = null;
      }
  };

  const getSafePointer = (o: any, canvas: any) => {
      if (!canvas) return { x: 0, y: 0 };
      if (o.scenePoint) return o.scenePoint;
      if (o.pointer) return o.pointer;
      
      try {
          if (typeof canvas.getPointer === 'function' && o.e) {
              return canvas.getPointer(o.e);
          }
      } catch (e) {
      }
      
      const rect = canvas.getElement().getBoundingClientRect();
      return {
          x: (o.e?.clientX || o.e?.touches?.[0]?.clientX || 0) - rect.left,
          y: (o.e?.clientY || o.e?.touches?.[0]?.clientY || 0) - rect.top
      };
  };

  const redrawGuideLines = useCallback((canvas: any, points: any[], isCalibratingState: boolean = false) => {
      if (!canvas) return;
      
      const objects = canvas.getObjects();
      objects.forEach((obj: any) => {
          if (obj.customType === 'guide-line') canvas.remove(obj);
      });
      
      if (points.length > 1) {
          for (let i = 1; i < points.length; i++) {
              const isFirstLine = i === 1 && isCalibratingState;
              const lineStroke = isFirstLine ? '#ef4444' : 'rgba(244, 63, 94, 0.6)';
              const strokeW = isFirstLine ? 4 : 2;
              
              const line = new fabric.Line([points[i-1].x, points[i-1].y, points[i].x, points[i].y], {
                  stroke: lineStroke, strokeWidth: strokeW, strokeDashArray: [5, 5], selectable: false, evented: false, customType: 'guide-line'
              });
              canvas.add(line);
          }
      }
      if (points.length > 2) {
          const line = new fabric.Line([points[points.length-1].x, points[points.length-1].y, points[0].x, points[0].y], {
              stroke: 'rgba(244, 63, 94, 0.6)', strokeWidth: 2, strokeDashArray: [5, 5], selectable: false, evented: false, customType: 'guide-line'
          });
          canvas.add(line);
      }

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

      const currentBgFloor = stateRefs.current.floors[stateRefs.current.activeFloorIndex];
      if (currentBgFloor && currentBgFloor.underlay) {
          updateCanvasBackground(currentBgFloor.underlay, currentBgFloor.bgOffsetX, currentBgFloor.bgOffsetY, currentBgFloor.bgScaleX, currentBgFloor.bgScaleY);
      }

      let isDrawing = false;
      let currentLine: any = null;
      let startX = 0;
      let startY = 0;
      let tempElementId = '';
      
      let isDraggingBg = false;
      let lastBgPosX = 0;
      let lastBgPosY = 0;

      const applyMagneticSnap = (pt: {x: number, y: number}, excludePointId?: string) => {
          let snapX = pt.x; 
          let snapY = pt.y; 
          let minDist = 30;

          const activeIdx = stateRefs.current.activeFloorIndex;
          const floorsToCheck = [];
          if (stateRefs.current.floors[activeIdx]) floorsToCheck.push(stateRefs.current.floors[activeIdx]);
          if (activeIdx > 0 && stateRefs.current.floors[activeIdx - 1]) floorsToCheck.push(stateRefs.current.floors[activeIdx - 1]);

          floorsToCheck.forEach(f => {
              if (!f) return;
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
        if (stateRefs.current.drawingMode === 'move-bg') {
            isDraggingBg = true;
            const pointer = getSafePointer(o, canvas);
            lastBgPosX = pointer.x;
            lastBgPosY = pointer.y;
            return;
        }

        if (o.target && o.target.type === 'circle') return;

        let pointer = getSafePointer(o, canvas);
        if (!pointer) return;
        pointer = applyMagneticSnap(pointer);

        if (stateRefs.current.drawingMode === 'point') {
            const pointId = generateUniqueId();
            const circle = new fabric.Circle({ 
                radius: 4, fill: '#f43f5e', left: pointer.x, top: pointer.y,
                originX: 'center', originY: 'center', customId: pointId, 
                selectable: true, hasControls: false, hasBorders: false, hoverCursor: 'move' 
            });
            canvas.add(circle);
            
            const currentFloor = stateRefs.current.floors[stateRefs.current.activeFloorIndex];
            const newPoints = [...currentFloor.markedPoints, { id: pointId, x: pointer.x, y: pointer.y }];
            
            setFloors(prev => prev.map(f => f.id === stateRefs.current.activeFloorId ? { ...f, markedPoints: newPoints } : f));
            setActionHistory(prev => [...prev, { type: 'point', floorId: stateRefs.current.activeFloorId, elementId: pointId }]);
            
            redrawGuideLines(canvas, newPoints, false);
            return;
        }

        if (stateRefs.current.drawingMode === 'none') return;
        isDrawing = true;
        
        startX = pointer.x; startY = pointer.y;
        tempElementId = generateUniqueId();
        
        let isSecondFloorOrAbove = stateRefs.current.activeFloorId > stateRefs.current.floors[0].id;
        
        let strokeColor = stateRefs.current.drawingMode === 'calibrate' ? '#8b5cf6' : 
            (stateRefs.current.wallType === 'Външна' ? (isSecondFloorOrAbove ? '#3b82f6' : '#0d9488') : '#64748b'); 
        
        let strokeWidth = stateRefs.current.drawingMode === 'calibrate' ? 4 : (stateRefs.current.wallType === 'Външна' ? 6 : 4);

        currentLine = new fabric.Line([startX, startY, startX, startY], {
          strokeWidth, fill: strokeColor, stroke: strokeColor, originX: 'center', originY: 'center', selectable: false, evented: false, strokeLineCap: 'round', customId: tempElementId
        });
        canvas.add(currentLine);
      });

      canvas.on('mouse:move', (o: any) => {
        if (stateRefs.current.drawingMode === 'move-bg' && isDraggingBg) {
            const pointer = getSafePointer(o, canvas);
            const dx = pointer.x - lastBgPosX;
            const dy = pointer.y - lastBgPosY;
            lastBgPosX = pointer.x;
            lastBgPosY = pointer.y;

            if (canvas.backgroundImage) {
                canvas.backgroundImage.left += dx;
                canvas.backgroundImage.top += dy;
                canvas.renderAll();
            }
            return;
        }

        if (!isDrawing || !currentLine) return;
        let pointer = getSafePointer(o, canvas);
        if (!pointer) return;

        pointer = applyMagneticSnap(pointer);

        let snapX = pointer.x; let snapY = pointer.y;
        
        if (stateRefs.current.drawingMode === 'wall' || stateRefs.current.drawingMode === 'calibrate') {
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
        if (stateRefs.current.drawingMode === 'move-bg') {
            isDraggingBg = false;
            if (canvas.backgroundImage) {
                 const canvasW = canvas.width || canvas.getWidth?.() || 800;
                 const canvasH = canvas.height || canvas.getHeight?.() || 600;
                 const finalOffsetX = canvas.backgroundImage.left - (canvasW / 2);
                 const finalOffsetY = canvas.backgroundImage.top - (canvasH / 2);

                 setFloors(prev => prev.map(f => f.id === stateRefs.current.activeFloorId ? { ...f, bgOffsetX: finalOffsetX, bgOffsetY: finalOffsetY } : f));
            }
            return;
        }

        if (!isDrawing || !currentLine) return;
        isDrawing = false;
        
        const lengthInPixels = Math.hypot(currentLine.x2 - currentLine.x1, currentLine.y2 - currentLine.y1);
        const coords = { x1: currentLine.x1, y1: currentLine.y1, x2: currentLine.x2, y2: currentLine.y2 };
        
        if (lengthInPixels < 5) {
            canvas.remove(currentLine); currentLine = null; return;
        }

        const mode = stateRefs.current.drawingMode;
        const currentFloor = stateRefs.current.floors[stateRefs.current.activeFloorIndex];

        if (mode === 'calibrate') {
            setCalibLinePixels(lengthInPixels);
            setCalibrationModal(true);
            canvas.remove(currentLine);
            currentLine = null;
            return;
        }

        if (mode === 'wall') {
            const displayId = getWallLetter(currentFloor.walls.length);
            const wallId = `wall-${tempElementId}`;
            currentLine.set({ customId: wallId });

            if (!stateRefs.current.pixelsPerMeter) {
                alert("Моля, първо калибрирайте етажа, като въведете дължината на начертаната стена.");
                canvas.remove(currentLine);
                setDrawingMode('none');
            } else {
                const lengthInMeters = lengthInPixels / stateRefs.current.pixelsPerMeter;
                saveWallToState(wallId, displayId, lengthInMeters, coords);
            }
        } 
        currentLine = null;
      });

      canvas.on('object:moving', (o: any) => {
          if (o.target && o.target.type === 'circle') {
              let snapped = applyMagneticSnap({ x: o.target.left, y: o.target.top }, o.target.customId);
              o.target.set({ left: snapped.x, top: snapped.y });

              const currentFloor = stateRefs.current.floors[stateRefs.current.activeFloorIndex];
              const pointId = o.target.customId;
              const newPoints = currentFloor.markedPoints.map((p: any) => 
                  p.id === pointId ? { ...p, x: snapped.x, y: snapped.y } : p
              );
              redrawGuideLines(canvas, newPoints, calibrationModal);
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

      const currentFloorData = stateRefs.current.floors[stateRefs.current.activeFloorIndex];
      if (currentFloorData) {
        const prevFloor = stateRefs.current.floors.find(f => f.id === currentFloorData.id - 1);
        if (prevFloor) {
            prevFloor.walls.forEach((w: any) => {
                const line = new fabric.Line([w.coords.x1, w.coords.y1, w.coords.x2, w.coords.y2], {
                    strokeWidth: 4, stroke: '#facc15', strokeDashArray: [6, 6], opacity: 0.8, selectable: false, evented: false
                });
                canvas.add(line);
            });
            if (prevFloor.markedPoints && prevFloor.markedPoints.length > 0) {
                 prevFloor.markedPoints.forEach((p: any) => {
                     const circle = new fabric.Circle({ 
                         radius: 4, fill: '#38bdf8', left: p.x, top: p.y,
                         originX: 'center', originY: 'center', opacity: 0.6,
                         selectable: false, evented: false
                     });
                     canvas.add(circle);
                 });
            }
        }

        currentFloorData.walls.forEach((w: any) => {
            let isSecondFloorOrAbove = currentFloorData.id > stateRefs.current.floors[0].id;
            let strokeColor = w.type === 'Външна' ? (isSecondFloorOrAbove ? '#3b82f6' : '#0d9488') : '#64748b'; 
            let strokeWidth = w.type === 'Външна' ? 6 : 4;
            const line = new fabric.Line([w.coords.x1, w.coords.y1, w.coords.x2, w.coords.y2], {
              strokeWidth, fill: strokeColor, stroke: strokeColor, originX: 'center', originY: 'center', selectable: false, evented: false, strokeLineCap: 'round', customId: w.id
            });
            canvas.add(line);
        });

        if (currentFloorData.markedPoints.length > 0) {
            currentFloorData.markedPoints.forEach((p: any) => {
                const circle = new fabric.Circle({ 
                    radius: 4, fill: '#f43f5e', left: p.x, top: p.y,
                    originX: 'center', originY: 'center', customId: p.id, 
                    selectable: true, hasControls: false, hasBorders: false, hoverCursor: 'move'
                });
                canvas.add(circle);
            });
            redrawGuideLines(canvas, currentFloorData.markedPoints, calibrationModal);
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
  }, [viewMode, activeFloorId, redrawGuideLines, calibrationModal, updateCanvasBackground]); 

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

  const openCalibrationModal = () => {
      setCalibrationModal(true);
      if (fabricCanvas.current && activeFloor && activeFloor.markedPoints.length >= 2) {
          redrawGuideLines(fabricCanvas.current, activeFloor.markedPoints, true); 
      }
  };

  const handleAreaCalibrationSubmit = () => {
      const realLength = parseFloat(calibLengthInput);
      const hVal = parseFloat(calibHeightInput);

      if(!realLength || realLength <= 0 || !hVal || hVal <= 0 || !calibLinePixels) {
          alert("Моля, въведете валидна дължина на стената и височина.");
          return;
      }

      const lengthInMeters = unit === 'cm' ? realLength / 100 : realLength;
      const ppm = calibLinePixels / lengthInMeters;
      const wallHeightInMeters = unit === 'cm' ? hVal / 100 : hVal;
      
      setPixelsPerMeter(ppm);
      setGlobalWallHeight(wallHeightInMeters);

      setFloors(prev => prev.map(f => {
          if (f.id === activeFloorId) return { ...f, ppm: ppm, height: wallHeightInMeters };
          return f;
      }));

      setCalibrationModal(false); 
      setDrawingMode('wall');
      setCalibLinePixels(null); 
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
          const objectsToRemove = fabricCanvas.current.getObjects().filter((obj: any) => obj.type === 'circle' || obj.customType === 'guide-line');
          objectsToRemove.forEach((obj: any) => fabricCanvas.current.remove(obj));
          
          newWalls.forEach((w: any) => {
              let isSecondFloorOrAbove = activeFloor.id > stateRefs.current.floors[0].id;
              let strokeColor = isSecondFloorOrAbove ? '#3b82f6' : '#0d9488'; 
              const line = new fabric.Line([w.coords.x1, w.coords.y1, w.coords.x2, w.coords.y2], {
                  strokeWidth: 6, fill: strokeColor, stroke: strokeColor, originX: 'center', originY: 'center', selectable: false, evented: false, strokeLineCap: 'round', customId: w.id
              });
              fabricCanvas.current.add(line);
          });
          fabricCanvas.current.renderAll();
      }
      setDrawingMode('wall');
      
      alert('Външните стени бяха очертани успешно по контура! Вече можете да начертаете вътрешните стени.');
  };

  const getActiveWalls = () => floors.find(f => f.id === activeFloorId)?.walls || [];

  // --- ВЪРНАТА СТАРА ЛОГИКА ЗА ПОДРЕЖДАНЕ НА ПАНЕЛИТЕ ---
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

    const floorCenters: Record<string, {cx: number, cy: number, ppm: number}> = {};
    floors.forEach(f => {
        const extWalls = f.walls.filter((w:any) => w.type === 'Външна');
        let fMinX = Infinity, fMaxX = -Infinity, fMinY = Infinity, fMaxY = -Infinity;
        const targetWalls = extWalls.length > 0 ? extWalls : f.walls;
        targetWalls.forEach((w:any) => {
            fMinX = Math.min(fMinX, w.coords.x1, w.coords.x2);
            fMaxX = Math.max(fMaxX, w.coords.x1, w.coords.x2);
            fMinY = Math.min(fMinY, w.coords.y1, w.coords.y2);
            fMaxY = Math.max(fMaxY, w.coords.y1, w.coords.y2);
        });
        floorCenters[f.id] = {
            cx: fMinX === Infinity ? 0 : (fMinX + fMaxX) / 2,
            cy: fMinY === Infinity ? 0 : (fMinY + fMaxY) / 2,
            ppm: f.ppm || 50
        };
    });

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
            const fData = floorCenters[floor.id];
            const mX1 = (wall.coords.x1 - fData.cx) / fData.ppm;
            const mY1 = (wall.coords.y1 - fData.cy) / fData.ppm;
            const mX2 = (wall.coords.x2 - fData.cx) / fData.ppm;
            const mY2 = (wall.coords.y2 - fData.cy) / fData.ppm;

            allProcessedWalls.push({
                ...wall,
                floorIndex: fIndex,
                structuralLength: wall.type === 'Външна' ? wall.length + (cornerAdjustments[wall.id] || 0) : wall.length,
                baseElevation: currentElevation,
                merged: false,
                mCoords: { x1: mX1, y1: mY1, x2: mX2, y2: mY2 }
            });
        });
        
        currentElevation += (Number(floor.height) || Number(globalWallHeight));
    });

    for (let i = 0; i < allProcessedWalls.length; i++) {
        let w1 = allProcessedWalls[i];
        if (w1.merged) continue;

        let totalMergedHeight = w1.height;
        let mergedFloors = [w1.floorIndex];
        let lastMergedWall = w1; 

        if (w1.type === 'Външна') {
            for (let j = i + 1; j < allProcessedWalls.length; j++) {
                let w2 = allProcessedWalls[j];
                
                if (w2.merged || w2.type !== 'Външна' || w2.floorIndex !== lastMergedWall.floorIndex + 1) continue;

                const d1 = Math.hypot(lastMergedWall.mCoords.x1 - w2.mCoords.x1, lastMergedWall.mCoords.y1 - w2.mCoords.y1);
                const d2 = Math.hypot(lastMergedWall.mCoords.x2 - w2.mCoords.x2, lastMergedWall.mCoords.y2 - w2.mCoords.y2);
                const d3 = Math.hypot(lastMergedWall.mCoords.x1 - w2.mCoords.x2, lastMergedWall.mCoords.y1 - w2.mCoords.y2); 
                const d4 = Math.hypot(lastMergedWall.mCoords.x2 - w2.mCoords.x1, lastMergedWall.mCoords.y2 - w2.mCoords.y1);

                if ((d1 < 0.2 && d2 < 0.2) || (d3 < 0.2 && d4 < 0.2)) {
                    totalMergedHeight += w2.height;
                    w2.merged = true;
                    mergedFloors.push(w2.floorIndex);
                    lastMergedWall = w2; 
                }
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
            globalStats.aFull += optimized.stats.aFull || 0;
            globalStats.aHalf += optimized.stats.aHalf || 0;
            globalStats.bFull += optimized.stats.bFull || 0;
            globalStats.bHalf += optimized.stats.bHalf || 0;
            globalStats.custom += optimized.stats.custom || 0;
            globalStats.totalAreaUsed += optimized.stats.totalAreaUsed || 0;
        }
    }

    setProjectResult({ walls: projectWalls, globalStats, floorsData: floors });
    setFilter3DFloor(floors[0]?.id || 'all');
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
    if (!clientName || !clientPhone || !clientLocation || !clientEmail) {
      alert("Моля, попълнете всички данни за контакт, включително имейл адрес.");
      return;
    }
    
    setOrderStatus('sending');

    try {
      const payload = {
        clientName, clientPhone, clientLocation, clientEmail,
        totalArea: projectResult?.globalStats.totalAreaUsed || 0,
        floorsData: floors.map(f => ({
            floorId: f.id,
            floorName: f.name,
            walls: projectResult?.walls.filter((w: any) => w.floorId === f.id) || [],
            ppm: f.ppm,
            bgConfig: { x: f.bgOffsetX, y: f.bgOffsetY, scaleX: f.bgScaleX, scaleY: f.bgScaleY }
        })),
        cadData: projectResult?.walls || []
      };

      // 1. Изпращаме заявката за запазване в базата
      await fetch('/api/quotes', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload)
      });

      // 2. Генерираме HTML за техническата спецификация
      let specHtml = `<h3>Техническа спецификация:</h3>`;
      specHtml += `<p><strong>Общо панели:</strong> ${(projectResult?.globalStats.aFull || 0) + (projectResult?.globalStats.bFull || 0)} бр.</p>`;
      specHtml += `<p><strong>Обща квадратура:</strong> ${payload.totalArea.toFixed(2)} м²</p>`;
      specHtml += `<ul>`;
      projectResult?.floorsData.forEach((f: any) => {
          const floorWalls = projectResult.walls.filter((w: any) => w.floorId === f.id);
          if (floorWalls.length > 0) {
              let fArea = 0, fA = 0, fB = 0, fCustom = 0;
              floorWalls.forEach((w: any) => {
                  fArea += w.stats.totalAreaUsed || 0;
                  fA += w.stats.aFull || 0;
                  fB += w.stats.bFull || 0;
                  fCustom += w.stats.custom || 0;
              });
              specHtml += `<li><strong>${f.name}:</strong> Тип А: ${fA} бр, Тип Б: ${fB} бр, Изрязани: ${fCustom} бр. | Площ: ${fArea.toFixed(2)} м²</li>`;
          }
      });
      specHtml += `</ul>`;

      // 3. Подготвяме прикачените файлове за всеки етаж
      const attachments = floors.filter(f => f.underlay).map(f => ({
          filename: `чертеж-${f.name.replace(/\s+/g, '-')}.png`,
          content: f.underlay.split(',')[1],
          contentType: 'image/png'
      }));

      try {
        // Имейл до клиента (Автоматичен отговор)
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: clientEmail,
            from: 'БИОЗИД <no-reply@biozid.bg>', 
            subject: 'Вашето запитване към БИОЗИД е прието успешно',
            html: `<p>Здравейте, ${clientName},</p><p>Вашето запитване за изчисляване на проект с обща площ панели ${payload.totalArea.toFixed(2)} м² е прието успешно.</p>${specHtml}<p>Нашият екип ще се свърже с Вас скоро с конкретна оферта!</p>`,
            type: 'auto_reply'
          })
        });

        // Имейл до администратора с прикачените файлове
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'admin@biozid.bg', 
            from: 'Система БИОЗИД <no-reply@biozid.bg>',
            subject: '🚨 Нова заявка от Калкулатора',
            html: `<p>Имате нова заявка от <strong>${clientName}</strong> (${clientPhone}) за населено място ${clientLocation}.</p><p>Имейл клиент: ${clientEmail}</p><p>Обща площ: ${payload.totalArea.toFixed(2)} кв.м.</p>${specHtml}`,
            attachments: attachments,
            type: 'admin_alert'
          })
        });
      } catch (mailErr) {
        console.error("Грешка при изпращане на имейлите:", mailErr);
      }

      setOrderStatus('success');
      setTimeout(() => { 
        setIsOrderModalOpen(false); 
        setOrderStatus('idle'); 
      }, 2500);

    } catch (err) {
      console.error("Грешка:", err);
      alert("Възникна грешка при изпращането. Моля, проверете конзолата за повече детайли.");
      setOrderStatus('idle');
    }
  };

  const handlePrint = () => {
      window.print();
  };

  const Scene3D = ({ project, viewFloor }: any) => {
    const walls = viewFloor === 'all' ? project.walls : project.walls.filter((w: any) => w.floorId === viewFloor);
    const baseFloors = viewFloor === 'all' ? project.floorsData : project.floorsData.filter((f: any) => f.id === viewFloor);
    
    const floorCenters: Record<string, {cx: number, cy: number, ppm: number}> = {};
    project.floorsData.forEach((fl: any) => {
        const floorWalls = project.walls.filter((w: any) => w.floorId === fl.id);
        const extWalls = floorWalls.filter((w:any) => w.type === 'Външна');
        let fMinX = Infinity, fMaxX = -Infinity, fMinY = Infinity, fMaxY = -Infinity;
        const targetWalls = extWalls.length > 0 ? extWalls : floorWalls;

        targetWalls.forEach((w: any) => {
            fMinX = Math.min(fMinX, w.coords.x1, w.coords.x2);
            fMaxX = Math.max(fMaxX, w.coords.x1, w.coords.x2);
            fMinY = Math.min(fMinY, w.coords.y1, w.coords.y2);
            fMaxY = Math.max(fMaxY, w.coords.y1, w.coords.y2);
        });

        floorCenters[fl.id] = {
            cx: fMinX === Infinity ? 0 : (fMinX + fMaxX) / 2,
            cy: fMinY === Infinity ? 0 : (fMinY + fMaxY) / 2,
            ppm: fl.ppm || 50
        };
    });

    return (
      <Canvas gl={{ preserveDrawingBuffer: true }} camera={{ position: [0, 20, 30], fov: 45 }} className="print:w-full print:h-[500px]">
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 30, 10]} intensity={1.5} castShadow />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        
        <group position={[0, -5, 0]}>
            {baseFloors.map((fl: any, idx: number) => {
                const floorWalls = project.walls.filter((w: any) => w.floorId === fl.id);
                if (floorWalls.length === 0) return null;
                
                let mMinX = Infinity, mMaxX = -Infinity, mMinY = Infinity, mMaxY = -Infinity;
                const fc = floorCenters[fl.id];

                floorWalls.forEach((w: any) => {
                    const mX1 = (w.coords.x1 - fc.cx) / fc.ppm;
                    const mY1 = (w.coords.y1 - fc.cy) / fc.ppm;
                    const mX2 = (w.coords.x2 - fc.cx) / fc.ppm;
                    const mY2 = (w.coords.y2 - fc.cy) / fc.ppm;
                    mMinX = Math.min(mMinX, mX1, mX2);
                    mMaxX = Math.max(mMaxX, mX1, mX2);
                    mMinY = Math.min(mMinY, mY1, mY2);
                    mMaxY = Math.max(mMaxY, mY1, mY2);
                });

                const flW = (mMaxX - mMinX) + 1.0;
                const flD = (mMaxY - mMinY) + 1.0;
                const cX = (mMinX + mMaxX) / 2;
                const cZ = (mMinY + mMaxY) / 2;
                
                let elev = 0;
                const globalIdx = project.floorsData.findIndex((f: any) => f.id === fl.id);
                for(let i=0; i<globalIdx; i++) elev += Number(project.floorsData[i].height);

                return (
                    <mesh key={`red-slab-${fl.id}`} position={[cX, elev - 0.05, cZ]} rotation={[-Math.PI / 2, 0, 0]}>
                        <boxGeometry args={[flW, flD, 0.1]} />
                        <meshStandardMaterial color="#fee2e2" side={THREE.DoubleSide} />
                        <Edges scale={1} threshold={15} color="#ef4444" />
                    </mesh>
                );
            })}

            {walls.map((wall: any) => {
                const fc = floorCenters[wall.floorId];
                const cx = (wall.coords.x1 + wall.coords.x2) / 2;
                const cy = (wall.coords.y1 + wall.coords.y2) / 2;
                const posX = (cx - fc.cx) / fc.ppm;
                const posZ = (cy - fc.cy) / fc.ppm;
                
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
                                    let color = wall.type === 'Външна' ? '#e2e8f0' : '#cbd5e1'; 
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
    <div className="flex flex-col min-h-screen print:bg-white print:text-black">
      <div className="print:hidden"><Navbar /></div>

      <main className="flex-1 bg-slate-50 text-slate-900 font-sans pt-24 pb-20 px-4 relative overflow-hidden flex flex-col print:p-0 print:m-0 print:bg-white print:overflow-visible">
        
        <div className="block lg:hidden bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-xl shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              <strong>Внимание:</strong> Този инструмент работи в пълния си потенциал на десктоп версия. За максимална прецизност при чертане, моля, използвайте компютър.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 gap-6 max-w-[1800px] mx-auto w-full min-h-[600px] lg:h-[calc(100vh-8rem)] print:h-auto print:block">
          
          <div className="w-full lg:w-80 flex flex-col gap-4 bg-white p-5 rounded-xl shadow-lg border border-slate-200 overflow-y-auto z-20 print:hidden">
              
              <Suspense fallback={<div className="text-xs text-slate-400">Зареждане на данни...</div>}>
                 <TemplateInfo />
              </Suspense>

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
                      </div>
                  </div>
              ) : (
                  <>
                      {activeFloorId > 1 && (
                          <div className="bg-slate-100 p-3 rounded-xl mb-1 border border-slate-200">
                              <span className="text-[10px] font-bold uppercase text-slate-500 mb-3 block text-center border-b border-slate-200 pb-2">Напасване на подложката</span>
                              <div className="flex flex-col gap-2 mb-3">
                                  <div className="flex items-center justify-between gap-1">
                                      <span className="text-[10px] font-bold text-slate-500 w-16 leading-tight">Ширина (Scale X)</span>
                                      <button onPointerDown={() => startAdjust('scaleX', -0.005)} onPointerUp={stopAdjust} onPointerLeave={stopAdjust} className="w-6 h-6 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50 select-none">-</button>
                                      <input type="number" step="0.005" value={activeFloor.bgScaleX || 1} onChange={(e) => setBgDirectly('scaleX', parseFloat(e.target.value) - (activeFloor.bgScaleX || 1))} className="w-14 text-[10px] font-bold p-1 text-center border border-slate-200 rounded outline-none" />
                                      <button onPointerDown={() => startAdjust('scaleX', 0.005)} onPointerUp={stopAdjust} onPointerLeave={stopAdjust} className="w-6 h-6 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50 select-none">+</button>
                                  </div>
                                  <div className="flex items-center justify-between gap-1">
                                      <span className="text-[10px] font-bold text-slate-500 w-16 leading-tight">Височина (Scale Y)</span>
                                      <button onPointerDown={() => startAdjust('scaleY', -0.005)} onPointerUp={stopAdjust} onPointerLeave={stopAdjust} className="w-6 h-6 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50 select-none">-</button>
                                      <input type="number" step="0.005" value={activeFloor.bgScaleY || 1} onChange={(e) => setBgDirectly('scaleY', parseFloat(e.target.value) - (activeFloor.bgScaleY || 1))} className="w-14 text-[10px] font-bold p-1 text-center border border-slate-200 rounded outline-none" />
                                      <button onPointerDown={() => startAdjust('scaleY', 0.005)} onPointerUp={stopAdjust} onPointerLeave={stopAdjust} className="w-6 h-6 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50 select-none">+</button>
                                  </div>
                                  <div className="flex items-center justify-between gap-1">
                                      <span className="text-[10px] font-bold text-slate-500 w-16 leading-tight">Хоризонтално (Ляво/Дясно)</span>
                                      <button onPointerDown={() => startAdjust('x', -2)} onPointerUp={stopAdjust} onPointerLeave={stopAdjust} className="w-6 h-6 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50 select-none">-</button>
                                      <input type="number" value={activeFloor.bgOffsetX || 0} onChange={(e) => setBgDirectly('x', parseFloat(e.target.value) - (activeFloor.bgOffsetX || 0))} className="w-14 text-[10px] font-bold p-1 text-center border border-slate-200 rounded outline-none" />
                                      <button onPointerDown={() => startAdjust('x', 2)} onPointerUp={stopAdjust} onPointerLeave={stopAdjust} className="w-6 h-6 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50 select-none">+</button>
                                  </div>
                                  <div className="flex items-center justify-between gap-1">
                                      <span className="text-[10px] font-bold text-slate-500 w-16 leading-tight">Вертикално (Горе/Долу)</span>
                                      <button onPointerDown={() => startAdjust('y', -2)} onPointerUp={stopAdjust} onPointerLeave={stopAdjust} className="w-6 h-6 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50 select-none">-</button>
                                      <input type="number" value={activeFloor.bgOffsetY || 0} onChange={(e) => setBgDirectly('y', parseFloat(e.target.value) - (activeFloor.bgOffsetY || 0))} className="w-14 text-[10px] font-bold p-1 text-center border border-slate-200 rounded outline-none" />
                                      <button onPointerDown={() => startAdjust('y', 2)} onPointerUp={stopAdjust} onPointerLeave={stopAdjust} className="w-6 h-6 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50 select-none">+</button>
                                  </div>
                              </div>
                              <button onClick={() => setDrawingMode(drawingMode === 'move-bg' ? 'none' : 'move-bg')} className={`w-full p-2 text-[10px] font-bold uppercase rounded border transition shadow-sm ${drawingMode === 'move-bg' ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-700 hover:bg-amber-50 border-slate-200'}`}>
                                  {drawingMode === 'move-bg' ? 'Приключи местенето' : 'Наместване с мишка'}
                              </button>
                          </div>
                      )}

                      {!pixelsPerMeter ? (
                          <div className="bg-orange-50 border-2 border-orange-400 p-4 rounded-xl shadow-inner mt-2">
                              <strong className="text-orange-900 uppercase tracking-wide text-xs block mb-2"> Ръководство за калибриране:</strong>
                              <ol className="list-decimal pl-4 text-xs text-orange-800 leading-relaxed font-medium space-y-1">
                                  <li>Изберете инструмента <strong>"Калибратор"</strong> по-долу.</li>
                                  <li>Начертайте линия върху стена (или оразмерителна линия) на чертежа, чиято реална дължина знаете.</li>
                                  <li>Въведете точния размер в метри или сантиметри в прозореца, който ще се появи.</li>
                              </ol>
                          </div>
                      ) : (
                          <div className="bg-teal-50 border border-teal-200 p-3 rounded text-xs text-teal-800 leading-relaxed shadow-inner mt-2">
                              <strong>Мащабът е зададен!</strong><br/>
                              Може да продължите с чертането.
                          </div>
                      )}

                      <div className="border-b border-slate-100 pb-4 mt-2">
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">2. Инструменти за Чертане</h3>
                          
                          <div className="flex gap-2 mb-3 bg-slate-100 p-1 rounded">
                              <button onClick={() => setWallType('Външна')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition ${wallType === 'Външна' ? 'bg-white shadow text-teal-700' : 'text-slate-500 hover:text-slate-700'}`}>Външна</button>
                              <button onClick={() => setWallType('Вътрешна')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition ${wallType === 'Вътрешна' ? 'bg-white shadow text-slate-700' : 'text-slate-500 hover:text-slate-700'}`}>Вътрешна</button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-2">
                              <button onClick={() => setDrawingMode(drawingMode === 'calibrate' ? 'none' : 'calibrate')} className={`p-2 text-[10px] font-bold uppercase rounded border transition ${drawingMode === 'calibrate' ? 'bg-indigo-600 text-white border-indigo-700 shadow-inner' : 'bg-white text-slate-700 hover:bg-indigo-50 border-slate-200'}`}>
                                  {drawingMode === 'calibrate' ? 'Спри' : 'Калибратор'}
                              </button>
                              <button onClick={() => setDrawingMode(drawingMode === 'wall' ? 'none' : 'wall')} className={`p-2 text-[10px] font-bold uppercase rounded border transition ${drawingMode === 'wall' ? 'bg-teal-600 text-white border-teal-700 shadow-inner' : 'bg-white text-slate-700 hover:bg-teal-50 border-slate-200'}`}>
                                  {drawingMode === 'wall' ? 'Спри' : 'Чертай Стена'}
                              </button>
                          </div>

                          <div className="grid grid-cols-1 gap-2 mb-2">
                              <button onClick={() => setDrawingMode(drawingMode === 'point' ? 'none' : 'point')} className={`p-2 text-[10px] font-bold uppercase rounded border transition ${drawingMode === 'point' ? 'bg-rose-500 text-white border-rose-600 shadow-inner' : 'bg-white text-slate-700 hover:bg-rose-50 border-slate-200'}`}>
                                  {drawingMode === 'point' ? 'Спри' : 'Маркирай Контур (Точки)'}
                              </button>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 p-2 mt-2 rounded text-[10px] text-blue-800 leading-relaxed shadow-sm">
                              <strong>Важно:</strong> При чертане по подложката, в зоните с прозорци и врати, моля начертайте стените <strong>цялостно и без прекъсване</strong>. Това е нужно за правилно изчисление.
                          </div>
                          
                          {activeFloor && activeFloor.markedPoints.length >= 2 && (
                             <button onClick={() => {
                                 if (pixelsPerMeter) handleGenerateWallsOnly();
                                 else alert('Моля, първо използвайте калибратора, за да зададете мащаб!'); 
                             }} className="w-full mt-2 bg-slate-900 text-white p-2 rounded text-[10px] font-bold uppercase hover:bg-teal-600 transition shadow">
                                 Очертай автоматично контур
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
                                              <span className="font-bold">Стена {w.displayId} {w.type === 'Вътрешна' && '(Вътр)'}</span>
                                              
                                              {editingWallId === w.id ? (
                                                  <div className="flex items-center gap-1">
                                                      <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-10 p-1 text-right border border-teal-500 rounded text-[10px]" />
                                                      <button onClick={() => handleWallEditSave(w.id)} className="bg-teal-600 text-white px-1 py-1 rounded text-[10px]">OK</button>
                                                  </div>
                                              ) : (
                                                  <span className="font-black text-teal-600 cursor-pointer text-[10px]" onClick={() => { setEditingWallId(w.id); setEditValue(displayLength); setEditHeightValue(displayHeight); }}>
                                                      L: {displayLength} {unit}
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

          <div key={viewMode} className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 relative overflow-hidden flex flex-col min-h-[400px] print:shadow-none print:border-none print:min-h-[auto] print:overflow-visible">
              
              {viewMode === '2D' && (
                  <div className={`flex-1 bg-slate-100 relative overflow-hidden transition-colors print:hidden ${
                      drawingMode === 'move-bg' ? 'cursor-grab active:cursor-grabbing border-4 border-amber-400' : 
                      drawingMode !== 'none' ? 'cursor-crosshair' : 'cursor-default'
                  }`}>
                      <div className="absolute top-4 right-4 z-40">
                          {uploadedImageUrl && (
                               <button onClick={handleUndo} disabled={actionHistory.length === 0} className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition ${actionHistory.length > 0 ? 'bg-white shadow-lg text-slate-700 hover:bg-slate-900 hover:text-white border border-slate-200' : 'bg-white/50 text-slate-400 cursor-not-allowed border border-transparent'}`}>
                                  <span>Назад</span>
                               </button>
                          )}
                      </div>
                      <div className="absolute inset-0 z-10 w-full h-full">
                           <canvas ref={canvasRef} className="w-full h-full" />
                      </div>
                      {!uploadedImageUrl && (
                          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] bg-white text-center px-8 leading-relaxed">
                              Качете чертеж за {activeFloor?.name}, за да започнете
                          </div>
                      )}
                  </div>
              )}

              {viewMode === '3D' && (
                  <div className="flex-1 bg-slate-50 flex flex-col relative text-slate-800 print:bg-white print:overflow-visible overflow-y-auto">
                      {projectResult ? (
                          <>
                              <div className="sticky top-0 z-30 flex flex-wrap gap-4 justify-between items-center bg-white/95 backdrop-blur p-4 border-b border-slate-200 print:hidden">
                                  <button onClick={() => setViewMode('2D')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition shadow">
                                       Върни се към чертане (2D)
                                  </button>
                                  <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 text-xs font-bold bg-teal-600 text-white rounded hover:bg-teal-500 transition shadow">
                                      Печат на заявка / спецификация
                                  </button>
                              </div>

                              <div className="relative h-[450px] border-b border-slate-200 print:hidden shrink-0">
                                  <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur p-5 rounded-xl shadow-xl border border-slate-200 min-w-[260px]">
                                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-600 border-b border-slate-100 pb-3 mb-3">Обща Спецификация (Всички етажи)</h3>
                                      <div className="space-y-2 text-xs">
                                          <div className="flex justify-between"><span className="text-slate-500">Панели общо:</span><span className="font-bold">{projectResult.globalStats.aFull + projectResult.globalStats.bFull} бр.</span></div>
                                          <div className="flex justify-between pt-2 border-t border-slate-200"><span className="text-slate-600 font-bold uppercase text-[10px]">Обща Квадратура:</span><span className="font-black text-teal-600 text-sm">{projectResult.globalStats.totalAreaUsed.toFixed(1)} м²</span></div>
                                      </div>
                                      <button onClick={() => setIsOrderModalOpen(true)} className="w-full mt-5 bg-slate-900 text-white py-3 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-teal-600 transition shadow">Изпрати запитване</button>
                                  </div>
                                  <Scene3D project={projectResult} viewFloor={'all'} />
                              </div>

                              {/* СКРИТ БЛОК ЗА ПЕЧАТ (PRINT ONLY) - ПЪЛНА ПРОИЗВОДСТВЕНА СПЕЦИФИКАЦИЯ БЕЗ 3D МОДЕЛ */}
                              <div className="hidden print:block w-full text-black mt-8">
                                  <h1 className="text-3xl font-bold mb-6 text-center border-b-4 border-black pb-4">ОФИЦИАЛНА ПРОИЗВОДСТВЕНА СПЕЦИФИКАЦИЯ БИОЗИД</h1>
                                  <div className="mb-8 text-lg">
                                      <p><strong>Общо панели за целия проект:</strong> {projectResult.globalStats.aFull + projectResult.globalStats.bFull} бр.</p>
                                      <p><strong>Обща квадратура на панелите:</strong> {projectResult.globalStats.totalAreaUsed.toFixed(2)} м²</p>
                                  </div>
                                  
                                  {projectResult.floorsData.map((f: any) => {
                                      const floorWalls = projectResult.walls.filter((w: any) => w.floorId === f.id);
                                      if (floorWalls.length === 0) return null;
                                      
                                      let floorPanelsA = 0, floorPanelsB = 0, floorCustom = 0, floorArea = 0;
                                      floorWalls.forEach((w:any) => {
                                          if (w.stats) {
                                              floorPanelsA += (w.stats.aFull || 0);
                                              floorPanelsB += (w.stats.bFull || 0);
                                              floorCustom += (w.stats.custom || 0);
                                              floorArea += w.stats.totalAreaUsed || 0;
                                          }
                                      });

                                      return (
                                          <div key={`print-floor-${f.id}`} className="mb-12 break-inside-avoid">
                                              <h2 className="text-2xl font-bold mb-4 bg-slate-200 p-3 border border-black">{f.name}</h2>
                                              
                                              <div className="flex gap-4 mb-4 break-inside-avoid">
                                                  {f.underlay && (
                                                      <div className="w-1/2 border border-black p-2">
                                                          <p className="text-[12px] font-bold mb-2 uppercase">Оригинална подложка (чертеж):</p>
                                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                                          <img src={f.underlay} alt={f.name} className="w-full h-auto object-contain max-h-[400px]" />
                                                      </div>
                                                  )}
                                                  <div className="flex-1 border border-black p-6 text-base bg-slate-50">
                                                      <p className="mb-2"><strong>Брой стени:</strong> {floorWalls.length}</p>
                                                      <p className="mb-2"><strong>Панели Тип А (2.50x1.25):</strong> {floorPanelsA} бр.</p>
                                                      <p className="mb-2"><strong>Панели Тип Б (2.44x1.44):</strong> {floorPanelsB} бр.</p>
                                                      <p className="mb-2"><strong>Изрязани парчета:</strong> {floorCustom} бр.</p>
                                                      <p className="mb-2 border-t border-slate-300 pt-2"><strong>Площ панели за етажа:</strong> {floorArea.toFixed(2)} м²</p>
                                                  </div>
                                              </div>
                                              
                                              <table className="w-full text-left border-collapse border border-black text-sm break-inside-avoid">
                                                  <thead>
                                                      <tr className="bg-slate-100">
                                                          <th className="border border-black p-2">Стена (ИД)</th>
                                                          <th className="border border-black p-2">Тип</th>
                                                          <th className="border border-black p-2">Дължина (м)</th>
                                                          <th className="border border-black p-2">Височина (м)</th>
                                                          <th className="border border-black p-2">Разбивка панели</th>
                                                      </tr>
                                                  </thead>
                                                  <tbody>
                                                      {floorWalls.map((w: any) => (
                                                          <tr key={`print-wall-${w.id}`}>
                                                              <td className="border border-black p-2 font-bold text-center">{w.letter}</td>
                                                              <td className="border border-black p-2">{w.type}</td>
                                                              <td className="border border-black p-2 text-center">{w.length.toFixed(2)}</td>
                                                              <td className="border border-black p-2 text-center">{w.height.toFixed(2)}</td>
                                                              <td className="border border-black p-2">
                                                                  {w.stats && `Тип А: ${w.stats.aFull} бр. | Тип Б: ${w.stats.bFull} бр. | Изрязани: ${w.stats.custom} бр.`}
                                                              </td>
                                                          </tr>
                                                      ))}
                                                  </tbody>
                                              </table>
                                          </div>
                                      );
                                  })}
                              </div>
                          </>
                      ) : (
                          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest print:hidden">
                              Генерирайте модела
                          </div>
                      )}
                  </div>
              )}
          </div>
        </div>
      </main>

      <div className="print:hidden"><Footer /></div>

      {calibrationModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-800 print:hidden">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center border-t-4 border-indigo-500 relative">
                  <button onClick={() => { setCalibrationModal(false); setCalibLinePixels(null); }} className="absolute top-4 right-4 text-slate-400 text-xl leading-none">&times;</button>
                  <h2 className="font-bold text-lg mb-2">Калибриране</h2>
                  <p className="text-[10px] text-slate-500 mb-4 bg-indigo-50 p-2 rounded border border-indigo-100">
                      Моля, въведете реалната дължина на начертаната <span className="text-indigo-500 font-bold">ЛИЛАВА</span> линия:
                  </p>
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col gap-1 text-left">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Дължина на линията ({unit})</label>
                        <input autoFocus type="number" value={calibLengthInput} onChange={(e) => setCalibLengthInput(e.target.value)} className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 font-bold outline-none" />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Височина на етажа ({unit})</label>
                        <input type="number" value={calibHeightInput} onChange={(e) => setCalibHeightInput(e.target.value)} className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 font-bold outline-none" />
                    </div>
                  </div>
                  <button onClick={handleAreaCalibrationSubmit} className="w-full bg-indigo-600 text-white p-3 rounded text-[10px] font-bold uppercase hover:bg-indigo-700 transition shadow">Приложи мащаба</button>
              </div>
          </div>
      )}
      
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-800 print:hidden">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-lg">Изпрати запитване</h2>
                  <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-400 text-2xl leading-none">&times;</button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Име</label>
                  <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Имейл</label>
                  <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="vashiat@email.com" className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Телефон</label>
                  <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Място</label>
                  <input value={clientLocation} onChange={(e) => setClientLocation(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold outline-none" />
                </div>
              </div>
              
              <button onClick={handleSubmitQuote} disabled={orderStatus !== 'idle'} className={`w-full p-3 rounded text-[10px] font-bold uppercase shadow-lg transition-colors ${orderStatus === 'success' ? 'bg-green-400 text-black' : 'bg-teal-600 text-white disabled:bg-slate-300'}`}>
                {orderStatus === 'sending' ? 'Изпращане...' : orderStatus === 'success' ? 'Успешно!' : 'Изпрати'}
              </button>
          </div>
        </div>
      )}
    </div>
  );
}