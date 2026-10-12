import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans relative overflow-x-hidden">
      
      <Navbar />

      {/* HERO СЕКЦИЯ */}
      <section className="pt-28 md:pt-40 pb-12 md:pb-20 px-4 md:px-6 max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center gap-10 md:gap-20">
        <div className="w-full lg:w-1/2 text-center lg:text-left mt-4 md:mt-0">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight tracking-tighter text-slate-900 mb-6 leading-tight">
            Високоефективни <br className="hidden sm:block" /> <span className="italic text-teal-700">здравословни</span> домове
          </h1>
          <p className="text-base md:text-xl text-slate-600 font-light leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
            Използваме съвременни, екологични материали и собствена производствена технология за създаване на енергийно ефективни и устойчиви къщи.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full sm:w-auto">
            <Link 
              href="/houses" 
              className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase hover:bg-teal-700 transition text-center rounded-xl sm:rounded-none shadow-sm"
            >
              Разгледайте моделите
            </Link>
            <Link 
              href="/advantages" 
              className="w-full sm:w-auto border border-slate-300 text-slate-900 px-8 py-4 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase hover:bg-slate-50 transition text-center rounded-xl sm:rounded-none"
            >
              Нашата мисия
            </Link>
          </div>
        </div>

        {/* HERO ИЗОБРАЖЕНИЕ (Заменено видео с бързо, SEO оптимизирано изображение) */}
        <div className="w-full lg:w-1/2 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
          <Image 
            src="/exterior-hero.jpg" 
            alt="БИОЗИД - Модерни сглобяеми екологични къщи с конопена изолация" 
            fill 
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* ТЕХНОЛОГИЯ: СТЕННИ ПАНЕЛИ */}
      <section className="bg-slate-50 py-16 md:py-32 px-4 md:px-6">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-10 md:gap-32 items-center">
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl border border-white order-2 lg:order-1 mt-8 lg:mt-0">
            <Image 
              src="/tech-panel-layer.jpg" 
              alt="БИОЗИД Технология Панели" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover" 
            />
          </div>
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <span className="block font-bold text-[10px] tracking-widest uppercase mb-3 text-teal-700">ИНОВАЦИЯ</span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-6 md:mb-8 leading-tight text-slate-900">
              Къща, която диша
            </h2>
            <p className="text-base md:text-lg text-slate-600 font-light leading-relaxed mb-8 md:mb-10 px-2 sm:px-0">
              Нашите изолационни панели имат иновативна антибактериална сърцевина. Високата паропроводимост позволява на влагата да излиза свободно навън, предотвратявайки конденз и мухъл.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-200 pt-8 text-left">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <span className="block font-bold text-[10px] tracking-widest uppercase mb-2 text-slate-800">Защита</span>
                <p className="text-sm text-slate-500 font-light italic">Двойна мембрана за 100% хидроизолация.</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <span className="block font-bold text-[10px] tracking-widest uppercase mb-2 text-slate-800">Здраве</span>
                <p className="text-sm text-slate-500 font-light italic">Антибактериални и негорими материали.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* МЕТАЛНА КОНСТРУКЦИЯ */}
      <section className="py-16 md:py-32 px-4 md:px-6 max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-32 items-center">
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-teal-700 mb-4 md:mb-8">Инженерство</h4>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-6 md:mb-8 leading-tight">Прецизен метален скелет</h2>
            <p className="text-base md:text-lg text-slate-600 font-light leading-relaxed mb-8 md:mb-12 px-2 sm:px-0">
              Използваме висококачествена стомана, разкроена с компютърна точност. Всеки детайл е номериран и подготвен за светкавичен монтаж, гарантирайки устойчивост на земетресения и перфектна геометрия.
            </p>
            <Link href="/processes" className="inline-block text-[10px] font-bold tracking-widest uppercase text-slate-900 border-b-2 border-teal-700 pb-2 hover:opacity-70 transition">
              Вижте процеса
            </Link>
          </div>
          <div className="order-1 lg:order-2 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
            <Image 
              src="/tech-frames.jpg" 
              alt="БИОЗИД Метална Конструкция" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover" 
            />
          </div>
        </div>
      </section>

      {/* ФАСАДА */}
      <section className="bg-slate-900 text-white py-16 md:py-32 px-4 md:px-6">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative h-[250px] sm:h-[350px] md:h-[500px] rounded-2xl overflow-hidden shadow-inner order-1">
            <Image 
              src="/tech-facade.jpg" 
              alt="БИОЗИД Вентилирана Фасада" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-80" 
            />
          </div>
          <div className="order-2 text-center lg:text-left">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-400 mb-4 md:mb-8">Материали</h4>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extralight tracking-tighter mb-6 md:mb-10 leading-tight">50 години гаранция</h2>
            <p className="text-base md:text-xl font-light text-slate-300 leading-relaxed mb-8 md:mb-12 px-2 sm:px-0">
              Окачена фасада позволяваща на къщата да диша и в същото време има елегантен дизайн с ефект на дърво и черен мат. Нашата окачена фасада е устойчива на най-тежките метеорологични условия, не изисква поддръжка и запазва цветовете си десетилетия наред.
            </p>
            <Link href="/houses" className="block w-full sm:w-auto sm:inline-block bg-teal-700 hover:bg-teal-600 px-10 py-5 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition rounded-xl sm:rounded-sm shadow-lg text-center">
              Изберете вашия дизайн
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}