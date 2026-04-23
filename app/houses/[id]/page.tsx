import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function HouseDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. Първо "разопаковаме" параметрите с await (Ново изискване на Next.js 15+)
  const { id } = await params;

  // 2. След това търсим къщата с вече наличното ID
  const house = await prisma.house.findUnique({
    where: { id }
  });

  // Ако някой въведе грешно ID в URL-а
  if (!house) {
    notFound();
  }

  // Обработка на таговете
  const houseTags = Array.isArray(house.tags) 
    ? house.tags 
    : (house.tags ? (house.tags as string).split(',') : []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-24 pb-20">
      
      {/* Навигация тип "Хлебни трохички" */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <Link href="/houses" className="text-teal-600 text-xs font-bold uppercase tracking-widest hover:underline transition">
          ← Обратно към каталога
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
          
          {/* ЛЯВА ЧАСТ: СНИМКА */}
          <div className="lg:w-1/2 relative min-h-[400px] lg:min-h-full bg-slate-100">
            {house.imageUrl ? (
              <Image 
                src={house.imageUrl} 
                alt={house.name} 
                fill 
                className="object-cover" 
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm uppercase tracking-widest font-bold">
                Снимката се подготвя
              </div>
            )}
            
            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
              {houseTags.map((tag: string, idx: number) => (
                <span key={idx} className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider shadow-sm">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* ДЯСНА ЧАСТ: ИНФОРМАЦИЯ */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col">
            
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900">{house.name}</h1>
              <span className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest border border-teal-100">
                {house.area} м²
              </span>
            </div>

            <p className="text-2xl font-bold text-teal-600 mb-8">
              {typeof house.price === 'number' ? `${house.price.toLocaleString()} €` : house.price}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Спални</p>
                <p className="text-xl font-black text-slate-800">{house.bedrooms}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Бани</p>
                <p className="text-xl font-black text-slate-800">{house.bathrooms}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Етажи</p>
                <p className="text-xl font-black text-slate-800">{house.floors}</p>
              </div>
            </div>

            <div className="flex-1 mb-10">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-4 border-b border-slate-100 pb-2">
                Описание на проекта
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                {house.description || "Липсва детайлно описание за този модел."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <Link 
                href={`/calculator?templateArea=${house.area}&modelName=${encodeURIComponent(house.name)}`}
                className="flex-1 bg-teal-600 text-white text-center py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition shadow-lg"
              >
                Изчисли този модел
              </Link>
              <Link 
                href="/contacts"
                className="flex-1 bg-white border-2 border-slate-200 text-slate-700 text-center py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-teal-600 hover:text-teal-600 transition"
              >
                Свържи се с нас
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}