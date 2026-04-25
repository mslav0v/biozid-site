import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function HousesPage() {
  const houses = await prisma.house.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="pt-32 md:pt-44 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-[1400px]">
          
          {/* ЗАГЛАВНА СЕКЦИЯ */}
          <div className="text-center mb-16 md:mb-24">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-700 mb-6">Каталог</h4>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-slate-900 leading-tight mb-6">
              Изберете вашия <br className="sm:hidden" /> 
              <span className="italic text-teal-700 font-medium">мечтан дом</span>
            </h1>
            <p className="text-base md:text-xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
              Разгледайте нашите готови архитектурни решения, проектирани за безкомпромисен комфорт и енергийна независимост.
            </p>
          </div>

          {houses.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">Все още няма добавени модели.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {houses.map((house) => {
                // Обработка на таговете
                const houseTags = Array.isArray(house.tags) 
                  ? house.tags 
                  : (house.tags ? (house.tags as string).split(',') : []);

                // Форматиране на цената (200 000 €)
                const priceValue = typeof house.price === 'number' 
                  ? house.price 
                  : parseFloat(house.price as any);

                const formattedPrice = !isNaN(priceValue)
                  ? new Intl.NumberFormat('en-US').format(priceValue).replace(/,/g, ' ') + ' €'
                  : house.price + ' €';

                return (
                  <div key={house.id} className="group flex flex-col bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-50">
                    
                    {/* СНИМКА С ЛИНК */}
                    <Link href={`/houses/${house.id}`} className="relative h-64 md:h-72 overflow-hidden">
                      {house.imageUrl ? (
                        <Image 
                          src={house.imageUrl} 
                          alt={house.name} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                          Снимката се подготвя
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Етикет за квадратура върху снимката */}
                      <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                         <span className="text-xs font-bold text-slate-900">{house.area} м²</span>
                      </div>
                    </Link>
                    
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="mb-6">
                        <Link href={`/houses/${house.id}`}>
                          <h2 className="text-2xl font-light text-slate-900 group-hover:text-teal-700 transition-colors leading-tight mb-2">
                            {house.name}
                          </h2>
                        </Link>
                        <div className="flex flex-wrap gap-2">
                          {houseTags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-[8px] font-bold uppercase tracking-widest text-teal-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* ХАРАКТЕРИСТИКИ - С по-подробна информация */}
                      <div className="grid grid-cols-3 gap-2 border-y border-slate-50 py-6 mb-8">
                        <div className="text-center">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Спални</p>
                          <p className="text-lg font-light text-slate-700">{house.bedrooms}</p>
                        </div>
                        <div className="text-center border-x border-slate-50">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Бани/WC</p>
                          <p className="text-lg font-light text-slate-700">{house.bathrooms}/{house.toilets || 1}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Етажи</p>
                          <p className="text-lg font-light text-slate-700">{house.floors}</p>
                        </div>
                      </div>

                      {/* ЦЕНА И БУТОН */}
                      <div className="mt-auto pt-6 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Инвестиция от</span>
                          <span className="text-xl font-bold text-slate-900">
                            {formattedPrice}
                          </span>
                        </div>
                        <Link 
                          href={`/calculator?templateArea=${house.area}&modelName=${encodeURIComponent(house.name)}`} 
                          className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/20"
                        >
                          Поръчай
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}