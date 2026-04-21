"use client";

import Image from 'next/image';
import Link from 'next/link';

// Временна структура. Снимките и данните ще идват от базата данни (SuperHosting).
const MOCK_HOUSES = [
  {
    id: 'biozid-alpha',
    name: 'Модел Алфа',
    area: 115,
    bedrooms: 3,
    bathrooms: 2,
    floors: 1,
    price: 'от 125,000 €',
    tags: ['Едноетажна', 'Бестселър']
  },
  {
    id: 'biozid-omega',
    name: 'Модел Омега',
    area: 180,
    bedrooms: 4,
    bathrooms: 3,
    floors: 2,
    price: 'от 190,000 €',
    tags: ['Двуетажна', 'Премиум']
  },
  {
    id: 'biozid-eco',
    name: 'Модел Еко Смарт',
    area: 85,
    bedrooms: 2,
    bathrooms: 1,
    floors: 1,
    price: 'от 95,000 €',
    tags: ['Компактна', 'Еко']
  }
];

export default function HousesCatalog() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-24 pb-20 px-6">
      
      {/* HEADER */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 h-16 md:h-20">
        <div className="flex items-center justify-between px-6 md:px-10 h-full max-w-[1800px] mx-auto">
          <Link href="/">
             <Image src="/logo.png" alt="БИОЗИД" width={110} height={32} priority className="cursor-pointer" />
          </Link>
          <div className="hidden lg:flex space-x-8 text-xs font-bold tracking-widest text-slate-800 uppercase">
             <Link href="/houses" className="text-teal-700 border-b-2 border-teal-700 pb-1">Къщи</Link>
             <Link href="/calculator" className="hover:text-teal-700 transition">Калкулатор</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto pt-10">
        <div className="mb-12 md:mb-20 text-center md:text-left border-b border-slate-200 pb-8">
          <h1 className="text-4xl md:text-6xl font-extralight tracking-tighter mb-4 text-slate-900">Каталог <span className="font-medium">Модели</span></h1>
          <p className="text-lg text-slate-500 font-light max-w-2xl">Разгледайте нашите стандартизирани концепции, оптимизирани за бързо производство и максимална енергийна ефективност.</p>
        </div>

        {/* МРЕЖА С КЪЩИ (GRID) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {MOCK_HOUSES.map((house) => (
            <div key={house.id} className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-100 group cursor-pointer hover:shadow-2xl transition-all duration-300 flex flex-col">
              
              {/* PLACEHOLDER ЗА СНИМКА */}
              <div className="relative aspect-[4/3] bg-slate-200 flex items-center justify-center overflow-hidden">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  [ Снимка от Админ ]
                </span>
                
                <div className="absolute top-4 left-4 flex gap-2">
                  {house.tags.map(tag => (
                    <span key={tag} className="bg-white/90 backdrop-blur text-slate-900 px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded shadow-sm">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Информация */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-light tracking-tight text-slate-900">{house.name}</h2>
                    <span className="text-teal-700 font-bold text-lg">{house.price}</span>
                  </div>
                  
                  {/* Спецификации */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 mt-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Площ</span>
                      <span className="text-sm font-bold text-slate-700">{house.area} м²</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Спални</span>
                      <span className="text-sm font-bold text-slate-700">{house.bedrooms} бр.</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Бани</span>
                      <span className="text-sm font-bold text-slate-700">{house.bathrooms} бр.</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Етажи</span>
                      <span className="text-sm font-bold text-slate-700">{house.floors}</span>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-8 bg-slate-50 text-slate-900 border border-slate-200 py-3 text-xs font-bold uppercase tracking-widest group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-colors rounded">
                  Към проекта
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}