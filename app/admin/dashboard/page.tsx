"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Фиктивни данни за постъпили запитвания от калкулатора
const MOCK_REQUESTS = [
  {
    id: 'REQ-1001',
    date: '20.04.2026',
    client: 'Иван Петров',
    phone: '0888 123 456',
    area: '142.5 м²',
    status: 'new', // new, in_progress, completed
    cadData: true
  },
  {
    id: 'REQ-1002',
    date: '19.04.2026',
    client: 'Мария Георгиева',
    phone: '0899 987 654',
    area: '85.0 м²',
    status: 'in_progress',
    cadData: true
  },
  {
    id: 'REQ-1003',
    date: '18.04.2026',
    client: 'Димитър Стоянов',
    phone: '0877 111 222',
    area: '210.0 м²',
    status: 'completed',
    cadData: false
  }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'requests' | 'houses' | 'settings'>('requests');

  // Помощна функция за оцветяване на статусите
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new': return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Ново</span>;
      case 'in_progress': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">В процес</span>;
      case 'completed': return <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Приключено</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* ЛЯВО МЕНЮ (SIDEBAR) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex justify-center bg-slate-950">
          <Image src="/logo.png" alt="БИОЗИД Admin" width={120} height={35} className="brightness-0 invert" />
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition ${activeTab === 'requests' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            Заявки (Оферти)
          </button>
          <button 
            onClick={() => setActiveTab('houses')}
            className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition ${activeTab === 'houses' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            Каталог Къщи
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition ${activeTab === 'settings' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            Служители
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="block w-full text-center px-4 py-3 border border-slate-700 rounded text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Изход
          </Link>
        </div>
      </aside>

      {/* ОСНОВНО СЪДЪРЖАНИЕ */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP ХЕДЪР */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-sm font-bold uppercase tracking-widest text-slate-800">
            {activeTab === 'requests' && 'Управление на клиентски заявки'}
            {activeTab === 'houses' && 'Управление на типови проекти'}
            {activeTab === 'settings' && 'Системни настройки и служители'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs">А</div>
            <span className="text-xs font-bold text-slate-600">Администратор</span>
          </div>
        </header>

        {/* ДИНАМИЧЕН ИНТЕРФЕЙС */}
        <div className="flex-1 overflow-auto p-8">
          
          {/* ТАБ: ЗАЯВКИ */}
          {activeTab === 'requests' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Статистика */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Нови заявки</span>
                  <span className="text-3xl font-light text-slate-800">1</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">В процес на обработка</span>
                  <span className="text-3xl font-light text-slate-800">1</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Обща квадратура (месец)</span>
                  <span className="text-3xl font-light text-slate-800">437.5 <span className="text-lg">м²</span></span>
                </div>
              </div>

              {/* Таблица */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700">Списък със заявки от калкулатора</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400">
                        <th className="p-4 font-bold">ID Заявка</th>
                        <th className="p-4 font-bold">Дата</th>
                        <th className="p-4 font-bold">Клиент</th>
                        <th className="p-4 font-bold">Квадратура</th>
                        <th className="p-4 font-bold">Статус</th>
                        <th className="p-4 font-bold text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {MOCK_REQUESTS.map((req) => (
                        <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="p-4 font-bold text-slate-700">{req.id}</td>
                          <td className="p-4 text-slate-500">{req.date}</td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{req.client}</span>
                              <span className="text-[10px] text-slate-400">{req.phone}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 font-medium">{req.area}</td>
                          <td className="p-4">{getStatusBadge(req.status)}</td>
                          <td className="p-4 text-right space-x-2">
                            {req.cadData && (
                              <button className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border border-teal-200 hover:bg-teal-600 hover:text-white transition">
                                CAD Редактор
                              </button>
                            )}
                            <button className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-200 hover:bg-slate-900 hover:text-white transition">
                              Преглед
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ТАБ: КЪЩИ (Placeholders за момента) */}
          {activeTab === 'houses' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-in fade-in">
              <span className="text-4xl mb-4">🏠</span>
              <h2 className="text-sm font-bold uppercase tracking-widest">Модул: Каталог Къщи</h2>
              <p className="text-xs mt-2">Тук ще създадем интерфейс за качване на нови модели, снимки и цени.</p>
              <button className="mt-6 bg-teal-600 text-white px-6 py-3 rounded text-xs font-bold uppercase tracking-widest shadow-lg">
                + Добави нов модел
              </button>
            </div>
          )}

          {/* ТАБ: СЛУЖИТЕЛИ */}
          {activeTab === 'settings' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-in fade-in">
              <span className="text-4xl mb-4">⚙️</span>
              <h2 className="text-sm font-bold uppercase tracking-widest">Модул: Настройки</h2>
              <p className="text-xs mt-2">Тук ще добавяме достъпи за други служители.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}