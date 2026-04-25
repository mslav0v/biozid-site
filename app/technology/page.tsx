"use client";

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TechnologyPage() {
  const wallLayers = [
    { name: "Окачена фасада", desc: "Метална вентилирана фасада с 50 години живот." },
    { name: "Въздушен слой", desc: "Подпомага вентилацията и топлоизолацията." },
    { name: "Двойна мембрана", desc: "Пропуска влагата навън, спира водата навътре." },
    { name: "Панел БИОЗИД", desc: "Дишаща, негорима и антибактериална сърцевина." },
    { name: "Метален скелет", desc: "Стомана 10х10х5 мм с болтови съединения." },
    { name: "Каменна вата", desc: "10 см изолация между металните профили." },
    { name: "Двоен гипскартон", desc: "Включително червен пожароустойчив слой Knauf." },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Оптимизиран падинг: pt-28 */}
      <div className="pt-28 md:pt-44 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-[1400px]">
          
          <div className="text-center mb-16 md:mb-24 max-w-4xl mx-auto px-2">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-700 mb-6">Инженерство</h4>
            {/* Оптимизиран размер на заглавието: text-3xl */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tighter text-slate-900 leading-tight mb-6 md:mb-8">
              Анатомия на <br />
              <span className="italic text-teal-700 font-medium">перфектната сграда</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 font-light leading-relaxed">
              Технологията на БИОЗИД съчетава индустриална прецизност с иновативни материали, за да създаде структура, която надминава конвенционалното строителство по всеки параметър.
            </p>
          </div>

          {/* Секция: Анатомия на стената */}
          {/* Оптимизиран вътрешен падинг p-6 за телефони */}
          <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-16 shadow-xl border border-slate-100 mb-20 md:mb-32 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
              <Image 
                src="/tech-layers1.jpg" 
                alt="Разрез на стената БИОЗИД" 
                fill 
                className="object-cover mix-blend-multiply" 
              />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-light text-slate-900 mb-8 tracking-tight">Многослойна система на защита</h3>
              <div className="space-y-6">
                {wallLayers.map((layer, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs mr-4 mt-1 shadow-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold tracking-widest uppercase text-slate-900">{layer.name}</h4>
                      <p className="text-slate-500 font-light text-xs md:text-sm italic mt-1 leading-relaxed">{layer.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Секция: Стоманата и Панелите */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="bg-slate-900 text-white rounded-[32px] md:rounded-[40px] p-8 md:p-16 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-400 mb-4 md:mb-6">Конструкция</h4>
                <h3 className="text-2xl md:text-3xl font-light mb-4 md:mb-6">Индустриална стомана</h3>
                <p className="font-light text-slate-300 leading-relaxed text-sm md:text-base">
                  Сърцето на всяка къща са кухите стоманени профили (10х10 см, 5 мм дебелина). Обработени с антикорозионен грунд под високо налягане, те се запечатват на молекулярно ниво. Използваме само сертифицирани болтови връзки с контра гайки – без слаби заваръчни точки на обекта.
                </p>
              </div>
            </div>

            <div className="bg-teal-700 text-white rounded-[32px] md:rounded-[40px] p-8 md:p-16 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-200 mb-4 md:mb-6">Материали</h4>
                <h3 className="text-2xl md:text-3xl font-light mb-4 md:mb-6">Изолационна сърцевина</h3>
                <p className="font-light text-teal-50 leading-relaxed text-sm md:text-base">
                  Специалната сърцевина на панелите БИОЗИД е разработена да бъде напълно негорима. Активните химични съединения в нея предотвратяват развитието на бактерии и гъбички, а структурата ѝ насочва влагата еднопосочно – отвътре навън.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}