import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';

// Казваме на Next.js да НЕ генерира тази страница статично по време на билд при липса на база/кеш
export const dynamic = 'force-dynamic';

// Автоматично обновяване на кеша на всеки 2 часа (7200 секунди)
export const revalidate = 7200;

// 1. ПЪЛНИ SEO И AI МЕТАДАННИ
export const metadata: Metadata = {
  title: 'Блог | Екологично строителство и конопени къщи | БИОЗИД',
  description: 'Идеи, иновации и съвети за модерното и екологично строителство с конопени панели. Научете повече за паропропускливите и енергийно ефективни сглобяеми къщи.',
  keywords: [
    'Еко строителство',
    'Панели БИОЗИД',
    'Евтини сглобяеми къщи',
    'Здравословен дом',
    'Сглобяеми къщи',
    'Енергийна ефективност',
    'пасивни къщи',
    'мобилни къщи',
    'бързо строителство',
    'модулни къщи',
    'конопена изолация'
  ],
  alternates: {
    canonical: 'https://biozid.bg/blog',
  },
  openGraph: {
    title: 'Блог за екологично строителство и конопени къщи | БИОЗИД',
    description: 'Идеи, иновации и съвети за модерното и екологично строителство с конопени панели.',
    url: 'https://biozid.bg/blog',
    siteName: 'БИОЗИД',
    locale: 'bg_BG',
    type: 'website',
  },
};

interface SoroArticle {
  title: string;
  slug: string;
  published_at?: string;
  description?: string;
}

// Помощна функция за сървърно извличане на Soro статиите за Schema.org
async function getSoroArticles(): Promise<SoroArticle[]> {
  try {
    const res = await fetch('https://app.trysoro.com/api/embed/9956916d-04d4-476a-afc4-0ab6bb82b06d', {
      next: { revalidate: 7200 }
    });
    const text = await res.text();
    const match = text.match(/var SORO_ARTICLES\s*=\s*(\[[\s\S]*?\]);/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
  } catch (error) {
    console.error('Грешка при зареждане на Soro статии за Schema:', error);
  }
  return [];
}

export default async function BlogPage() {
  // 1. Взимаме моделите къщи за страничната лента от Prisma
  const houses = await prisma.house.findMany({
    take: 4, // Показваме 4-те най-популярни или нови модела
  });

  // 2. Взимаме Soro статиите за изграждане на JSON-LD микроданни за AI ботове
  const soroArticles = await getSoroArticles();

  const tags = [
    'Еко строителство',
    'Панели БИОЗИД',
    'Евтини сглобяеми къщи',
    'Здравословен дом',
    'Сглобяеми къщи',
    'Енергийна ефективност',
    'пасивни къщи',
    'мобилни къщи',
    'бързо строителство',
    'модулни къщи'
  ];

  // 3. ГЕНЕРИРАНЕ НА JSON-LD СТРУКТУРИРАНИ ДАННИ (SCHEMA.ORG) ЗА AI БОТОВЕ
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': 'https://biozid.bg/blog/#blog',
        'url': 'https://biozid.bg/blog',
        'name': 'Блог за екологично строителство - БИОЗИД',
        'description': 'Статии и анализи за екологични сглобяеми къщи и конопени панели.',
        'publisher': {
          '@type': 'Organization',
          'name': 'БИОЗИД ЕООД',
          'url': 'https://biozid.bg',
          'logo': 'https://biozid.bg/logo.png'
        },
        'blogPost': soroArticles.map((article) => ({
          '@type': 'BlogPosting',
          'headline': article.title,
          // SEO ФИКС: Променено от ?post=slug към чист SEO URL
          'url': `https://biozid.bg/blog/${article.slug}`,
          'datePublished': article.published_at || new Date().toISOString(),
          // SEO ФИКС: Променено от ?post=slug към чист SEO URL
          'mainEntityOfPage': `https://biozid.bg/blog/${article.slug}`
        }))
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Начало',
            'item': 'https://biozid.bg'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Блог',
            'item': 'https://biozid.bg/blog'
          }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      {/* Инжектиране на структурираните данни в HTML HEAD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1 pt-40 pb-20 px-6 max-w-[1300px] mx-auto w-full flex flex-col lg:flex-row gap-16">
        
        {/* ЛЯВА КОЛОНА - Управлява се от Soro */}
        <div className="flex-1 flex flex-col">
          <div className="mb-8">
            <h1 className="text-5xl font-serif font-bold text-slate-900 mb-4">Блог</h1>
            <p className="text-slate-500 text-lg max-w-md">Идеи, иновации и съвети за модерното и екологично строителство.</p>
          </div>

          <div id="soro-blog" className="min-h-[600px]">
            {/* Тук Soro инжектира съдържанието за потребителя */}
          </div>

          {/* Семантичен списък за AI и търсачки, ако JS не се изпълни */}
          <noscript>
            <div className="my-8 p-6 bg-slate-50 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Публикувани статии:</h2>
              <ul className="space-y-2">
                {soroArticles.map((art) => (
                  <li key={art.slug}>
                    {/* SEO ФИКС: Променено от ?post=slug към чист SEO URL */}
                    <a href={`/blog/${art.slug}`} className="text-teal-700 underline font-medium">
                      {art.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </noscript>

          {/* Динамично зареждане на Soro скрипта */}
          <Script 
            src="https://app.trysoro.com/api/embed/9956916d-04d4-476a-afc4-0ab6bb82b06d"
            strategy="afterInteractive"
          />
        </div>

        {/* ДЯСНА КОЛОНА (SIDEBAR) */}
        <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-12 lg:sticky lg:top-32 h-fit">
          
          {/* ТЪРСЕНЕ */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Търсене</h3>
            <form action="/search" method="GET" className="relative border-b border-slate-200 pb-2 focus-within:border-teal-500 transition-colors">
              <input 
                type="text" 
                name="q"
                placeholder="Въведи дума..." 
                className="w-full bg-transparent text-sm outline-none pr-8"
                required
              />
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
                  <Link 
                    key={house.id} 
                    // Проверка за SEO slug при къщите, ако е наличен
                    href={`/houses/${house.slug || house.id}`} 
                    className="group block overflow-hidden"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-100 mb-3">
                      <Image 
                        src={house.imageUrl || '/house-placeholder.jpg'} 
                        alt={house.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors leading-snug">
                      {house.name}
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