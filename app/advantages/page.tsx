"use client";

import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdvantagesPage() {
  const advantages = [
    {
      id: "01",
      title: "Безкомпромисно здраве",
      description: "Системата ни елиминира условията за развитие на мухъл и конденз. Благодарение на високата паропроводимост на панелите БИОЗИД, домът ви 'диша' естествено, осигурявайки свеж и чист въздух за вас и вашето семейство.",
      imageSrc: "/adv-health.jpg",
      imageAlt: "Безкомпромисно здраве и чист въздух"
    },
    {
      id: "02",
      title: "Светкавично строителство",
      description: "Забравяте за дългите години по строежи. Всички елементи се разкрояват с компютърна прецизност в нашата фабрика. На обекта се извършва само чист и бърз монтаж, което съкращава времето за строеж в пъти.",
      imageSrc: "/adv-speed.jpg",
      imageAlt: "Светкавично строителство и монтаж"
    },
    {
      id: "03",
      title: "Сеизмична устойчивост",
      description: "Металният 'скелет' от стоманени профили (10х10х5 мм) и сертифицираните болтови връзки правят конструкцията изключително гъвкава и здрава. Къщите БИОЗИД издържат на земетресения от най-висока степен.",
      imageSrc: "/adv-seismic.jpg",
      imageAlt: "Сеизмична устойчивост на металната конструкция"
    },
    {
      id: "04",
      title: "Пожарна безопасност",
      description: "Използваме материали с най-висок клас на негоримост. Специалната вата и двойният слой пожароустойчив гипскартон Knauf защитават конструкцията и ви дават нужното време за реакция при екстремни ситуации.",
      imageSrc: "/adv-fire-safety.jpg",
      imageAlt: "Пожарна безопасност и негорими материали"
    },
    {
      id: "05",
      title: "Енергийна ефективност",
      description: "Отличната топлоизолация и вентилираната фасада задържат топлината през зимата и прохладата през лятото. Интегрираме системи за соларна енергия и термопомпи, за да сведем сметките ви до минимум.",
      imageSrc: "/adv-energy.jpg",
      imageAlt: "Енергийна ефективност и соларни системи"
    },
    {
      id: "06",
      title: "Дълголетие без поддръжка",
      description: "С 50-годишна гаранция на фасадата и специално антикорозионно покритие на стоманата, домът ви ще изглежда като нов десетилетия наред, без нужда от постоянни ремонти и освежаване.",
      imageSrc: "/adv-longevity.jpg",
      imageAlt: "Дълголетие и фасада без поддръжка"
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-32 md:pt-44 pb-20">
        <div className="container mx-auto px-6 max-w-[1400px]">
          
          <div className="mb-20 md:mb-32 max-w-4xl">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-700 mb-6">Защо БИОЗИД?</h4>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-slate-900 leading-tight">
              Инвестиция във вашето <br />
              <span className="italic text-teal-700 font-medium">спокойствие и време</span>
            </h1>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {advantages.map((adv) => (
              <div key={adv.id} className="relative group flex flex-col gap-8">
                
                {/* Контейнер за изображението (1:1 Квадрат) */}
                <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-lg border border-slate-100">
                  <Image 
                    src={adv.imageSrc}
                    alt={adv.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Текстова част */}
                <div className="relative z-10 px-2">
                  <div className="absolute -top-14 -left-4 text-7xl font-bold text-slate-50 opacity-80 z-0 transition-transform group-hover:-translate-y-2 pointer-events-none">
                    {adv.id}
                  </div>
                  <h3 className="relative z-10 text-2xl font-light tracking-tight text-slate-900 mb-6 border-b border-teal-100 pb-4">
                    {adv.title}
                  </h3>
                  <p className="relative z-10 text-slate-600 font-light leading-relaxed">
                    {adv.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* СИЛЕН ПРИЗИВ ЗА ДЕЙСТВИЕ (CTA) */}
          <div className="mt-32 md:mt-40 bg-slate-900 rounded-[40px] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
            {/* Декоративен градиент за дълбочина */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 to-transparent pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-light text-white mb-6 tracking-tight">
                Готови ли сте за вашия <span className="font-medium text-teal-400 italic">нов дом?</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light mb-12">
                След като се запознахте с безкомпромисното качество на технологията БИОЗИД, е време да изберете вашия архитектурен модел или да пресметнете точната инвестиция.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link 
                  href="/houses" 
                  className="bg-teal-600 hover:bg-teal-500 text-white px-10 py-5 rounded-2xl text-[11px] font-bold tracking-[0.2em] uppercase transition-all shadow-lg hover:shadow-teal-500/20 hover:-translate-y-1"
                >
                  Разгледайте моделите
                </Link>
                <Link 
                  href="/calculator" 
                  className="border border-slate-600 hover:border-slate-400 text-white px-10 py-5 rounded-2xl text-[11px] font-bold tracking-[0.2em] uppercase transition-all hover:bg-white/5"
                >
                  Към калкулатора
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}