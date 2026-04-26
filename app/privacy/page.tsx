import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 md:pt-44 pb-20 max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-10 tracking-tighter">Политика за поверителност</h1>
        
        <div className="prose prose-slate max-w-none font-light text-slate-600 leading-relaxed space-y-8">
          <section>
            <h2 className="text-2xl font-medium text-slate-800 mb-4">1. Информация за нас</h2>
            <p>
              Ние сме <strong>БИОЗИД ЕООД</strong>, ЕИК: <strong>206532819</strong>, със седалище и адрес на управление: <strong>обл. Добрич, с. Ломница (9397), местност Край Село</strong>. 
              Ние сме Администратор на лични данни и отговаряме за спазването на разпоредбите на Общия регламент относно защитата на данните (GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-slate-800 mb-4">2. Какви данни събираме?</h2>
            <p className="mb-4">
              Тъй като нашият уебсайт има изцяло информационен и каталожен характер, ние не изискваме регистрация на профил. Събираме лични данни единствено когато доброволно попълните формата ни за контакт:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Име и фамилия</li>
              <li>Телефонен номер</li>
              <li>Имейл адрес</li>
              <li>Файлове (скици, архитектурни планове), които ни изпращате доброволно за оценка на проект.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-slate-800 mb-4">3. За какво използваме вашите данни?</h2>
            <p className="mb-4">Събраните данни се използват строго и единствено за:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Обработка на вашето запитване;</li>
              <li>Изготвяне на индивидуална или типова оферта за строителство;</li>
              <li>Осъществяване на контакт с вас по телефон или имейл във връзка с вашия проект.</li>
            </ul>
            <p className="mt-4 italic">Ние не използваме данните ви за маркетинг кампании, спам или предоставяне на трети лица за рекламни цели.</p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-slate-800 mb-4">4. Как защитаваме и колко дълго пазим данните ви?</h2>
            <p>
              Данните ви се съхраняват на сигурни сървъри. Съхраняваме вашите запитвания и предоставени файлове за период от <strong>2 години</strong> или докато са необходими за реализирането на съвместния ни проект, след което биват безвъзвратно изтривани, освен ако закон не изисква друго.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-slate-800 mb-4">5. Вашите права</h2>
            <p className="mb-4">Според GDPR вие имате право по всяко време да поискате:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Достъп до личните ви данни, които съхраняваме;</li>
              <li>Корекция на неточни данни;</li>
              <li>Изтриване на данните ("правото да бъдеш забравен").</li>
            </ul>
            <p className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              За да упражните тези права, свържете се с нас на: <a href="mailto:office@biozid.bg" className="text-teal-700 font-medium hover:underline">office@biozid.bg</a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}