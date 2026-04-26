import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function HouseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const house = await prisma.house.findUnique({ where: { id } });

  if (!house) notFound();

  // Подготовка на галерията (Главна снимка + допълнителни)
  const gallery = house.gallery && house.gallery.length > 0 
    ? [house.imageUrl, ...house.gallery].filter(Boolean) as string[]
    : [house.imageUrl].filter(Boolean) as string[];

  const rawPrice = String(house.price || '0');
  const priceValue = parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
  const formattedPrice = !isNaN(priceValue) && priceValue > 0
    ? new Intl.NumberFormat('en-US').format(priceValue).replace(/,/g, ' ') + ' €'
    : rawPrice + ' €';

  // Генериране на автоматичното съобщение
  const autoMessage = `Здравейте, интересувам се от модел ${house.name} (${house.area} кв.м.). Моля да се свържете с мен за повече информация.`;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-28 md:pt-44 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Link href="/houses" className="inline-flex items-center text-teal-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 md:mb-10 hover:opacity-70 transition">
            <span className="mr-2">←</span> Обратно към каталога
          </Link>

          <div className="flex flex-col lg:flex-row gap-10 md:gap-20">
            
            {/* ЛЯВА ЧАСТ: ГАЛЕРИЯ */}
            <div className="lg:w-3/5 w-full space-y-4">
              <div className="relative aspect-video md:aspect-[16/10] rounded-3xl md:rounded-[40px] overflow-hidden shadow-2xl border border-slate-50">
                {house.imageUrl ? (
                  <Image src={house.imageUrl} alt={house.name} fill className="object-cover" priority />
                ) : (
                  <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Снимката се подготвя</div>
                )}
              </div>
              
              {/* МАЛКИ СНИМКИ (ГАЛЕРИЯ) */}
              {gallery.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {gallery.map((img, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-32 h-24 md:w-44 md:h-32 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                      <Image src={img} alt={`${house.name} - ${idx}`} fill className="object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ДЯСНА ЧАСТ: ИНФОРМАЦИЯ */}
            <div className="lg:w-2/5 w-full flex flex-col">
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-slate-900 mb-4">{house.name}</h1>
                <p className="text-3xl font-bold text-teal-700 tracking-tight">{formattedPrice}</p>
              </div>

              {/* ОСНОВНИ ПАРАМЕТРИ */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-10 border-y border-slate-50 py-8">
                <div className="text-center">
                  <p className="text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Площ</p>
                  <p className="text-xl font-light text-slate-800">{house.area} м²</p>
                </div>
                <div className="text-center border-x border-slate-50">
                  <p className="text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Спални</p>
                  <p className="text-xl font-light text-slate-800">{house.bedrooms || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Етажи</p>
                  <p className="text-xl font-light text-slate-800">{house.floors || 1}</p>
                </div>
              </div>

              {/* ТЕХНИЧЕСКА СПЕЦИФИКАЦИЯ - ПОДРОБНА */}
              <div className="space-y-8 mb-12">
                <div>
                  <h3 className="text-[10px] font-bold uppercase text-teal-700 tracking-[0.3em] mb-4">Конструкция и стени</h3>
                  <div className="space-y-3">
                    <SpecItem label="Вид конструкция" value={house.constructionType} />
                    <SpecItem label="Размери профили" value={house.profileSize} />
                    <SpecItem label="Технология стена" value={house.wallTech} />
                    <SpecItem label="Дебелина стена" value={house.wallThickness} />
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase text-teal-700 tracking-[0.3em] mb-4">Архитектурни детайли</h3>
                  <div className="space-y-3">
                    <SpecItem label="Вид покрив" value={house.roofType} />
                    <SpecItem label="Вид дограма" value={house.windowsType} />
                    <SpecItem label="Санитарни възли" value={`${house.bathrooms || 0} бани, ${house.toilets || 1} тоалетни`} />
                    <SpecItem label="Тераси" value={house.terraces > 0 ? `${house.terraces} бр.` : "Няма"} />
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <p className="text-slate-500 leading-relaxed font-light italic text-sm">
                  {house.description || "Липсва описание за този модел."}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* Запазен е само бутонът за запитване, стилизиран като основен Call-To-Action */}
                <Link href={`/contacts?message=${encodeURIComponent(autoMessage)}`} className="bg-slate-900 text-white text-center py-5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-teal-700 transition-all shadow-xl">
                  Запитване за модела
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

// Помощен компонент за редовете със спецификации
function SpecItem({ label, value }: { label: string, value: any }) {
  return (
    <div className="flex justify-between items-end border-b border-slate-50 pb-2">
      <span className="text-[10px] text-slate-400 uppercase font-medium">{label}</span>
      <span className="text-sm text-slate-700 font-light">{value || "По стандарт"}</span>
    </div>
  );
}