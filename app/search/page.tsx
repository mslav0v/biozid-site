import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';

  // Общ масив, в който ще съберем всички резултати
  let allResults: Array<{
    id: string;
    title: string;
    desc?: string;
    url: string;
    image?: string | null;
    typeLabel: string;
  }> = [];

  if (query) {
    const searchLower = query.toLowerCase();

    // 1. ТЪРСЕНЕ В КЪЩИТЕ (Prisma)
    try {
      const houses = await prisma.house.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        }
      });
      
      const mappedHouses = houses.map(h => ({
        id: `house-${h.id}`,
        title: h.name,
        url: `/houses/${h.id}`,
        image: h.imageUrl,
        typeLabel: 'Модел Къща'
      }));
      
      allResults.push(...mappedHouses);
    } catch (error) {
      console.log("Грешка при търсене на къщи:", error);
    }

    // 2. ТЪРСЕНЕ В ЛОКАЛНИЯ БЛОГ (Prisma - За всеки случай)
    try {
      const blogPosts = await prisma.blogPost.findMany({
        where: {
          title: { contains: query, mode: 'insensitive' }
        }
      });
      
      const mappedBlogs = blogPosts.map(p => ({
        id: `blog-local-${p.id}`,
        title: p.title,
        url: `/blog/${p.slug || p.id}`,
        typeLabel: 'Блог Статия'
      }));

      allResults.push(...mappedBlogs);
    } catch (error) {
      // Игнорираме, ако таблицата липсва
    }

    // 3. ТЪРСЕНЕ В SORO СТАТИИТЕ (Външния източник)
    try {
      // Изтегляме скрипта на Soro
      const soroRes = await fetch('https://app.trysoro.com/api/embed/c93c5a74-b1e7-4bbe-af5e-c74688e230f3', { cache: 'no-store' });
      const soroText = await soroRes.text();
      
      // Извличаме JSON масива със статиите чрез Regex
      const match = soroText.match(/var SORO_ARTICLES\s*=\s*(\[.*?\]);/s);
      
      if (match && match[1]) {
        const articles = JSON.parse(match[1]);
        
        // Филтрираме Soro статиите по заглавие или резюме
        const matchedSoro = articles.filter((a: any) => 
          (a.title && a.title.toLowerCase().includes(searchLower)) ||
          (a.excerpt && a.excerpt.toLowerCase().includes(searchLower))
        );

        const mappedSoro = matchedSoro.map((a: any) => ({
          id: `soro-${a.id}`,
          title: a.title,
          desc: a.excerpt,
          // Според кода на Soro, дълбоките линкове работят чрез параметър ?post=slug
          url: `/blog?post=${a.slug}`,
          image: a.image,
          typeLabel: 'Блог Статия'
        }));

        allResults.push(...mappedSoro);
      }
    } catch (error) {
      console.log("Грешка при търсене в Soro:", error);
    }

    // 4. ТЪРСЕНЕ В СТАТИЧНИТЕ СТРАНИЦИ
    const staticPages = [
      { title: 'Технология', url: '/technology', desc: 'Научете всичко за иновативните панели от коноп и дърво.' },
      { title: 'Предимства', url: '/advantages', desc: 'Защо да изберете екологично и енергийно ефективно строителство.' },
      { title: 'Процеси', url: '/processes', desc: 'Какви са етапите на проектиране и изграждане на вашия дом.' },
      { title: 'Калкулатор', url: '/calculator', desc: 'Пресметнете ориентировъчната цена за вашия проект.' },
      { title: 'Контакти', url: '/contacts', desc: 'Свържете се с нас за безплатна консултация и оферта.' },
    ];

    const matchedPages = staticPages
      .filter(p => p.title.toLowerCase().includes(searchLower) || p.desc.toLowerCase().includes(searchLower))
      .map(p => ({
        id: `page-${p.url}`,
        title: p.title,
        desc: p.desc,
        url: p.url,
        typeLabel: 'Страница'
      }));

    allResults.push(...matchedPages);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* HEADER */}
      <Navbar />

      {/* ОСНОВНО СЪДЪРЖАНИЕ */}
      <main className="flex-1 pt-32 md:pt-40 pb-20 px-4 md:px-8 max-w-[1300px] mx-auto w-full">
        
        {/* Заглавие и форма за търсене */}
        <div className="mb-12 md:mb-16">
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
              Резултати от търсенето
            </h1>
            {query ? (
              <p className="text-slate-500 text-base md:text-lg">
                Показваме всички резултати за: <span className="font-bold text-teal-700">"{query}"</span>
              </p>
            ) : (
              <p className="text-slate-500 text-base md:text-lg">
                Въведете дума за търсене в полето по-долу.
              </p>
            )}
          </div>

          <div className="max-w-2xl mx-auto md:mx-0">
            <form action="/search" method="GET" className="relative flex items-center shadow-sm">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Търси в целия сайт (къщи, статии, коноп, цени)..."
                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                required
              />
              <button type="submit" className="absolute right-2 md:right-3 p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* АКО НЯМА РЕЗУЛТАТИ */}
        {query && allResults.length === 0 && (
          <div className="bg-white rounded-[2rem] p-10 md:p-16 text-center border border-slate-100 shadow-sm max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Няма намерени резултати</h3>
            <p className="text-slate-500 mb-8">Не открихме съвпадения за "{query}" в сайта. Опитайте с друга ключова дума.</p>
            <Link 
              href="/" 
              className="inline-block bg-slate-900 text-white font-bold uppercase tracking-widest text-xs py-4 px-8 rounded-xl hover:bg-teal-600 transition-colors"
            >
              Към Начало
            </Link>
          </div>
        )}

        {/* АКО ИМА РЕЗУЛТАТИ - ПОКАЗВАМЕ ВСИЧКО В ЕДНА ОБЩА РЕШЕТКА */}
        {allResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {allResults.map((res) => (
              <Link 
                key={res.id} 
                href={res.url} 
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-100 transition-all duration-300"
              >
                {/* Снимка (Ако има такава) */}
                {res.image ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={res.image || '/house-placeholder.jpg'}
                      alt={res.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </div>
                ) : (
                  // Ако няма снимка (статии/страници), слагаме зелена лента
                  <div className="h-2 bg-teal-600 w-full shrink-0" />
                )}

                <div className="p-6 md:p-8 flex flex-col flex-1">
                  {/* Етикет (Модел Къща, Блог Статия, Страница) */}
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                    {res.typeLabel}
                  </span>
                  
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors mb-3 line-clamp-2">
                    {res.title}
                  </h3>
                  
                  {/* Описание / Резюме */}
                  {res.desc && (
                    <p className="text-sm text-slate-500 mb-4 line-clamp-3">{res.desc}</p>
                  )}

                  <div className="mt-auto pt-4 flex items-center text-xs font-bold text-teal-600 uppercase tracking-[0.15em]">
                    Към страницата
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}