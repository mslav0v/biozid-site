"use client";
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function EditPost({ params }: { params: Promise<{ id: string }> }) {
  // 1. Разопаковаме параметрите
  const { id } = use(params);
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Състояние за грешки
  const router = useRouter();

  // 2. Зареждане на статията с обработка на грешки
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/blog/edit?id=${id}`);
        
        if (!res.ok) {
          if (res.status === 401) throw new Error("Нямате оторизация за достъп.");
          throw new Error("Неуспешно свързване с базата данни.");
        }
        
        const data = await res.json();
        if (!data) throw new Error("Статията не беше намерена.");
        
        setPost(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/blog/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });

      if (res.ok) {
        alert("Статията е обновена успешно!");
        router.push('/admin/blog');
        router.refresh();
      } else {
        throw new Error("Проблем при записването.");
      }
    } catch (err) {
      alert("Грешка: Не успяхме да запазим промените.");
    }
  };

  // UI при зареждане
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-slate-500 font-medium animate-pulse uppercase tracking-widest text-xs">Зареждане на съдържанието...</div>
    </div>
  );

  // UI при грешка
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md">
        <h2 className="text-red-500 font-black text-2xl mb-2">Упс!</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <button 
          onClick={() => router.push('/admin/blog')}
          className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
        >
          ВРЪЩАНЕ КЪМ СПИСЪКА
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto mt-32 p-4 md:p-10">
        <div className="bg-white shadow-xl rounded-2xl border border-slate-100 overflow-hidden">
          {/* Хедър на админа */}
          <div className="bg-slate-900 p-6 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-white uppercase tracking-widest">
                Редактиране на статия
              </h1>
              <p className="text-slate-400 text-[10px] font-mono mt-1">UUID: {id}</p>
            </div>
            <div className="px-3 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full">
              <span className="text-teal-400 text-[10px] font-bold uppercase tracking-tighter">Режим: Администратор</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Заглавие */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Заглавие на статията
              </label>
              <input 
                type="text" 
                value={post.title} 
                onChange={(e) => setPost({...post, title: e.target.value})}
                className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-800 font-medium"
              />
            </div>

            {/* Снимка */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                URL на главна снимка
              </label>
              <input 
                type="text" 
                value={post.imageUrl} 
                onChange={(e) => setPost({...post, imageUrl: e.target.value})}
                className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all font-mono text-sm bg-slate-50"
              />
              {post.imageUrl && (
                <div className="mt-4 rounded-lg overflow-hidden border border-slate-100 h-32 w-fit shadow-sm">
                  <img src={post.imageUrl} alt="Preview" className="h-full object-cover" />
                </div>
              )}
            </div>

            {/* Съдържание */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Съдържание (HTML формат)
              </label>
              <textarea 
                rows={15}
                value={post.content} 
                onChange={(e) => setPost({...post, content: e.target.value})}
                className="w-full border border-slate-200 p-4 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all font-mono text-sm bg-slate-50 leading-relaxed"
              />
            </div>

            {/* Бутони */}
            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-50">
              <button 
                type="button"
                onClick={() => router.push('/admin/blog')}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors uppercase text-[10px] tracking-widest"
              >
                Отказ
              </button>
              <button 
                type="submit" 
                className="flex-[2] px-6 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all uppercase text-[10px] tracking-widest"
              >
                Запази промените
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}