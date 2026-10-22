import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';

// Помощна функция за извличане на чист текст от HTML за SEO описание
function cleanDescription(html: string): string {
  if (!html) return 'Статия от блога на БИОЗИД за екологично и модерно строителство с конопени панели.';
  const text = html.replace(/<[^>]*>?/gm, '').trim();
  return text.length > 160 ? text.substring(0, 157) + '...' : text;
}

// 1. ДИНАМИЧНО ГЕНЕРИРАНЕ НА SEO МЕТАДАННИ ЗА ВСЯКА СТАТИЯ
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;

  // Търсим по id ИЛИ по slug, за да сме сигурни, че намираме статията
  const post = await prisma.blogPost.findFirst({
    where: { 
      OR: [
        { id: id },
        { slug: id }
      ]
    }
  });

  if (!post) {
    return {
      title: 'Статията не е намерена | БИОЗИД',
    };
  }

  const description = cleanDescription(post.content);
  const imageUrl = post.imageUrl || 'https://biozid.bg/og-image.jpg';
  // SEO ФИКС: Уверяваме се, че генерираме каноничния URL с чистия slug
  const articleUrl = `https://biozid.bg/blog/${post.slug || post.id}`;

  return {
    title: `${post.title} | Блог БИОЗИД`,
    description,
    // SEO ФИКС: Това решава проблема "Duplicate without user-selected canonical"
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: post.title,
      description,
      url: articleUrl,
      siteName: 'БИОЗИД',
      locale: 'bg_BG',
      type: 'article',
      publishedTime: new Date(post.publishedAt).toISOString(),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function SinglePostPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // Взимаме статията от базата данни (търсим и по id, и по slug)
  const post = await prisma.blogPost.findFirst({
    where: { 
      OR: [
        { id: id },
        { slug: id }
      ]
    }
  });

  if (!post) notFound();

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('bg-BG', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });

  const description = cleanDescription(post.content);
  const imageUrl = post.imageUrl || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc';
  const articleUrl = `https://biozid.bg/blog/${post.slug || post.id}`;

  // 2. JSON-LD СТРУКТУРИРАНИ ДАННИ ЗА AI БОТОВЕ И GOOGLE RICH RESULTS
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${articleUrl}/#article`,
        'isPartOf': {
          '@type': 'WebPage',
          '@id': articleUrl
        },
        'headline': post.title,
        'description': description,
        'image': [imageUrl],
        'datePublished': new Date(post.publishedAt).toISOString(),
        'dateModified': new Date(post.publishedAt).toISOString(),
        'author': {
          '@type': 'Organization',
          'name': 'БИОЗИД ЕООД',
          'url': 'https://biozid.bg'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'БИОЗИД ЕООД',
          'url': 'https://biozid.bg',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://biozid.bg/logo.png'
          }
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': articleUrl
        }
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
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': post.title,
            'item': articleUrl
          }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      {/* Инжектиране на структурираните данни за търсачки и AI ботове */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Бутон за връщане към блога */}
          <Link href="/blog" className="inline-flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-teal-600 mb-12 transition-colors">
            ← Назад към блога
          </Link>

          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight mb-6">
              {post.title}
            </h1>
            <div className="text-sm text-slate-400 uppercase tracking-widest mb-8">
              БИОЗИД • {formattedDate}
            </div>

            {/* Оптимизирано изображение през Next.js Image */}
            <div className="relative w-full aspect-video rounded-sm overflow-hidden shadow-sm mb-12 bg-slate-100">
              <Image 
                src={imageUrl} 
                alt={post.title} 
                fill
                priority
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
              />
            </div>
          </header>

          {/* Съдържание на статията */}
          <article 
            className="prose prose-slate lg:prose-lg max-w-none prose-img:rounded-lg prose-a:text-teal-600 hover:prose-a:text-teal-700"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* SEO ВЪТРЕШНО ЛИНКВАНЕ: Добавено директно под статията за прехвърляне на авторитет */}
          <div className="mt-16 p-8 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Заинтересовани ли сте от екологично строителство?</h3>
            <p className="text-slate-600 mb-6 max-w-lg mx-auto">
              Разгледайте нашите модели сглобяеми къщи, изградени със здрава метална конструкция и дишащи конопени панели.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/houses" className="bg-teal-700 text-white px-8 py-3 rounded text-sm font-bold uppercase tracking-wider hover:bg-teal-600 transition">
                Вижте Моделите
              </Link>
              <Link href="/calculator" className="bg-slate-900 text-white px-8 py-3 rounded text-sm font-bold uppercase tracking-wider hover:bg-slate-800 transition">
                Калкулатор Цени
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}