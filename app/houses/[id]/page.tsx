import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function HouseDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  const house = await prisma.house.findUnique({
    where: { id }
  });

  if (!house) {
    notFound();
  }

  // Форматиране на цената с интервали и Евро знак
  const priceValue = typeof house.price === 'number' 
    ? house.price 
    : parseFloat(house.price as any);

  const formattedPrice = !isNaN(priceValue)
    ? new Intl.NumberFormat('en-US').format(priceValue).replace(/,/g, ' ') + ' €'
    : house.price + ' €';

  const houseTags = Array.isArray(house.tags) ? house.tags : [];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Оптимизиран падинг за мобилни: pt-28 */}
      <div className="pt-28 md:pt-44 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          {/* Breadcrumbs */}
          <Link href="/houses" className="inline-flex items-center text-teal-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 md:mb-10 hover:opacity-70 transition">
            <span className="mr-2">←</span> Обратно към каталога
          </Link>

          <div className="flex flex-col lg:flex-row gap-10 md:gap-16">
            
            {/* ЛЯВА ЧАСТ: ГОРЯМА СНИМКА */}
            <div className="lg:w-3/5 w-full">
              <div className="relative aspect-video md:aspect-[4/3] rounded-3xl md:rounded-[40px] overflow-hidden shadow-2xl border border-slate-50">
                {house.imageUrl ? (
                  <Image src={house.imageUrl} alt={house.name} fill className="object-cover" priority />
                ) : (
                  <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Снимката се подготвя</div>
                )}
              </div>
            </div>

            {/* ДЯСНА ЧАСТ: ИНФОРМАЦИЯ И ПОРЪЧКА */}
            <div className="lg:w-2/5 w-full flex flex-col">
              <div className="mb-8">
                {/* Оптимизиран размер на шрифта за мобилни */}
                <h1 className="text-3xl md:text-5xl font-light tracking-tighter text-slate-900 mb-4">{house.name}</h1>
                <div className="flex flex-wrap gap-2 mb-6">
                  {houseTags.map((tag, idx) => (
                    <span key={idx} className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-slate-100">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-3xl font-bold text-teal-700 tracking-tight">
                  {formattedPrice}
                </p>
              </div>

              {/* ОСНОВНИ ПАРАМЕТРИ */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 md:mb-10 border-y border-slate-50 py-6 md:py-8">
                <div className="text-center">
                  <p className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Квадратура</p>
                  <p className="text-lg sm:text-xl font-light text-slate-800">{house.area} м²</p>
                </div>
                <div className="text-center border-x border-slate-50">
                  <p className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Спални</p>
                  <p className="text-lg sm:text-xl font-light text-slate-800">{house.bedrooms}</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Етажи</p>
                  <p className="text-lg sm:text-xl font-light text-slate-800">{house.floors}</p>
                </div>
              </div>

              {/* ТЕХНИЧЕСКА СПЕЦИФИКАЦИЯ */}
              <div className="space-y-6 mb-10 md:mb-12">
                <h3 className="text-[10px] font-bold uppercase text-slate-900 tracking-[0.3em] border-b pb-2">Технически детайли</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: "Конструкция", value: house.constructionType },
                    { label: "Метални профили", value: house.profileSize },
                    { label: "Стенна система", value: house.wallThickness },
                    { label: "Покривна система", value: house.roofType },
                    { label: "Дограма", value: house.windowsType },
                    { label: "Санитарни възли", value: `${house.bathrooms} бани, ${house.toilets} тоалетни` },
                    { label: "Тераси", value: house.terraces > 0 ? `${house.terraces} бр.` : "Няма" }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-slate-50 pb-2 gap-1 sm:gap-0">
                      <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-medium">{item.label}</span>
                      <span className="text-sm text-slate-700 font-light">{item.value || "По стандарт"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ОПИСАНИЕ */}
              <div className="mb-10 md:mb-12">
                <p className="text-slate-500 leading-relaxed font-light italic text-sm md:text-base">
                  {house.description || "Този проект предлага модерен дизайн и високотехнологично изпълнение по системата БИОЗИД."}
                </p>
              </div>

              {/* БУТОНИ ЗА ДЕЙСТВИЕ - w-full на мобилни */}
              <div className="flex flex-col gap-4 mt-auto">
                <Link 
                  href={`/calculator?templateArea=${house.area}&modelName=${encodeURIComponent(house.name)}`}
                  className="w-full bg-slate-900 text-white text-center py-5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-teal-700 transition-all shadow-xl"
                >
                  Поръчай тази къща
                </Link>
                <Link 
                  href="/contacts"
                  className="w-full bg-white border border-slate-200 text-slate-900 text-center py-5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] hover:border-teal-700 hover:text-teal-700 transition-all"
                >
                  Свържи се с нас
                </Link>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}