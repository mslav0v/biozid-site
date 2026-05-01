import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PrismaClient } from '@prisma/client';
import Script from 'next/script';

const prisma = new PrismaClient();
export const revalidate = 60; 

function formatDateBadge(dateString: string | Date) {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('bg-BG', { month: 'short' }).replace('.', '')
  };
}

export default async function BlogPage() {
  // 1. Взимаме статиите (за мета данни, ако потрябват)
  const posts = await prisma.blogPost.findMany({
    orderBy: {
      publishedAt: 'desc'
    }
  });

  // 2. Взимаме моделите къщи за страничната лента
  // Ако моделът ти в Prisma се казва различно (напр. HouseModel), смени го тук
  const houses = await prisma.house.findMany({
    take: 4, // Показваме 4-те най-популярни или нови модела
  });

  const tags = ['Еко строителство', 'Панели БИОЗИД', 'Евтини сглобяеми къщи', 'Здравословен дом', 'Сглобяеми къщи', 'Енергийна ефективност', 'пасивни къщи', 'мобилни къщи', 'бързо строителство', 'модулни къщи'];

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Navbar />

      <main className="flex-1 pt-40 pb-20 px-6 max-w-[1300px] mx-auto w-full flex flex-col lg:flex-row gap-16">
        
        {/* ЛЯВА КОЛОНА - Управлява се от Soro */}
        <div className="flex-1 flex flex-col">
          
          <div className="mb-8">
            <h1 className="text-5xl font-serif font-bold text-slate-900 mb-4">Блог</h1>
            <p className="text-slate-500 text-lg max-w-md">Идеи, иновации и съвети за модерното и екологично строителство.</p>
          </div>

          <div id="soro-blog" className="min-h-[600px]">
            <div className="animate-pulse flex flex-col gap-8">
              <div className="h-64 bg-slate-50 rounded-xl w-full"></div>
              <div className="h-8 bg-slate-50 rounded w-3/4"></div>
              <div className="h-4 bg-slate-50 rounded w-1/2"></div>
            </div>
          </div>

          <Script 
            src="https://app.trysoro.com/api/embed/c93c5a74-b1e7-4bbe-af5e-c74688e230f3"
            strategy="afterInteractive" 
          />
        </div>

        {/* ДЯСНА КОЛОНА (SIDEBAR) */}
        <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-12 lg:sticky lg:top-32 h-fit">
          
          {/* ТЪРСЕНЕ */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Търсене</h3>
            <div className="relative border-b border-slate-200 pb-2 focus-within:border-teal-500 transition-colors">
              <input 
                type="text" 
                placeholder="Въведи дума..." 
                className="w-full bg-transparent text-sm outline-none pr-8"
              />
              <button className="absolute right-0 top-0 text-slate-400 hover:text-teal-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </div>
          </div>

          {/* НОВАТА ЧАСТ: МОДЕЛИ КЪЩИ */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Нашите Къщи</h3>
            <div className="flex flex-col gap-8">
              {houses.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Няма открити модели</p>
              ) : (
                houses.map((house) => (
                  <Link 
                    key={house.id} 
                    href={`/houses/${house.id}`} 
                    className="group block overflow-hidden"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-100 mb-3">
                      <img 
                        src={house.imageUrl || '/house-placeholder.jpg'} 
                        alt={house.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors leading-snug">
                      {house.title}
                    </h4>
                    <p className="text-[11px] text-teal-600 font-bold uppercase tracking-wider mt-1">Виж модела →</p>
                  </Link>
                ))
              )}
            </div>
            
            {/* Бутон към цялата страница с къщи */}
            <Link 
              href="/houses" 
              className="block text-center mt-6 py-3 border border-slate-200 text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all rounded"
            >
              Всички Модели
            </Link>
          </div>

          {/* ТАГОВЕ */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Тагове</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {tags.map(tag => (
                <span 
                  key={tag} 
                  className="text-[11px] text-slate-500 hover:text-teal-600 cursor-pointer transition-colors"
                >
                  #{tag.replace(/\s+/g, '')}
                </span>
              ))}
            </div>
          </div>

        </aside>
      </main>

      <Footer />
    </div>
  );
}