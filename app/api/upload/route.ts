import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  try {
    // Проверка дали токенът съществува
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("ГРЕШКА: Липсва BLOB_READ_WRITE_TOKEN в .env файла!");
      return NextResponse.json({ error: "Missing storage token" }, { status: 500 });
    }

    if (!filename || !request.body) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Качване към Vercel
    const blob = await put(filename, request.body, {
  access: 'public',
  addRandomSuffix: true, // ТОВА ОПРАВЯ ГРЕШКАТА
});

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("Blob upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}