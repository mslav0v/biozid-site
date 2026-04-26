import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const houses = await prisma.house.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(houses);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const house = await prisma.house.create({ data });
    return NextResponse.json(house);
  } catch (error) {
    return NextResponse.json({ error: "Грешка при запис" }, { status: 500 });
  }
}