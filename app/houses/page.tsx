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
                // 1. ЗАЩИТА НА ТАГОВЕТЕ (дори ако са null или грешен тип)
                let houseTags: string[] = [];
                if (Array.isArray(house.tags)) {
                  houseTags = house.tags.map(t => String(t));
                } else if (typeof house.tags === 'string') {
                  houseTags = (house.tags as string).split(',').map(t => t.trim());
                }

                // 2. ЗАЩИТА НА ЦЕНАТА (чистим букви и разстояния преди форматиране)
                const rawPrice = String(house.price || '0');
                const cleanPrice = rawPrice.replace(/[^0-9.]/g, ''); // Взема само цифрите
                const priceValue = parseFloat(cleanPrice);

                const formattedPrice = !isNaN(priceValue) && priceValue > 0
                  ? new Intl.NumberFormat('en-US').format(priceValue).replace(/,/g, ' ') + ' €'
                  : rawPrice + (rawPrice.includes('€') ? '' : ' €');

                // 3. ЗАЩИТА НА ИМЕ И КВАДРАТУРА (за да не гърмят линковете)
                const safeName = house.name || 'Неименуван модел';
                const safeArea = house.area || 0;

                return (
                  <div key={house.id} className="group flex flex-col bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-50">
                    
                    {/* СНИМКА С ЛИНК */}
                    <Link href={`/houses/${house.id}`} className="relative h-64 md:h-72 overflow-hidden">
                      {house.imageUrl ? (
                        <Image 
                          src={house.imageUrl} 
                          alt={safeName} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                          Снимката се подготвя
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Етикет за квадратура */}
                      <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                         <span className="text-xs font-bold text-slate-900">{safeArea} м²</span>
                      </div>
                    </Link>
                    
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="mb-6">
                        <Link href={`/houses/${house.id}`}>
                          <h2 className="text-2xl font-light text-slate-900 group-hover:text-teal-700 transition-colors leading-tight mb-2">
                            {safeName}
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

                      {/* ХАРАКТЕРИСТИКИ */}
                      <div className="grid grid-cols-3 gap-2 border-y border-slate-50 py-6 mb-8">
                        <div className="text-center">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Спални</p>
                          <p className="text-lg font-light text-slate-700">{house.bedrooms || 0}</p>
                        </div>
                        <div className="text-center border-x border-slate-50">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Бани/WC</p>
                          <p className="text-lg font-light text-slate-700">{house.bathrooms || 0}/{house.toilets || 1}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Етажи</p>
                          <p className="text-lg font-light text-slate-700">{house.floors || 1}</p>
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
                          href={`/calculator?templateArea=${safeArea}&modelName=${encodeURIComponent(safeName)}`} 
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