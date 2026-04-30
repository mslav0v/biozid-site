import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Взимане на статия за формата
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const post = await prisma.blogPost.findUnique({ where: { id: String(id) } });
  return NextResponse.json(post);
}

// Записване на промените
export async function PUT(req: Request) {
  const body = await req.json();
  const { id, title, content, imageUrl } = body;

  const updated = await prisma.blogPost.update({
    where: { id },
    data: { title, content, imageUrl },
  });

  return NextResponse.json(updated);
}