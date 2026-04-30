"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function EditPost({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Зареждаме данните на статията
  useEffect(() => {
    fetch(`/api/blog/edit?id=${params.id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setLoading(false);
      });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/blog/edit', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });

    if (res.ok) {
      alert("Статията е обновена!");
      router.push('/admin/blog');
      router.refresh();
    }
  };

  if (loading) return <div className="mt-40 text-center">Зареждане...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-32 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-xl font-bold mb-6 text-slate-800">Редактиране на статия</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Заглавие</label>
          <input 
            type="text" 
            value={post.title} 
            onChange={(e) => setPost({...post, title: e.target.value})}
            className="w-full border p-2 rounded mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">URL на снимка</label>
          <input 
            type="text" 
            value={post.imageUrl} 
            onChange={(e) => setPost({...post, imageUrl: e.target.value})}
            className="w-full border p-2 rounded mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Съдържание (HTML)</label>
          <textarea 
            rows={15}
            value={post.content} 
            onChange={(e) => setPost({...post, content: e.target.value})}
            className="w-full border p-2 rounded mt-1 font-mono text-sm"
          />
        </div>
        <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-teal-600 transition-colors">
          ЗАПАЗИ ПРОМЕНИТЕ
        </button>
      </form>
    </div>
  );
}