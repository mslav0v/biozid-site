import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HousesPage() {
  const houses = await prisma.house.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 text-white p-8 md:p-16 text-center">
        <h1 className="text-2xl md:text-4xl font-light uppercase tracking-[0.2em] mb-4">
          Каталог <span className="font-bold text-teal-500">БИОЗИД</span>
        </h1>
        <p className="text-sm text-slate-400 uppercase tracking-widest">Разгледайте нашите типови проекти</p>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {houses.length === 0 ? (
          <div className="text-center p-12 bg-white rounded border border-slate-200">
            <p className="text-slate-500 text-sm uppercase tracking-widest">Все още няма добавени модели.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {houses.map((house) => {
              const houseTags = Array.isArray(house.tags) 
                ? house.tags 
                : (house.tags ? (house.tags as string).split(',') : []);

              return (
                <div key={house.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition duration-300">
                  
                  {/* ПРОМЯНА 1: Снимката вече е линк към индивидуалната страница */}
                  <Link href={`/houses/${house.id}`}>
                    <div className="w-full h-64 bg-slate-200 relative cursor-pointer group">
                      {house.imageUrl ? (
                        <Image src={house.imageUrl} alt={house.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs uppercase tracking-widest">
                          Снимката се подготвя
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />
                    </div>
                  </Link>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      {/* ПРОМЯНА 2: Името също е линк */}
                      <Link href={`/houses/${house.id}`}>
                        <h2 className="text-lg font-bold text-slate-800 hover:text-teal-600 transition cursor-pointer">{house.name}</h2>
                      </Link>
                      <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-teal-100">
                        {house.area} м²
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-y border-slate-100 py-4">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Спални</p>
                        <p className="font-semibold text-slate-700">{house.bedrooms}</p>
                      </div>
                      <div className="text-center border-x border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Бани</p>
                        <p className="font-semibold text-slate-700">{house.bathrooms}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Етажи</p>
                        <p className="font-semibold text-slate-700">{house.floors}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {houseTags.map((tag: string, idx: number) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase tracking-wider">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Ориентировъчна цена</span>
                        <span className="text-lg font-bold text-slate-900">{house.price}</span>
                      </div>
                      {/* ПРОМЯНА 3: Бутонът "Изчисли" директно предава параметри на калкулатора */}
                      <Link 
                        href={`/calculator?templateArea=${house.area}&modelName=${encodeURIComponent(house.name)}`} 
                        className="bg-slate-900 text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-teal-600 transition"
                      >
                        Изчисли
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}