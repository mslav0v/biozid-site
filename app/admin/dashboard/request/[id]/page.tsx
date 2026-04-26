"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CadEditor from '@/components/CadEditor';

// --- НОВИ ИМПОРТИ ЗА 3D СЦЕНАТА В АДМИН ПАНЕЛА ---
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Edges } from '@react-three/drei';
import * as THREE from 'three';

export default function RequestDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // --- НОВ СТЕЙТ ЗА СЛУЖЕБНИЯ ПАНЕЛ ---
  const [filter3DFloor, setFilter3DFloor] = useState<number | 'all'>('all');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/quotes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRequest(data);
        }
      } catch (err) {
        console.error("Грешка при зареждане на детайлите");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setRequest({ ...request, status: newStatus });
      } else {
        alert("Грешка при запазване на статуса.");
      }
    } catch (err) {
      alert("Грешка при връзката със сървъра.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendEmail = () => {
    if (!request) return;
    const subject = encodeURIComponent(`Моля за преглед на заявка #${request.id.slice(-5).toUpperCase()} (Клиент: ${request.clientName})`);
    const body = encodeURIComponent(`Здравейте,\n\nМоля да прегледате следната заявка:\n\nКлиент: ${request.clientName}\nТелефон: ${request.clientPhone}\nКвадратура: ${request.totalArea.toFixed(1)} м²\n\nЛинк към системата: ${window.location.href}\n\nПоздрави,\nЕкипът на БИОЗИД`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handlePrint = () => {
    window.print();
  };

  // --- ХЕЛПЪР ЗА ОБЩА СТАТИСТИКА ОТ ЗАПАЗЕНИТЕ СТЕНИ ---
  const calcGlobalStats = (walls: any[]) => {
    let aFull = 0, bFull = 0, totalArea = 0;
    if (!walls) return { totalPanels: 0, totalArea: 0, aFull: 0, bFull: 0 };
    walls.forEach(w => {
       if (w.stats) {
          aFull += w.stats.aFull || 0;
          bFull += w.stats.bFull || 0;
          totalArea += w.stats.totalAreaUsed || 0;
       }
    });
    return { totalPanels: aFull + bFull, totalArea, aFull, bFull };
  };

  // --- 3D КОМПОНЕНТ (ПРЕНЕСЕН ОТ КАЛКУЛАТОРА И АДАПТИРАН ЗА ЗАЯВКИТЕ) ---
  const Scene3D = ({ project, viewFloor }: any) => {
    const walls = viewFloor === 'all' ? project.walls : project.walls.filter((w: any) => w.floorId === viewFloor);
    const baseFloors = viewFloor === 'all' ? project.floorsData : project.floorsData?.filter((f: any) => f.floorId === viewFloor);
    
    if (!walls || !baseFloors) return null;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    walls.forEach((w: any) => {
        if(w.type === 'Външна') {
            minX = Math.min(minX, w.coords.x1, w.coords.x2);
            maxX = Math.max(maxX, w.coords.x1, w.coords.x2);
            minY = Math.min(minY, w.coords.y1, w.coords.y2);
            maxY = Math.max(maxY, w.coords.y1, w.coords.y2);
        }
    });
    if (minX === Infinity) {
        walls.forEach((w: any) => {
            minX = Math.min(minX, w.coords.x1, w.coords.x2);
            maxX = Math.max(maxX, w.coords.x1, w.coords.x2);
            minY = Math.min(minY, w.coords.y1, w.coords.y2);
            maxY = Math.max(maxY, w.coords.y1, w.coords.y2);
        });
    }
    const centerX = minX === Infinity ? 0 : (minX + maxX) / 2;
    const centerY = minY === Infinity ? 0 : (minY + maxY) / 2;

    let gMinX = Infinity, gMaxX = -Infinity, gMinY = Infinity, gMaxY = -Infinity;
    project.walls.forEach((w: any) => {
        gMinX = Math.min(gMinX, w.coords.x1, w.coords.x2);
        gMaxX = Math.max(gMaxX, w.coords.x1, w.coords.x2);
        gMinY = Math.min(gMinY, w.coords.y1, w.coords.y2);
        gMaxY = Math.max(gMaxY, w.coords.y1, w.coords.y2);
    });
    if (gMinX === Infinity) { gMinX = 0; gMaxX = 0; gMinY = 0; gMaxY = 0; }

    return (
      <Canvas gl={{ preserveDrawingBuffer: true }} camera={{ position: [0, 20, 30], fov: 45 }} className="print:w-full print:h-[500px]">
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 30, 10]} intensity={1.5} castShadow />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        
        <group position={[0, -5, 0]}>
            {baseFloors.map((fl: any, idx: number) => {
                const floorWalls = project.walls.filter((w: any) => w.floorId === fl.floorId);
                if (floorWalls.length === 0) return null; 
                
                const flW = (gMaxX - gMinX) / (fl.ppm || 50) + 1.0; 
                const flD = (gMaxY - gMinY) / (fl.ppm || 50) + 1.0;
                const cX = ((gMinX + gMaxX) / 2 - centerX) / (fl.ppm || 50);
                const cZ = ((gMinY + gMaxY) / 2 - centerY) / (fl.ppm || 50);
                
                let elev = 0;
                for(let i=0; i<idx; i++) elev += Number(baseFloors[i]?.height || 2.80);

                return (
                    <mesh key={`red-slab-${fl.floorId}`} position={[cX, elev - 0.05, cZ]} rotation={[-Math.PI / 2, 0, 0]}>
                        <boxGeometry args={[flW, flD, 0.1]} />
                        <meshStandardMaterial color="#fee2e2" side={THREE.DoubleSide} />
                        <Edges scale={1} threshold={15} color="#ef4444" />
                    </mesh>
                );
            })}

            {walls.map((wall: any) => {
                const ppm = baseFloors.find((f:any) => f.floorId === wall.floorId)?.ppm || 50;
                const cx = (wall.coords.x1 + wall.coords.x2) / 2;
                const cy = (wall.coords.y1 + wall.coords.y2) / 2;
                const posX = (cx - centerX) / ppm;
                const posZ = (cy - centerY) / ppm;
                
                const dx = wall.coords.x2 - wall.coords.x1;
                const dy = wall.coords.y2 - wall.coords.y1;
                const rotY = -Math.atan2(dy, dx);

                return (
                    <group key={`wall-group-${wall.id}`} position={[posX, wall.elevation || 0, posZ]} rotation={[0, rotY, 0]}>
                        <Text position={[0, wall.height + 0.5, 0]} fontSize={0.3} color="#14b8a6" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf">
                            {wall.letter || wall.displayId} ({wall.orientation})
                        </Text>
                        
                        <group position={[-wall.length / 2, 0, 0]}>
                            {wall.rows?.map((r: any, rIdx: number) => {
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

  if (isLoading) return <div className="p-20 text-center uppercase font-bold text-slate-400 min-h-screen bg-slate-50">Зареждане на детайли...</div>;
  if (!request) return <div className="p-20 text-center text-red-500 min-h-screen bg-slate-50">Заявката не е намерена.</div>;

  // --- МАГИЯТА ЗА ВЪЗСТАНОВЯВАНЕ НА ЕТАЖИТЕ ---
  // Ако базата данни ни е върнала floorsData, ги ползваме. 
  // Ако не е (защото е стара заявка или липсва в API-то), ги генерираме на база стените!
  const safeFloorsData = request.floorsData && request.floorsData.length > 0 
    ? request.floorsData 
    : (request.cadData && request.cadData.length > 0 
        ? Array.from(new Set(request.cadData.map((w: any) => w.floorId || 1))).map(id => ({
            floorId: id,
            floorName: `Етаж ${id}`,
            ppm: 50,
            underlay: request.underlayUrl || null
          }))
        : []);

  const projectMock = { walls: request.cadData || [], floorsData: safeFloorsData };
  const globalStats = calcGlobalStats(request.cadData);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200 pb-6 print:border-none">
          <div>
            <Link href="/admin/dashboard" className="text-teal-600 text-xs font-bold uppercase tracking-widest hover:underline print:hidden">← Назад към всички</Link>
            <h1 className="text-2xl font-black text-slate-900 mt-2">Заявка #{request.id.slice(-5).toUpperCase()}</h1>
          </div>
          
          <div className="flex gap-3 print:hidden">
             <button onClick={handlePrint} className="bg-white border border-slate-200 px-6 py-2 rounded text-xs font-bold uppercase hover:bg-slate-50 transition">
               Печат PDF
             </button>
             <button onClick={handleSendEmail} className="bg-teal-600 text-white px-6 py-2 rounded text-xs font-bold uppercase hover:bg-teal-700 shadow-lg transition">
               Изпрати за преглед
             </button>
          </div>
        </div>

        {/* ГОРНА ЧАСТ: ИНФО И ПОДЛОЖКА */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* ЛЯВА КОЛОНА */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-slate-300">
              <h2 className="text-[10px] font-bold uppercase text-slate-400 mb-4 tracking-widest border-b pb-2">Клиент</h2>
              <p className="text-lg font-bold text-slate-800">{request.clientName}</p>
              <p className="text-teal-600 font-medium">{request.clientPhone}</p>
              <p className="text-xs text-slate-400 mt-4 italic">Получена на: {new Date(request.createdAt).toLocaleString('bg-BG')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-slate-300">
              <h2 className="text-[10px] font-bold uppercase text-slate-400 mb-4 tracking-widest border-b pb-2">Спецификация</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Обща площ:</span>
                  <span className="text-sm font-bold text-slate-800">{request.totalArea.toFixed(1)} м²</span>
                </div>
                
                <div className="flex flex-col gap-1 pt-2 border-t border-slate-100 print:hidden">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Статус на проекта:</span>
                  <select 
                    value={request.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdating}
                    className={`w-full text-xs font-bold uppercase tracking-widest p-2 rounded outline-none border cursor-pointer transition
                      ${request.status === 'new' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                        request.status === 'in_progress' ? 'bg-orange-50 border-orange-200 text-orange-700' : 
                        'bg-slate-100 border-slate-300 text-slate-600'
                      }`}
                  >
                    <option value="new">Ново запитване</option>
                    <option value="in_progress">В процес на работа</option>
                    <option value="completed">Приключена оферта</option>
                  </select>
                </div>
                <div className="hidden print:block pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Статус: </span>
                  <span className="text-sm font-bold text-slate-800 uppercase">{request.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ДЯСНА КОЛОНА (САМО ПОДЛОЖКА) */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full print:shadow-none print:border-slate-300">
              <h2 className="text-[10px] font-bold uppercase text-slate-400 mb-4 tracking-widest border-b pb-2">Оригинален чертеж (Подложка)</h2>
              {request.underlayUrl ? (
                <div className="relative w-full h-[calc(100%-40px)] min-h-[300px] bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                   <img src={request.underlayUrl} alt="Client Draw" className="object-contain w-full h-full absolute inset-0" />
                </div>
              ) : (
                <div className="p-10 text-center text-slate-300 text-xs italic flex items-center justify-center h-[300px]">Няма прикачена подложка</div>
              )}
            </div>
          </div>

        </div>

        {/* --- СЛУЖЕБЕН ПАНЕЛ / РАЗБИВКА ЕТАЖ ПО ЕТАЖ (ВЕЧЕ ИЗПОЛЗВА safeFloorsData) --- */}
        {safeFloorsData.length > 0 && (
            <div className="bg-slate-100 p-4 lg:p-8 rounded-xl border border-slate-200 shadow-sm mb-8 print:hidden">
                <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-6 flex items-center gap-3">
                    <span>Служебен панел: Разбивка етаж по етаж</span>
                </h2>
                
                {/* ТАБОВЕ */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button 
                        onClick={() => setFilter3DFloor('all')} 
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-t-lg transition border-b-4 ${filter3DFloor === 'all' ? 'bg-white text-teal-700 border-teal-500 shadow-sm' : 'bg-slate-200 text-slate-500 border-transparent hover:bg-slate-300'}`}
                    >
                        Общ Изглед
                    </button>
                    {safeFloorsData.map((f: any) => (
                        <button 
                            key={`tab-btn-${f.floorId}`} 
                            onClick={() => setFilter3DFloor(f.floorId)} 
                            className={`px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-t-lg transition border-b-4 ${filter3DFloor === f.floorId ? 'bg-white text-teal-700 border-teal-500 shadow-sm' : 'bg-slate-200 text-slate-500 border-transparent hover:bg-slate-300'}`}
                        >
                            {f.floorName || `Етаж ${f.floorId}`}
                        </button>
                    ))}
                </div>

                {/* СЪДЪРЖАНИЕ: ОБЩ ИЗГЛЕД */}
                {filter3DFloor === 'all' && (
                    <div className="bg-white p-6 rounded-b-xl rounded-tr-xl shadow-md border border-slate-200">
                        <div className="h-[450px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative shadow-inner">
                             <Scene3D project={projectMock} viewFloor="all" />
                        </div>
                    </div>
                )}

                {/* СЪДЪРЖАНИЕ: ПО ЕТАЖИ */}
                {safeFloorsData.map((f: any) => {
                    if (filter3DFloor !== f.floorId) return null;
                    return (
                        <div key={`tab-content-${f.floorId}`} className="bg-white p-6 rounded-b-xl rounded-tr-xl shadow-md border border-slate-200 flex flex-col xl:flex-row gap-6">
                            {/* 3D Model */}
                            <div className="xl:w-1/3 flex flex-col gap-3">
                                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-widest">3D Модел: {f.floorName}</h4>
                                <div className="h-[350px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative shadow-inner">
                                    <Scene3D project={projectMock} viewFloor={f.floorId} />
                                </div>
                            </div>

                            {/* Underlay */}
                            <div className="xl:w-1/3 flex flex-col gap-3">
                                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-widest">Подложка (Оригинал)</h4>
                                <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 shadow-inner min-h-[350px]">
                                    {f.underlay ? (
                                        <img src={f.underlay} className="w-full h-full object-contain" alt="Underlay" />
                                    ) : (
                                        <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Няма подложка</span>
                                    )}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="xl:w-1/3 flex flex-col gap-3">
                                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-widest">Спецификация стени</h4>
                                <div className="flex-1 overflow-y-auto max-h-[350px] border border-slate-200 rounded-xl shadow-inner bg-white">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead className="sticky top-0 bg-slate-100 shadow-sm">
                                            <tr className="text-slate-600">
                                                <th className="p-3 border-b border-slate-200">ИД</th>
                                                <th className="p-3 border-b border-slate-200">Тип</th>
                                                <th className="p-3 border-b border-slate-200">Дължина</th>
                                                <th className="p-3 border-b border-slate-200">Панели (A/B)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {request.cadData?.filter((w:any) => w.floorId === f.floorId).map((w: any) => (
                                                <tr key={`tbl-${w.id}`} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                                    <td className="p-3 font-bold">{w.letter || w.displayId}</td>
                                                    <td className="p-3">{w.type}</td>
                                                    <td className="p-3 font-medium text-teal-700">{w.length?.toFixed(2)}м</td>
                                                    <td className="p-3">{w.stats ? `${w.stats.aFull} / ${w.stats.bFull}` : '0 / 0'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {/* ДОЛНА ЧАСТ: 3D CAD РЕДАКТОР */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
           <div className="flex justify-between items-center mb-6 border-b pb-2">
             <h2 className="text-xs font-bold uppercase text-teal-600 tracking-widest">Интерактивен 3D CAD Редактор</h2>
             <span className="text-[10px] bg-teal-50 text-teal-600 border border-teal-100 px-3 py-1.5 rounded uppercase font-bold tracking-widest shadow-sm">
               Режим на редакция
             </span>
           </div>
           
           <CadEditor 
              walls={request.cadData} 
              onSave={async (updatedWalls) => {
                setIsUpdating(true);
                try {
                  const res = await fetch(`/api/quotes/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cadData: updatedWalls })
                  });
                  if (res.ok) {
                    setRequest({...request, cadData: updatedWalls});
                    alert("CAD моделът е запазен успешно в базата!");
                  } else alert("Грешка при запазване.");
                } catch(err) { alert("Грешка при връзката."); }
                setIsUpdating(false);
              }}
              isSaving={isUpdating}
           />
           <p className="text-[10px] text-slate-400 mt-4 italic text-center">
             * Използвайте лявото меню за преизчисляване на стените или кликнете върху панел от 3D модела, за да го редактирате.
           </p>
        </div>

        {/* --- СКРИТ БЛОК ЗА ПЕЧАТ (PRINT ONLY) - ПЪЛНА ПРОИЗВОДСТВЕНА СПЕЦИФИКАЦИЯ --- */}
        <div className="hidden print:block w-full text-black mt-8">
            <h1 className="text-3xl font-bold mb-6 text-center border-b-4 border-black pb-4">ОФИЦИАЛНА ПРОИЗВОДСТВЕНА СПЕЦИФИКАЦИЯ БИОЗИД</h1>
            <div className="mb-8 text-lg">
                <p><strong>Общо панели за целия проект:</strong> {globalStats.totalPanels} бр.</p>
                <p><strong>Обща квадратура на панелите:</strong> {globalStats.totalArea.toFixed(2)} м²</p>
            </div>
            
            {safeFloorsData.map((f: any) => {
                const floorWalls = request.cadData?.filter((w: any) => w.floorId === f.floorId) || [];
                if (floorWalls.length === 0) return null;
                
                let floorPanelsA = 0, floorPanelsB = 0, floorArea = 0;
                floorWalls.forEach((w:any) => {
                    if (w.stats) {
                        floorPanelsA += (w.stats.aFull || 0);
                        floorPanelsB += (w.stats.bFull || 0);
                        floorArea += w.stats.totalAreaUsed || 0;
                    }
                });

                return (
                    <div key={`print-floor-${f.floorId}`} className="mb-12 break-inside-avoid">
                        <h2 className="text-2xl font-bold mb-4 bg-slate-200 p-3 border border-black">{f.floorName || `Етаж ${f.floorId}`}</h2>
                        
                        {/* 3D МОДЕЛ В ПРИНТ БЛОКА */}
                        <div className="mb-6 border border-black p-2 h-[400px] relative w-full break-inside-avoid">
                            <p className="text-[12px] font-bold mb-2 uppercase absolute top-2 left-2 z-10 bg-white/80 p-1">3D Модел:</p>
                            <Scene3D project={projectMock} viewFloor={f.floorId} />
                        </div>

                        <div className="flex gap-4 mb-4 break-inside-avoid">
                            {f.underlay && (
                                <div className="w-1/2 border border-black p-2">
                                    <p className="text-[12px] font-bold mb-2 uppercase">Оригинална подложка (чертеж):</p>
                                    <img src={f.underlay} alt={f.floorName} className="w-full h-auto object-contain max-h-[400px]" />
                                </div>
                            )}
                            <div className="flex-1 border border-black p-6 text-base bg-slate-50">
                                <p className="mb-2"><strong>Брой стени:</strong> {floorWalls.length}</p>
                                <p className="mb-2"><strong>Панели Тип А (2.50x1.25):</strong> {floorPanelsA} бр.</p>
                                <p className="mb-2"><strong>Панели Тип Б (2.44x1.44):</strong> {floorPanelsB} бр.</p>
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
                                        <td className="border border-black p-2 font-bold text-center">{w.letter || w.displayId}</td>
                                        <td className="border border-black p-2">{w.type}</td>
                                        <td className="border border-black p-2 text-center">{w.length?.toFixed(2)}</td>
                                        <td className="border border-black p-2 text-center">{w.height?.toFixed(2)}</td>
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

      </div>
    </div>
  );
}