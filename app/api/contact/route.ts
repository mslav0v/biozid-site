import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Помощна функция за ескейпване на HTML с цел предотвратяване на HTML инжекции в имейла
function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('Липсва RESEND_API_KEY в Environment Variables');
      return NextResponse.json(
        { success: false, error: 'Конфигурационна грешка на сървъра.' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const formData = await request.formData();
    
    const name = (formData.get('name') as string || '').trim();
    const phone = (formData.get('phone') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();
    const rawMessage = (formData.get('message') as string || '').trim();
    const file = formData.get('file') as File | null;

    // 1. ВАЛИДАЦИЯ НА ЗАДЪЛЖИТЕЛНИТЕ ПОЛЕТА
    if (!name || !email || !phone || !rawMessage) {
      return NextResponse.json(
        { success: false, error: 'Моля, попълнете всички задължителни полета.' },
        { status: 400 }
      );
    }

    // Валидация на имейл формат
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Въведеният имейл адрес е невалиден.' },
        { status: 400 }
      );
    }

    // 2. ОБРАБОТКА НА ПРИКАЧЕНИЯ ФАЙЛ (МАКСИМУМ 20MB)
    let attachments: Array<{ filename: string; content: Buffer }> = [];
    if (file && file.size > 0) {
      const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Размерът на файла надвишава допустимия лимит от 20MB.' },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        content: buffer,
      });
    }

    const safeName = escapeHtml(name);
    const safePhone = escapeHtml(phone);
    const safeEmail = escapeHtml(email);
    const safeMessageHtml = escapeHtml(rawMessage).replace(/\n/g, '<br/>');

    // 3. ИМЕЙЛ КЪМ АДМИНИСТРАТОРА (БИОЗИД)
    const adminEmailTask = resend.emails.send({
      from: 'Biozid Contacts <office@biozid.bg>',
      to: 'office@biozid.bg', 
      replyTo: email, 
      subject: `Ново запитване от: ${name}`,
      attachments: attachments,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f766e; padding: 16px 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Ново запитване от biozid.bg</h2>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <p style="margin-top: 0;"><strong>Клиент:</strong> ${safeName}</p>
            <p><strong>Телефон:</strong> <a href="tel:${safePhone}" style="color: #0f766e; font-weight: bold; text-decoration: none;">${safePhone}</a></p>
            <p><strong>Имейл:</strong> <a href="mailto:${safeEmail}" style="color: #0f766e; text-decoration: none;">${safeEmail}</a></p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 20px;">
              <strong style="color: #0f766e; display: block; margin-bottom: 8px;">Съобщение / Детайли:</strong>
              <div style="line-height: 1.6; font-size: 14px;">${safeMessageHtml}</div>
            </div>
            ${attachments.length > 0 ? `<p style="margin-top: 16px; font-size: 13px; color: #0f766e;"><strong>Прикачен файл:</strong> ${escapeHtml(file?.name || '')}</p>` : ''}
          </div>
        </div>
      `,
    });

    // 4. АВТОМАТИЧЕН ОТГОВОР КЪМ КЛИЕНТА
    const autoReplyTask = resend.emails.send({
      from: 'БИОЗИД <office@biozid.bg>',
      to: email, 
      subject: `Благодарим Ви за запитването, ${name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #0f766e; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 2px;">БИОЗИД</h1>
          </div>
          <div style="padding: 30px; color: #334155; line-height: 1.6;">
            <p style="font-size: 16px; margin-top: 0;">Здравейте, <strong>${safeName}</strong>,</p>
            <p>Благодарим Ви за проявения интерес към БИОЗИД. Получихме Вашето запитване ${attachments.length > 0 ? 'и прикачения файл' : ''}.</p>
            <p>Нашият екип ще прегледа информацията и ще се свърже с Вас в най-кратък срок на телефон <strong>${safePhone}</strong> или чрез отговор на този имейл.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 14px; margin-bottom: 4px;">С уважение,<br/><strong>Екипът на БИОЗИД ЕООД</strong></p>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">Това е служебно известие за потвърждение на Вашето запитване.</p>
          </div>
        </div>
      `,
    });

    // Изпращаме с Promise.allSettled, за да гарантираме, че дори авто-отговорът да сгреши, изпращането към админа се регистрира
    const [adminResult, clientResult] = await Promise.allSettled([adminEmailTask, autoReplyTask]);

    if (adminResult.status === 'rejected') {
      console.error('Грешка при изпращане на имейл към администратор:', adminResult.reason);
      return NextResponse.json(
        { success: false, error: 'Възникна грешка при доставката на съобщението.' },
        { status: 500 }
      );
    }

    if (clientResult.status === 'rejected') {
      console.warn('Предупреждение: Автоматичният отговор към клиента не успя да се изпрати:', clientResult.reason);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Resend API Error:', error?.message || error);
    return NextResponse.json(
      { success: false, error: 'Възникна системна грешка при обработката на запитването.' },
      { status: 500 }
    );
  }
}