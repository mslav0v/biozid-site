import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function SinglePostPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // Взимаме статията, която потребителят е кликнал в Sidebar-а
  const post = await prisma.blogPost.findUnique({
    where: { id: id }
  });

  if (!post) notFound();

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('bg-BG', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Бутон за връщане към списъка със Soro скрипта */}
          <Link href="/blog" className="inline-flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-teal-600 mb-12">
            ← Назад към блога
          </Link>

          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight mb-6">
              {post.title}
            </h1>
            <div className="text-sm text-slate-400 uppercase tracking-widest mb-8">
              БИОЗИД • {formattedDate}
            </div>
            <img 
              src={post.imageUrl || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc'} 
              alt={post.title} 
              className="w-full aspect-video object-cover rounded-sm shadow-sm mb-12"
            />
          </header>

          {/* ТУК Е КЛЮЧЪТ: Стилизираме съдържанието от Soro/Make.com */}
          <article 
            className="prose prose-soro max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}