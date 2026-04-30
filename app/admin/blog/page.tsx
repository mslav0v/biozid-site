import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const prisma = new PrismaClient();

export default async function AdminBlogList() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8 mt-20">
      <h1 className="text-2xl font-bold mb-6">Администриране на Блог</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {posts.map((post) => (
            <li key={post.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{post.title}</p>
                <p className="text-xs text-slate-500">{new Date(post.publishedAt).toLocaleDateString()}</p>
              </div>
              <Link 
                href={`/admin/blog/edit/${post.id}`}
                className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700"
              >
                Редактирай
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}