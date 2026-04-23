"use client";

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdvantagesPage() {
  const advantages = [
    {
      id: "01",
      title: "Безкомпромисно здраве",
      description: "Системата ни елиминира условията за развитие на мухъл и конденз. Благодарение на високата паропроводимост на панелите БИОЗИД, домът ви 'диша' естествено, осигурявайки свеж и чист въздух за вас и вашето семейство.",
    },
    {
      id: "02",
      title: "Светкавично строителство",
      description: "Забравяте за дългите години по строежи. Всички елементи се разкрояват с компютърна прецизност в нашата фабрика. На обекта се извършва само чист и бърз монтаж, което съкращава времето за строеж в пъти.",
    },
    {
      id: "03",
      title: "Сеизмична устойчивост",
      description: "Металният 'скелет' от стоманени профили (10х10х5 мм) и сертифицираните болтови връзки правят конструкцията изключително гъвкава и здрава. Къщите БИОЗИД издържат на земетресения от най-висока степен.",
    },
    {
      id: "04",
      title: "Пожарна безопасност",
      description: "Използваме материали с най-висок клас на негоримост. Специалната вата и двойният слой пожароустойчив гипскартон Knauf защитават конструкцията и ви дават нужното време за реакция при екстремни ситуации.",
    },
    {
      id: "05",
      title: "Енергийна ефективност",
      description: "Отличната топлоизолация и вентилираната фасада задържат топлината през зимата и прохладата през лятото. Интегрираме системи за соларна енергия и термопомпи, за да сведем сметките ви до минимум.",
    },
    {
      id: "06",
      title: "Дълголетие без поддръжка",
      description: "С 50-годишна гаранция на фасадата и специално антикорозионно покритие на стоманата, домът ви ще изглежда като нов десетилетия наред, без нужда от постоянни ремонти и освежаване.",
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {advantages.map((adv) => (
              <div key={adv.id} className="relative group">
                <div className="absolute -top-10 -left-6 text-8xl font-bold text-slate-50 opacity-50 z-0 transition-transform group-hover:-translate-y-2">
                  {adv.id}
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-light tracking-tight text-slate-900 mb-6 border-b border-teal-100 pb-4">
                    {adv.title}
                  </h3>
                  <p className="text-slate-600 font-light leading-relaxed">
                    {adv.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Изображение акцент за страницата */}
          <div className="mt-32 relative h-[400px] md:h-[600px] rounded-[40px] overflow-hidden shadow-2xl">
            <Image 
              src="/adv-hero.jpg" // Подготви снимка с това име в public/ (напр. щастливо семейство пред къщата или красив изглед)
              alt="Предимствата на БИОЗИД" 
              fill 
              className="object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/20"></div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}