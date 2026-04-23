"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'requests' | 'houses' | 'settings'>('requests');
  const [isLoading, setIsLoading] = useState(false);
  const [houseForm, setHouseForm] = useState({
    name: '', area: '', bedrooms: '', bathrooms: '', floors: '', price: '', tags: ''
  });
  
  // СЪСТОЯНИЕ ЗА КЪЩИ
  const [housesList, setHousesList] = useState<any[]>([]);
  const [isLoadingHouses, setIsLoadingHouses] = useState(false);

  // СЪСТОЯНИЕ ЗА ЗАЯВКИ
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // 1. Извличане на КЪЩИ
  const fetchHouses = async () => {
    setIsLoadingHouses(true);
    try {
      const res = await fetch('/api/admin/houses');
      if (res.ok) {
        const data = await res.json();
        setHousesList(data);
      }
    } catch (err) {
      console.error("Грешка при зареждане на къщи");
    } finally {
      setIsLoadingHouses(false);
    }
  };

  // НОВО: Функция за изтриване на КЪЩА
  const handleDeleteHouse = async (id: string, name: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете модела "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/houses/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Успешно изтриване -> обновяваме списъка
        fetchHouses(); 
      } else {
        alert("Грешка при изтриване на модела.");
      }
    } catch (err) {
      alert("Грешка при връзката със сървъра.");
    }
  };

  // 2. Извличане на ЗАЯВКИ
  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) {
        const data = await res.json();
        setRequestsList(data);
      }
    } catch (err) {
      console.error("Грешка при зареждане на заявките");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Автоматично зареждане на данни според активния таб
  useEffect(() => {
    if (activeTab === 'houses') fetchHouses();
    if (activeTab === 'requests') fetchRequests();
  }, [activeTab]);

  const handleAddHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/houses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(houseForm),
      });
      if (res.ok) {
        alert("Моделът е добавен успешно!");
        setHouseForm({ name: '', area: '', bedrooms: '', bathrooms: '', floors: '', price: '', tags: '' });
        fetchHouses();
      }
    } catch (err) {
      alert("Грешка при връзката със сървъра.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new': return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Ново</span>;
      case 'in_progress': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold uppercase">В процес</span>;
      case 'completed': return <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase">Приключено</span>;
      default: return <span className="bg-slate-100 text-slate-400 px-2 py-1 rounded text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex justify-center bg-slate-950">
          <Image src="/logo.png" alt="БИОЗИД Admin" width={120} height={35} className="brightness-0 invert" />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('requests')} className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition ${activeTab === 'requests' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Заявки (Оферти)</button>
          <button onClick={() => setActiveTab('houses')} className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition ${activeTab === 'houses' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Каталог Къщи</button>
          <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition ${activeTab === 'settings' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Служители</button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-sm font-bold uppercase tracking-widest text-slate-800">
            {activeTab === 'requests' ? 'Управление на клиентски заявки' : activeTab === 'houses' ? 'Управление на типови проекти' : 'Системни настройки'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs uppercase">А</div>
            <span className="text-xs font-bold text-slate-600 tracking-tight">Администратор</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          
          {/* ТАБ: ЗАЯВКИ */}
          {activeTab === 'requests' && (
            <div className="animate-in fade-in space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700">Всички получени оферти</h2>
                  <button onClick={fetchRequests} className="text-[10px] text-teal-600 font-bold uppercase hover:underline">Опресни</button>
                </div>
                
                {isLoadingRequests ? (
                  <div className="p-12 text-center text-slate-400 text-sm">Зареждане на запитванията...</div>
                ) : requestsList.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm italic">Няма постъпили заявки към момента.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400">
                        <th className="p-4 font-bold">Дата</th>
                        <th className="p-4 font-bold">Клиент</th>
                        <th className="p-4 font-bold">Телефон</th>
                        <th className="p-4 font-bold">Квадратура</th>
                        <th className="p-4 font-bold">Статус</th>
                        <th className="p-4 font-bold text-right">Действие</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {requestsList.map((req) => (
                        <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="p-4 text-slate-500 text-xs">{new Date(req.createdAt).toLocaleDateString('bg-BG')}</td>
                          <td className="p-4 font-bold text-slate-800">{req.clientName}</td>
                          <td className="p-4 text-slate-600">{req.clientPhone}</td>
                          <td className="p-4 font-medium">{req.totalArea} м²</td>
                          <td className="p-4">{getStatusBadge(req.status)}</td>
                          <td className="p-4 text-right">
                             <Link href={`/admin/dashboard/request/${req.id}`} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase border border-slate-200 hover:bg-slate-900 hover:text-white transition">Преглед</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ТАБ: КЪЩИ (Форма + Списък) */}
          {activeTab === 'houses' && (
            <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto">
              
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-widest mb-6 text-slate-700 border-b pb-4">Добавяне на нов модел</h2>
                <form onSubmit={handleAddHouse} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-800">
                    <div className="col-span-2 md:col-span-4">
                      <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Име на модела</label>
                      <input required className="w-full p-2 bg-slate-50 border rounded text-sm outline-teal-500" value={houseForm.name} onChange={e => setHouseForm({...houseForm, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Квадратура (м²)</label>
                      <input type="number" step="0.1" required className="w-full p-2 bg-slate-50 border rounded text-sm outline-teal-500" value={houseForm.area} onChange={e => setHouseForm({...houseForm, area: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Цена (текст)</label>
                      <input required className="w-full p-2 bg-slate-50 border rounded text-sm outline-teal-500" value={houseForm.price} onChange={e => setHouseForm({...houseForm, price: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Спални</label>
                      <input type="number" required className="w-full p-2 bg-slate-50 border rounded text-sm outline-teal-500" value={houseForm.bedrooms} onChange={e => setHouseForm({...houseForm, bedrooms: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Етажи</label>
                      <input type="number" required className="w-full p-2 bg-slate-50 border rounded text-sm outline-teal-500" value={houseForm.floors} onChange={e => setHouseForm({...houseForm, floors: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-teal-600 text-white py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition mt-4 flex justify-center items-center gap-2">
                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Запази модела"}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700">Качени модели</h2>
                </div>
                {isLoadingHouses ? (
                  <div className="p-12 text-center text-slate-400 text-sm">Зареждане...</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400">
                        <th className="p-4 font-bold">Име</th>
                        <th className="p-4 font-bold text-center">Квадратура</th>
                        <th className="p-4 font-bold text-center">Цена</th>
                        {/* ДОБАВЕНА КОЛОНА ЗА ИЗТРИВАНЕ */}
                        <th className="p-4 font-bold text-right">Действие</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {housesList.map((house) => (
                        <tr key={house.id} className="border-b border-slate-100 group hover:bg-slate-50 transition">
                          <td className="p-4 font-bold text-slate-800">{house.name}</td>
                          <td className="p-4 text-center text-slate-600">{house.area} м²</td>
                          <td className="p-4 text-center text-teal-600 font-semibold">{house.price}</td>
                          {/* ДОБАВЕН БУТОН ЗА ИЗТРИВАНЕ */}
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleDeleteHouse(house.id, house.name)}
                              className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100"
                            >
                              Изтрий
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}