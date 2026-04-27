import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Инициализираме Resend с API ключа от Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    const file = formData.get('file') as File | null;

    // Подготовка на прикачения файл за Resend API
    let attachments = [];
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        content: buffer,
      });
    }

    // 1. ИМЕЙЛ КЪМ АДМИНИСТРАТОРА (БИОЗИД)
    // КОРЕКЦИЯ: Използваме "replyTo" вместо "reply_to", за да мине проверката на TypeScript
    const adminEmailTask = resend.emails.send({
      from: 'Biozid Calculator <office@biozid.bg>',
      to: 'office@biozid.bg', 
      replyTo: email, 
      subject: `Запитване от : ${name}`,
      attachments: attachments,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h3 style="color: #0f766e; border-bottom: 1px solid #eee; padding-bottom: 10px;">Ново запитване от biozid.bg</h3>
          <p><strong>Клиент:</strong> ${name}</p>
          <p><strong>Телефон:</strong> ${phone}</p>
          <p><strong>Имейл:</strong> ${email}</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <strong>Данни от калкулатора / Съобщение:</strong><br/>
            ${message.replace(/\n/g, '<br/>')}
          </div>
        </div>
      `,
    });

    // 2. АВТОМАТИЧЕН ОТГОВОР КЪМ КЛИЕНТА
    const autoReplyTask = resend.emails.send({
      from: 'БИОЗИД <office@biozid.bg>',
      to: email, 
      subject: `Благодарим Ви за запитването, ${name}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0f766e; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">БИОЗИД</h1>
          </div>
          <div style="padding: 30px; color: #334155; line-height: 1.6;">
            <p>Здравейте, <strong>${name}</strong>,</p>
            <p>Благодарим Ви, че използвахте нашия калкулатор. Получихме Вашето запитване и прикачения чертеж.</p>
            <p>Нашият екип ще прегледа изчисленията и ще се свърже с Вас в най-кратък срок на телефон <strong>${phone}</strong> или чрез този имейл.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 14px;">Поздрави,<br/>Екипът на БИОЗИД</p>
            <p style="font-size: 12px; color: #94a3b8;">Това е автоматично съобщение, моля не отговаряйте директно на него.</p>
          </div>
        </div>
      `,
    });

    // Изпращаме двата имейла паралелно чрез Promise.all за максимална бързина
    await Promise.all([adminEmailTask, autoReplyTask]);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Resend API Error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: `Грешка при изпращане (Resend): ${error.message}` 
    }, { status: 500 });
  }
}