import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 7200;

export const metadata: Metadata = {
  title: 'Блог | Екологично строителство и конопени къщи | БИОЗИД',
  description: 'Идеи, иновации и съвети за модерното и екологично строителство с конопени панели.',
  alternates: {
    canonical: 'https://biozid.bg/blog',
  },
};

export default async function BlogPage() {
  // 1. Взимаме моделите къщи за страничната лента
  const houses = await prisma.house.findMany({
    take: 4, 
    orderBy: { createdAt: 'desc' }
  });

  // 2. Взимаме ВСИЧКИ статии от Prisma
  const rawPosts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      imageUrl: true,
      publishedAt: true,
    }
  });

  // 3. ФИЛТРИРАНЕ НА ДУБЛИКАТИ (Ако Make.com е записал една статия няколко пъти)
  const uniquePostsMap = new Map();
  rawPosts.forEach(post => {
    // Използваме заглавието като уникален ключ, за да премахнем дубликати
    if (!uniquePostsMap.has(post.title)) {
      uniquePostsMap.set(post.title, post);
    }
  });
  const posts = Array.from(uniquePostsMap.values());

  const tags = [
    'Еко строителство', 'Панели БИОЗИД', 'Евтини сглобяеми къщи',
    'Здравословен дом', 'Сглобяеми къщи', 'Енергийна ефективност'
  ];

  // Изображение по подразбиране, ако Make.com не е свалил снимка
  const DEFAULT_IMAGE = '/exterior-hero.jpg'; 

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Navbar />

      <main className="flex-1 pt-40 pb-20 px-6 max-w-[1300px] mx-auto w-full flex flex-col lg:flex-row gap-16">
        
        {/* ЛЯВА КОЛОНА - Списък със статии (Елегантен вертикален дизайн) */}
        <div className="flex-1 flex flex-col">
          <div className="mb-12 border-b border-slate-100 pb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Блог</h1>
            <p className="text-slate-500 text-lg max-w-xl font-light">Открийте идеи, иновации и полезни съвети за модерното екологично строителство и здравословния начин на живот.</p>
          </div>

          <div className="flex flex-col gap-12">
            {posts.length === 0 ? (
              <p className="text-slate-500 italic py-10">Все още няма публикувани статии.</p>
            ) : (
              posts.map((post) => {
                // Генерираме правилния линк. Ако slug липсва, правим опит да го създадем от заглавието.
                const postSlug = post.slug || post.title.toLowerCase().replace(/[^a-z0-9а-я]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || post.id;
                
                return (
                  <article key={post.id} className="group flex flex-col md:flex-row gap-8 items-start border-b border-slate-100 pb-12 last:border-0">
                    
                    {/* Снимка на статията */}
                    <Link href={`/blog/${postSlug}`} className="w-full md:w-2/5 shrink-0 relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 block">
                      <Image 
                        // Използваме default снимка, ако imageUrl е празно или невалидно
                        src={post.imageUrl && post.imageUrl.startsWith('http') ? post.imageUrl : DEFAULT_IMAGE} 
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    </Link>

                    {/* Текстова част */}
                    <div className="w-full md:w-3/5 flex flex-col pt-2">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-teal-600 mb-3">
                        {new Date(post.publishedAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      
                      <Link href={`/blog/${postSlug}`} className="block mb-4">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                          {post.title}
                        </h2>
                      </Link>
                      
                      <p className="text-slate-600 text-base leading-relaxed mb-6 font-light">
                        {post.excerpt || 'Прочетете цялата статия за екологично строителство и иновации в нашия блог...'}
                      </p>
                      
                      <Link href={`/blog/${postSlug}`} className="inline-flex items-center text-[11px] font-bold uppercase tracking-widest text-slate-900 group-hover:text-teal-700 transition-colors w-fit pb-1 border-b border-transparent group-hover:border-teal-700">
                        Продължи четенето
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* ДЯСНА КОЛОНА (SIDEBAR) */}
        <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-12 lg:sticky lg:top-32 h-fit">
          {/* ТЪРСЕНЕ */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Търсене</h3>
            <form action="/search" method="GET" className="relative border-b border-slate-200 pb-2 focus-within:border-teal-500 transition-colors">
              <input type="text" name="q" placeholder="Въведи дума..." className="w-full bg-transparent text-sm outline-none pr-8" required />
              <button type="submit" aria-label="Търсене" className="absolute right-0 top-0 text-slate-400 hover:text-teal-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </form>
          </div>

          {/* МОДЕЛИ КЪЩИ */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Нашите Къщи</h3>
            <div className="flex flex-col gap-8">
              {houses.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Няма открити модели</p>
              ) : (
                houses.map((house) => (
                  <Link key={house.id} href={`/houses/${house.slug || house.id}`} className="group block overflow-hidden">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-100 mb-3">
                      <Image 
                        src={house.imageUrl || '/house-placeholder.jpg'} 
                        alt={house.name} fill sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors leading-snug">{house.name}</h4>
                  </Link>
                ))
              )}
            </div>
            <Link href="/houses" className="block text-center mt-6 py-3 border border-slate-200 text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all rounded">
              Всички Модели
            </Link>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
}