import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// 1. ПЪЛНИ SEO И AI МЕТАДАННИ
export const metadata: Metadata = {
  title: "Общи условия | БИОЗИД",
  description: "Общи условия за ползване на уебсайта www.biozid.bg. Информация относно каталожния характер на сайта, авторските права и изпращането на запитвания.",
  alternates: {
    canonical: "https://biozid.bg/terms",
  },
  openGraph: {
    title: "Общи условия | БИОЗИД",
    description: "Общи условия за ползване на уебсайта www.biozid.bg.",
    url: "https://biozid.bg/terms",
    siteName: "БИОЗИД",
    locale: "bg_BG",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Общи условия | БИОЗИД",
    description: "Общи условия за ползване на уебсайта www.biozid.bg.",
  },
};

export default function TermsPage() {
  // 2. JSON-LD СТРУКТУРИРАНИ ДАННИ ЗА AI БОТОВЕ И GOOGLE
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://biozid.bg/terms/#webpage",
        "url": "https://biozid.bg/terms",
        "name": "Общи условия - БИОЗИД ЕООД",
        "description": "Общи условия за ползване на уебсайта biozid.bg и онлайн каталога на БИОЗИД ЕООД.",
        "publisher": {
          "@type": "Organization",
          "name": "БИОЗИД ЕООД",
          "url": "https://biozid.bg"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Начало",
            "item": "https://biozid.bg"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Общи условия",
            "item": "https://biozid.bg/terms"
          }
        ]
      }
    ]
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Инжектиране на структурираните данни */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <div className="pt-32 md:pt-44 pb-20 max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-10 tracking-tighter">Общи условия</h1>
        
        <div className="prose prose-slate max-w-none font-light text-slate-600 leading-relaxed space-y-8">
          <section>
            <h2 className="text-2xl font-medium text-slate-800 mb-4">1. Общи положения</h2>
            <p>
              Настоящите Общи условия уреждат отношенията между <strong>БИОЗИД ЕООД</strong> (наричано по-долу "Собственик") и всяко лице, което посещава и използва уебсайта <strong>www.biozid.bg</strong> (наричано по-долу "Потребител").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-slate-800 mb-4">2. Характер на уебсайта</h2>
            <p>
              Този уебсайт представлява онлайн каталог, представящ типови архитектурни проекти и строителни решения. 
              <strong> През уебсайта не се извършват директни продажби, не се сключват договори от разстояние и не се приемат онлайн плащания.</strong>
            </p>
            <p className="mt-4">
              Всички цени, посочени в каталога, имат изцяло ориентировъчен характер и представляват базова стойност за съответния модел. 
              Окончателната цена се формира след индивидуално обсъждане и се фиксира в официален писмен договор между страните.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-slate-800 mb-4">3. Изпращане на запитвания</h2>
            <p>
              Потребителите имат възможност да изпращат запитвания чрез контактната форма. Изпращането на запитване или прикачването на проект не обвързва нито една от страните със задължение за сключване на договор или извършване на плащане.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-slate-800 mb-4">4. Интелектуална собственост</h2>
            <p>
              Цялото съдържание на уебсайта – включително, но не само: 3D визуализации на къщи, архитектурни разпределения, текстове, лога, графики и снимков материал, са изключителна интелектуална собственост на <strong>БИОЗИД ЕООД</strong> или нейните партньори.
            </p>
            <p className="mt-4">
              Копирането, разпространението, използването за комерсиални цели или модифицирането на тези материали без изричното писмено съгласие на Собственика е строго забранено и подлежи на санкции според Закона за авторското право и сродните му права.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-slate-800 mb-4">5. Отговорност</h2>
            <p>
              Собственикът полага максимални усилия да поддържа актуална информация на сайта, но не носи отговорност за евентуални технически грешки, неточности в описанията или разминавания в цветовете и детайлите на визуализациите. 3D изображенията са с илюстративна цел. Собственикът не носи отговорност за съдържанието на външни сайтове, към които може да има препратки.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-slate-800 mb-4">6. Промени в условията</h2>
            <p>
              Собственикът си запазва правото да променя настоящите Общи условия по всяко време. Промените влизат в сила незабавно след тяхното публикуване на уебсайта.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-slate-100 text-sm italic">
            Последна актуализация: 01.10.2026 г.
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}