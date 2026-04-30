import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Опреснява страницата на всеки 60 секунди при нова статия
export const revalidate = 60; 

// Помощна функция за форматиране на датата (напр. "30 Апр")
function formatDateBadge(dateString: string | Date) {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('bg-BG', { month: 'short' }).replace('.', '')
  };
}

export default async function BlogPage() {
  // Взимаме всички статии от базата данни
  const posts = await prisma.blogPost.findMany({
    orderBy: {
      publishedAt: 'desc'
    }
  });

  // Взимаме само последните 5 статии за страничната лента
  const recentPosts = posts.slice(0, 5);

  // Примерни тагове (в бъдеще могат да идват от базата данни)
  const tags = ['Еко строителство', 'Панели БИОЗИД', 'Евтини сглобяеми къщи', 'Здравословен дом', 'Сглобяеми къщи', 'Енергийна ефективност', 'пасивни къщи', 'мобилни къщи', 'бързо строителство', 'модулни къщи'];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* Основен контейнер - Разделен на 2 колони за Десктоп */}
      <main className="flex-1 pt-32 pb-20 px-4 max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row gap-12">
        
        {/* ЛЯВА КОЛОНА: Списък със статии */}
        <div className="flex-1 flex flex-col gap-10">
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 border-b-2 border-teal-600 pb-4 inline-block w-fit">
            Блог
          </h1>

          {posts.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-slate-100 text-center text-slate-500 italic shadow-sm">
              Все още няма публикувани статии.
            </div>
          ) : (
            posts.map((post) => {
              const { day, month } = formatDateBadge(post.publishedAt);
              
              return (
                <article 
                  key={post.id} 
                  className="group flex flex-col md:flex-row bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden hover:-translate-y-1"
                >
                  {/* Снимка с анимация и дата-бадж */}
                  <div className="w-full md:w-2/5 relative overflow-hidden h-64 md:h-auto">
                    <Link href={`/blog/${post.id}`} className="block w-full h-full">
                      <img 
                        src={post.imageUrl || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc'} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Дата бадж (като в примера) */}
                      <div className="absolute top-4 left-4 bg-teal-500/90 backdrop-blur text-white px-3 py-1.5 text-center shadow-lg rounded-sm">
                        <span className="block text-xl font-black leading-none">{day}</span>
                        <span className="block text-[11px] uppercase tracking-wider font-bold mt-1">{month}</span>
                      </div>
                    </Link>
                  </div>

                  {/* Съдържание на статията */}
                  <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        БИОЗИД
                      </span>
                    </div>
                    
                    <h2 className="text-xl md:text-2xl font-bold text-teal-600 mb-4 leading-tight group-hover:text-teal-800 transition-colors">
                      <Link href={`/blog/${post.id}`}>
                        {post.title}
                      </Link>
                    </h2>
                    
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed flex-1 line-clamp-3">
                      {post.excerpt || post.content.substring(0, 150) + '...'}
                    </p>
                    
                    <Link 
                      href={`/blog/${post.id}`} 
                      className="inline-flex items-center justify-center border border-slate-300 text-slate-600 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-colors w-fit rounded"
                    >
                      Научи повече <span className="ml-2 font-normal">→</span>
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* ДЯСНА КОЛОНА (SIDEBAR): Търсачка, Категории, Тагове */}
        <aside className="w-full lg:w-[350px] shrink-0 flex flex-col gap-10 mt-8 lg:mt-0 pt-4 lg:pt-[72px]">
          
          {/* Търсене в блога */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Търсене в блога</h3>
            <div className="flex w-full">
              <input 
                type="text" 
                placeholder="Търсене..." 
                className="flex-1 bg-slate-50 border border-slate-200 border-r-0 px-4 py-2 text-sm outline-none focus:border-teal-500 rounded-l transition-colors"
              />
              <button className="bg-slate-800 text-white px-4 hover:bg-teal-600 transition-colors rounded-r flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </div>
          </div>

          {/* Последни статии (вместо Категории, тъй като в момента нямаме категории в базата) */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Последни статии</h3>
            <ul className="flex flex-col gap-3">
              {recentPosts.length === 0 ? (
                <li className="text-sm text-slate-400 italic">Няма статии</li>
              ) : (
                recentPosts.map(rp => (
                  <li key={`sidebar-${rp.id}`}>
                    <Link href={`/blog/${rp.id}`} className="text-sm text-slate-600 hover:text-teal-600 transition-colors flex items-start gap-2 group">
                      <span className="text-teal-500 mt-0.5 group-hover:translate-x-1 transition-transform">›</span>
                      <span className="line-clamp-2 leading-snug">{rp.title}</span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Блог тагове */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Блог тагове</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-slate-50 border border-slate-200 text-slate-600 text-[11px] uppercase tracking-wide font-medium px-3 py-1.5 rounded hover:bg-teal-600 hover:text-white hover:border-teal-600 cursor-pointer transition-colors"
                >
                  {tag}
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