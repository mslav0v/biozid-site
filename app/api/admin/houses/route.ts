import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Вземане на всички къщи за каталога
export async function GET() {
  try {
    const houses = await prisma.house.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(houses);
  } catch (error) {
    return NextResponse.json({ error: "Грешка при четене на каталога" }, { status: 500 });
  }
}

// POST - Запис на нова къща (ЗАМЕНЕНА ВЕРСИЯ С ДИАГНОСТИКА)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // ТОВА ЩЕ ИЗПИШЕ ДАННИТЕ В ТЕРМИНАЛА НА VS CODE
    console.log("--- ПРИСТИГНАЛИ ДАННИ ---", body);

    const newHouse = await prisma.house.create({
      data: {
        name: body.name,
        area: parseFloat(body.area) || 0, 
        bedrooms: parseInt(body.bedrooms) || 0,
        bathrooms: parseInt(body.bathrooms) || 0,
        floors: parseInt(body.floors) || 1,
        price: body.price,
        description: body.description || "",
        imageUrl: body.imageUrl || null,
        tags: Array.isArray(body.tags) ? body.tags : [],
      },
    });

    console.log("--- ЗАПИСЪТ Е УСПЕШЕН --- ID:", newHouse.id);
    return NextResponse.json(newHouse);
  } catch (error: any) {
    // ТУК ЩЕ ВИДИМ ТОЧНАТА ПРИЧИНА АКО ГРЪМНЕ
    console.error("--- ГРЕШКА ПРИ ЗАПИС ---", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}