"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminDashboard() {
  // === СТЕЙТ ЗА МЕНЮ И НАВИГАЦИЯ ===
  const [activeTab, setActiveTab] = useState<'requests' | 'houses' | 'settings'>('requests');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // === СТЕЙТ ЗА ЗАЯВКИ ===
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // === СТЕЙТ ЗА КЪЩИ ===
  const [housesList, setHousesList] = useState<any[]>([]);
  const [isLoadingHouses, setIsLoadingHouses] = useState(false);
  const [isEditingHouse, setIsEditingHouse] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingHouse, setIsSavingHouse] = useState(false);

  // Първоначалното състояние трябва да има всички полета като празни низове, не null
  const emptyHouseForm = {
    id: "", 
    name: "", 
    area: "", 
    price: "", 
    bedrooms: "1", 
    bathrooms: "1", 
    toilets: "1", 
    floors: "1", 
    terraces: "0", 
    description: "", 
    imageUrl: "", 
    gallery: [] as string[], 
    constructionType: "Масивна метална",
    profileSize: "100х100х5 мм", 
    wallThickness: "25 см", 
    wallTech: "Дишаща система БИОЗИД", 
    roofType: "Плосък", 
    windowsType: "7-камерна PVC"
  };

  const [houseForm, setHouseForm] = useState(emptyHouseForm);

  // ==========================================
  // 1. ФУНКЦИИ ЗА ЗАЯВКИ (ОФЕРТИ)
  // ==========================================
  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) setRequestsList(await res.json());
    } catch (err) {
      console.error("Грешка при зареждане на заявките");
    } finally {
      setIsLoadingRequests(false);
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

  // ==========================================
  // 2. ФУНКЦИИ ЗА КЪЩИ (КАТАЛОГ)
  // ==========================================
  const fetchHouses = async () => {
    setIsLoadingHouses(true);
    try {
      const res = await fetch('/api/houses');
      if (res.ok) setHousesList(await res.json());
    } catch (err) {
      console.error("Грешка при зареждане на къщи");
    } finally {
      setIsLoadingHouses(false);
    }
  };

  // КОРИГИРАНА ФУНКЦИЯ ЗА КАЧВАНЕ (БЕЗ ДУБЛИРАНИ ЦИКЛИ)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'main' | 'gallery') => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const response = await fetch(`/api/upload?filename=${file.name}`, {
          method: 'POST',
          body: file,
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Server error:", errorData);
          throw new Error("Грешка при качване на сървъра");
        }

        const newBlob = await response.json();
        uploadedUrls.push(newBlob.url);
      } catch (error) {
        alert("Проблем при качването на '" + file.name + "'. Проверете конзолата.");
        console.error("Upload error:", error);
      }
    }

    if (field === 'main' && uploadedUrls.length > 0) {
      setHouseForm(prev => ({ ...prev, imageUrl: uploadedUrls[0] }));
    } else if (field === 'gallery') {
      setHouseForm(prev => ({ ...prev, gallery: [...prev.gallery, ...uploadedUrls] }));
    }
    setIsUploading(false);
  };

  const handleHouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHouse(true);
    
    const method = isEditingHouse ? "PUT" : "POST";
    const url = isEditingHouse ? `/api/houses/${houseForm.id}` : "/api/houses";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...houseForm,
          area: parseFloat(houseForm.area || "0"),
          bedrooms: parseInt(houseForm.bedrooms || "0"),
          bathrooms: parseInt(houseForm.bathrooms || "0"),
          toilets: parseInt(houseForm.toilets || "0"),
          floors: parseInt(houseForm.floors || "0"),
          terraces: parseInt(houseForm.terraces || "0"),
        }),
      });

      if (res.ok) {
        alert(isEditingHouse ? "Моделът е обновен успешно!" : "Моделът е създаден успешно!");
        setIsEditingHouse(false);
        setHouseForm(emptyHouseForm);
        fetchHouses();
      } else {
        alert("Грешка при запис на данните.");
      }
    } catch (err) {
      alert("Грешка при връзката със сървъра.");
    } finally {
      setIsSavingHouse(false);
    }
  };

  const handleEditHouse = (house: any) => {
    setHouseForm({
      id: house.id || "",
      name: house.name || "",
      area: (house.area || "").toString(),
      price: (house.price || "").toString(),
      bedrooms: (house.bedrooms || "0").toString(),
      bathrooms: (house.bathrooms || "0").toString(),
      toilets: (house.toilets || "1").toString(),
      floors: (house.floors || "1").toString(),
      terraces: (house.terraces || "0").toString(),
      description: house.description || "",
      imageUrl: house.imageUrl || "",
      gallery: house.gallery || [],
      constructionType: house.constructionType || "",
      profileSize: house.profileSize || "",
      wallThickness: house.wallThickness || "",
      wallTech: house.wallTech || "",
      roofType: house.roofType || "",
      windowsType: house.windowsType || ""
    });
    setIsEditingHouse(true);
    setActiveTab('houses');
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteHouse = async (id: string, name: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете модела "${name}"?`)) return;
    try {
      const res = await fetch(`/api/houses/${id}`, { method: 'DELETE' });
      if (res.ok) fetchHouses();
      else alert("Грешка при изтриване.");
    } catch (err) {
      alert("Грешка при връзката със сървъра.");
    }
  };

  useEffect(() => {
    if (activeTab === 'houses') fetchHouses();
    if (activeTab === 'requests') fetchRequests();
  }, [activeTab]);


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center z-50">
        <Image src="/logo.png" alt="БИОЗИД Admin" width={100} height={30} className="brightness-0 invert" />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-800 rounded">
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`w-full md:w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-40 transition-all duration-300 ${isMobileMenuOpen ? 'block' : 'hidden'} md:flex fixed md:static inset-0 pt-16 md:pt-0`}>
        <div className="p-6 border-b border-slate-800 flex justify-center bg-slate-950 hidden md:flex">
          <Image src="/logo.png" alt="БИОЗИД Admin" width={120} height={35} className="brightness-0 invert" />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => { setActiveTab('requests'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-4 md:py-3 rounded text-xs font-bold uppercase tracking-widest transition ${activeTab === 'requests' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Заявки (Оферти)</button>
          <button onClick={() => { setActiveTab('houses'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-4 md:py-3 rounded text-xs font-bold uppercase tracking-widest transition ${activeTab === 'houses' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Каталог Къщи</button>
          <button onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-4 md:py-3 rounded text-xs font-bold uppercase tracking-widest transition ${activeTab === 'settings' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Служители</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-[calc(100vh-60px)] md:h-screen overflow-hidden">
        
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 flex-shrink-0">
          <h1 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-800 truncate">
            {activeTab === 'requests' ? 'Управление на клиентски заявки' : activeTab === 'houses' ? 'Управление на типови проекти' : 'Системни настройки'}
          </h1>
          <div className="flex items-center gap-3 ml-4">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs uppercase">А</div>
            <span className="text-xs font-bold text-slate-600 tracking-tight hidden sm:block">Администратор</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          
          {/* ТАБ: ЗАЯВКИ */}
          {activeTab === 'requests' && (
            <div className="animate-in fade-in space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700">Всички получени оферти</h2>
                  <button onClick={fetchRequests} className="text-[10px] text-teal-600 font-bold uppercase hover:underline">Опресни</button>
                </div>
                
                {isLoadingRequests ? (
                  <div className="p-12 text-center text-slate-400 text-sm">Зареждане на запитванията...</div>
                ) : requestsList.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm italic">Няма постъпили заявки към момента.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
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
                            <td className="p-4 text-right flex justify-end gap-2">
                               <button className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase border border-blue-100 hover:bg-blue-600 hover:text-white transition" title="Изпрати имейл (Очаква интеграция)">✉ Имейл</button>
                               <Link href={`/admin/dashboard/request/${req.id}`} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase border border-slate-200 hover:bg-slate-900 hover:text-white transition">Преглед</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ТАБ: КЪЩИ */}
          {activeTab === 'houses' && (
            <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto pb-20">
              <div className="bg-white p-4 md:p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">
                    {isEditingHouse ? "Редактиране на модел" : "Добавяне на нов модел"}
                  </h2>
                  {isEditingHouse && (
                    <button onClick={() => { setIsEditingHouse(false); setHouseForm(emptyHouseForm); }} className="text-[10px] text-red-500 font-bold uppercase hover:underline">
                      Отказ от редакция
                    </button>
                  )}
                </div>

                <form onSubmit={handleHouseSubmit} className="space-y-6">
                  {/* ОСНОВНИ */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Име на къщата</label>
                      <input name="name" value={houseForm.name || ""} onChange={(e) => setHouseForm({...houseForm, name: e.target.value})} required className="w-full p-2.5 rounded-lg border-none ring-1 ring-slate-200 mt-1 focus:ring-teal-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Цена (€)</label>
                      <input name="price" value={houseForm.price || ""} onChange={(e) => setHouseForm({...houseForm, price: e.target.value})} required className="w-full p-2.5 rounded-lg ring-1 ring-slate-200 mt-1 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Квадратура (м²)</label>
                      <input type="number" step="0.1" name="area" value={houseForm.area || ""} onChange={(e) => setHouseForm({...houseForm, area: e.target.value})} required className="w-full p-2.5 rounded-lg ring-1 ring-slate-200 mt-1 text-sm" />
                    </div>
                  </div>

                  {/* РАЗПРЕДЕЛЕНИЕ */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {['bedrooms', 'bathrooms', 'toilets', 'floors', 'terraces'].map((field, idx) => {
                      const labels: Record<string, string> = {
                        'bedrooms': 'Спални',
                        'bathrooms': 'Бани',
                        'toilets': 'Тоалетни',
                        'floors': 'Етажи',
                        'terraces': 'Тераси'
                      };
                      return (
                        <div key={idx}>
                          <label className="text-[10px] font-bold uppercase text-slate-400">{labels[field]}</label>
                          <input type="number" name={field} value={(houseForm as any)[field] || ""} onChange={(e) => setHouseForm({...houseForm, [field]: e.target.value})} className="w-full p-2.5 rounded-lg ring-1 ring-slate-200 mt-1 text-sm" />
                        </div>
                      )
                    })}
                  </div>

                  {/* ОПИСАНИЕ НА МОДЕЛА */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Описание на модела</label>
                     <textarea 
                        name="description" 
                        value={houseForm.description || ""} 
                        onChange={(e) => setHouseForm({...houseForm, description: e.target.value})} 
                        className="w-full p-2.5 rounded-lg ring-1 ring-slate-200 mt-1 text-sm min-h-[120px] resize-y"
                        placeholder="Въведете детайлно описание, което ще се показва в профила на къщата..."
                     />
                  </div>

                  {/* КАЧВАНЕ НА СНИМКИ */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-[10px] font-bold uppercase text-teal-700 mb-4">Снимки и Галерия</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Главна снимка</p>
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-100">
                          {houseForm.imageUrl ? <Image src={houseForm.imageUrl} alt="Preview" fill className="object-cover" /> : <span className="text-xs text-slate-400 font-bold">+ ИЗБЕРИ</span>}
                          <input type="file" onChange={(e) => handleFileUpload(e, 'main')} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Галерия / Планове</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {houseForm.gallery.map((url, i) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 group">
                              <Image src={url} alt="Gallery" fill className="object-cover" />
                              <button type="button" onClick={() => setHouseForm({...houseForm, gallery: houseForm.gallery.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition">✕</button>
                            </div>
                          ))}
                          <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-100">
                            <span className="text-lg text-slate-400 font-bold">+</span>
                            <input type="file" multiple onChange={(e) => handleFileUpload(e, 'gallery')} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                    {isUploading && <p className="text-teal-600 text-[10px] font-bold mt-3 animate-pulse bg-teal-50 p-2 rounded text-center">⏳ КАЧВАНЕ НА ФАЙЛОВЕ...</p>}
                  </div>

                  {/* ТЕХНИЧЕСКИ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {[
                      { id: "constructionType", label: "Вид конструкция" }, 
                      { id: "profileSize", label: "Размери профили" }, 
                      { id: "wallThickness", label: "Дебелина стена" }, 
                      { id: "wallTech", label: "Технология стена" }, 
                      { id: "roofType", label: "Вид покрив" }, 
                      { id: "windowsType", label: "Вид дограма" }
                    ].map((field) => (
                      <div key={field.id}>
                        <label className="text-[10px] font-bold uppercase text-slate-400">{field.label}</label>
                        <input name={field.id} value={(houseForm as any)[field.id] || ""} onChange={(e) => setHouseForm({...houseForm, [field.id]: e.target.value})} className="w-full p-2.5 rounded-lg ring-1 ring-slate-200 mt-1 text-sm" />
                      </div>
                    ))}
                  </div>

                  <button type="submit" disabled={isSavingHouse || isUploading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-teal-700 transition shadow-lg disabled:opacity-50">
                    {isSavingHouse ? "Запазване..." : isEditingHouse ? "ЗАПАЗИ ПРОМЕНИТЕ" : "СЪЗДАЙ МОДЕЛ"}
                  </button>
                </form>
              </div>

              {/* СПИСЪК КЪЩИ */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700">Качени модели</h2>
                </div>
                {isLoadingHouses ? (
                  <div className="p-12 text-center text-slate-400 text-sm">Зареждане...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-white border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400">
                          <th className="p-4 font-bold">Снимка</th>
                          <th className="p-4 font-bold">Име</th>
                          <th className="p-4 font-bold text-center">Квадратура</th>
                          <th className="p-4 font-bold text-center">Цена</th>
                          <th className="p-4 font-bold text-right">Действие</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {housesList.map((house) => (
                          <tr key={house.id} className="border-b border-slate-100 group hover:bg-slate-50 transition">
                            <td className="p-4">
                              <div className="relative w-16 h-10 rounded bg-slate-200 overflow-hidden">
                                {house.imageUrl && <Image src={house.imageUrl} alt={house.name} fill className="object-cover" />}
                              </div>
                            </td>
                            <td className="p-4 font-bold text-slate-800">{house.name}</td>
                            <td className="p-4 text-center text-slate-600">{house.area} м²</td>
                            <td className="p-4 text-center text-teal-600 font-semibold">{house.price} €</td>
                            <td className="p-4 text-right flex justify-end gap-2">
                              <button onClick={() => handleEditHouse(house)} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition">Редакция</button>
                              <button onClick={() => handleDeleteHouse(house.id, house.name)} className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition">Изтрий</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}