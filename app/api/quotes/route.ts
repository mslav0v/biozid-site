import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newQuote = await prisma.quoteRequest.create({
      data: {
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        totalArea: parseFloat(body.totalArea),
        underlayUrl: body.underlayUrl || null,
        cadData: body.cadData, // Prisma директно приема JSON обекти тук
        
        // --- НОВО: ЗАПАЗВАМЕ И ДАННИТЕ ЗА ЕТАЖИТЕ ---
        floorsData: body.floorsData || null, 
        
        status: 'new'
      },
    });

    return NextResponse.json(newQuote);
  } catch (error) {
    console.error("QUOTE RECORD ERROR:", error);
    return NextResponse.json({ error: 'Грешка при изпращане' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const quotes = await prisma.quoteRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(quotes);
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при четене' }, { status: 500 });
  }
}