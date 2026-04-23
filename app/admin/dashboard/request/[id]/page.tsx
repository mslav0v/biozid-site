"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CadEditor from '@/components/CadEditor';

export default function RequestDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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

  if (isLoading) return <div className="p-20 text-center uppercase font-bold text-slate-400 min-h-screen bg-slate-50">Зареждане на детайли...</div>;
  if (!request) return <div className="p-20 text-center text-red-500 min-h-screen bg-slate-50">Заявката не е намерена.</div>;

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

        {/* ДОЛНА ЧАСТ: 3D CAD РЕДАКТОР (ВЕЧЕ Е НА 100% ШИРИНА) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
           <div className="flex justify-between items-center mb-6 border-b pb-2">
             <h2 className="text-xs font-bold uppercase text-teal-600 tracking-widest">Интерактивен 3D CAD Редактор</h2>
             <span className="text-[10px] bg-teal-50 text-teal-600 border border-teal-100 px-3 py-1.5 rounded uppercase font-bold tracking-widest shadow-sm">
               Режим на редакция
             </span>
           </div>
           
          {/* ТУК ВМЪКВАМЕ НАШИЯ КОМПОНЕНТ */}
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

      </div>
    </div>
  );
}