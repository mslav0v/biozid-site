import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    const file = formData.get('file') as File | null;

    // ОДИТ: Преминаваме към ПОРТ 465 (SSL). 
    // Това е най-стриктният и сигурен метод за връзка със сървъра edison.
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465, 
      secure: true, // Задължително true за порт 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false 
      },
      connectionTimeout: 10000, // 10 секунди макс за свързване
      greetingTimeout: 10000,   // 10 секунди макс за поздрав от сървъра
      socketTimeout: 15000,     // 15 секунди макс за активност на сокета
    });

    // ДИАГНОСТИКА: Проверяваме връзката преди пращане. 
    // Ако тук има проблем, ще го видим в лога веднага.
    try {
      await transporter.verify();
      console.log("SMTP Connection verified successfully on port 465");
    } catch (verifyError: any) {
      console.error("SMTP Verify Error:", verifyError.message);
      return NextResponse.json({ 
        success: false, 
        error: `Сървърът edison отказа връзка на порт 465: ${verifyError.message}` 
      }, { status: 500 });
    }

    // 1. ИМЕЙЛ КЪМ АДМИНИСТРАТОРА (БИОЗИД)
    const mailOptions: any = {
      from: `"Биозид Калкулатор" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, 
      replyTo: email,
      subject: `Ново запитване от калкулатора: ${name}`,
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
    };

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      mailOptions.attachments = [{ filename: file.name, content: buffer }];
    }

    // 2. АВТОМАТИЧЕН ОТГОВОР КЪМ КЛИЕНТА
    const autoReplyOptions = {
      from: `"БИОЗИД" <${process.env.EMAIL_USER}>`,
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
    };

    // ОДИТ: Използваме Promise.all, за да пратим двата имейла едновременно.
    await Promise.all([
      transporter.sendMail(mailOptions),
      transporter.sendMail(autoReplyOptions)
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Final Catch - Email sending error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: `Грешка при изпращане: ${error.message}` 
    }, { status: 500 });
  }
}