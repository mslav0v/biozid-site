import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const revalidate = 60;

export default async function SinglePostPage({ params }: { params: { id: string } }) {
  // Намираме конкретната статия по ID
  const post = await prisma.blogPost.findUnique({
    where: { id: params.id }
  });

  // Ако статията не съществува, показваме стандартна 404 страница
  if (!post) {
    notFound();
  }

  // Форматираме датата
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('bg-BG', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4 max-w-4xl mx-auto w-full">
        {/* Бутон за връщане назад */}
        <Link href="/blog" className="inline-flex items-center text-teal-600 text-sm font-bold uppercase tracking-widest hover:text-teal-800 transition-colors mb-8">
          <span>←</span> <span className="ml-2">Назад към блога</span>
        </Link>

        {/* Заглавие и мета данни */}
        <header className="mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium mb-4 uppercase tracking-wider">
            <span>БИОЗИД</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-8">
            {post.title}
          </h1>
          
          {/* Главна снимка */}
          <div className="w-full h-64 md:h-[400px] rounded-2xl overflow-hidden shadow-lg relative">
            <img 
              src={post.imageUrl || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc'} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </header>

        {/* Съдържание на статията */}
        {/* Използваме dangerouslySetInnerHTML, защото Soro изпраща готов HTML формат */}
        <article 
          className="prose prose-lg prose-slate max-w-none prose-headings:text-teal-700 prose-a:text-teal-600 hover:prose-a:text-teal-800 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </main>

      <Footer />
    </div>
  );
}