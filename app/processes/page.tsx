"use client";

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ProcessesPage() {
  const steps = [
    {
      id: 1,
      title: "1. Фундамент и подземни нива",
      description: "Всеки проект започва с прецизна подготовка на терена. Предлагаме гъвкавост според нуждите на клиента:",
      bullets: [
        "Стандартен фундамент: Армиран бетонов фундамент (клас C20/25).",
        "Изграждане на подземни етажи: При желание за мазе или защитено помещение, използваме технология с оставащ кофраж и изолационна мембрана (дебелина на стената 25 см). Таванната плоча се изпълнява с усилен бетон клас C40/50 за максимална конструктивна здравина."
      ],
      imageSrc: "/1-foundation.jpg",
      imageAlt: "Изграждане на фундамент и подземни нива"
    },
    {
      id: 2,
      title: "2. Масивна метална конструкция",
      description: "Това е „скелетът“ на вашата къща. За разлика от стандартното строителство, ние залагаме на индустриална прецизност:",
      bullets: [
        "Собствено производство: Всички елементи се разкрояват и подготвят в нашата фабрика.",
        "Материали: Използваме висококачествени кухи стоманени профили, като основният стандарт е 10х10 см с дебелина 5 мм.",
        "Болтови връзки: Вместо заварки на обекта, ние използваме сертифицирани болтови съединения с контра гайки. Това гарантира изключителна устойчивост на земетресения и елиминира риска от човешка грешка при монтажа.",
        "Антикорозионна защита: Всеки профил се обработва под високо налягане със специализиран грунд, който запечатва метала и гарантира десетилетия живот на конструкцията."
      ],
      imageSrc: "/2-steel-structure.jpg",
      imageAlt: "Сглобяване на масивна метална конструкция с болтови връзки"
    },
    {
      id: 3,
      title: "3. Изолационна обвивка (Панели БИОЗИД)",
      description: "След изправяне на конструкцията, тя се затваря с нашите патентовани изолационни панели:",
      bullets: [
        "Дишаща структура: Панелите имат висока паропроводимост, което позволява на влагата да излиза извън дома, предотвратявайки мухъл и конденз.",
        "Безопасност: Сърцевината на панелите е негорима и притежава антибактериални и антигъбични свойства.",
        "Защита: Системата се запечатва с двойна мембрана, която спира външната влага, но позволява на стената да „диша“."
      ],
      imageSrc: "/3-insulation.jpg",
      imageAlt: "Монтаж на дишащи изолационни панели БИОЗИД"
    },
    {
      id: 4,
      title: "4. Окачена вентилирана фасада",
      description: "Завършваме с модерна визия и функционалност:",
      bullets: [
        "Дълголетие: Монтираме метална окачена фасада с 50 години гаранция.",
        "Естетика: Възможност за различни цветови ефекти (дървесен декор, мат и др.), които не изискват поддръжка във времето.",
        "Вентилация: Фасадата се монтира върху водещи ребра, създавайки въздушен слой, който допълнително подобрява топлоизолацията."
      ],
      imageSrc: "/4-facade.jpg",
      imageAlt: "Завършена вентилирана метална фасада"
    },
    {
      id: 5,
      title: "5. Вътрешни системи и пожарозащита",
      description: "Вътрешното пространство е проектирано за комфорт и пълна безопасност:",
      bullets: [
        "Двойна пожарозащита: Металните профили се изолират with 10 см вата и се затварят с два слоя гипскартон. Първият слой е червен пожароустойчив гипскартон (Knauf), който предпазва конструкцията дори при екстремни ситуации.",
        "Инсталации: Всички електрически трасета се полагат в защитни гофри преди затварянето на стените.",
        "Звукоизолация: Двойният слой обшивка осигурява тишина и спокойствие във всяко помещение."
      ],
      imageSrc: "/5-interior.jpg",
      imageAlt: "Вътрешни инсталации и червен пожароустойчив гипскартон"
    },
    {
      id: 6,
      title: "6. Покрив и енергийна автономност",
      description: "Покривната система следва логиката на стените – дишащи панели, двойна мембрана и плоска ламарина.",
      bullets: [
        "Шумоизолация: Структурата на панелите елиминира шума от дъжд.",
        "Готовност за соларни системи: При монтажа се предвиждат „чакащи“ държачи, което позволява лесно инсталиране на фотоволтаици или слънчеви колектори без нарушаване на целостта на покрива."
      ],
      imageSrc: "/6-roof.jpg",
      imageAlt: "Покривна система с чакащи държачи за соларни панели"
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      
      {/* 1. HEADER / NAVIGATION */}
      <Navbar />

      {/* 2. ОСНОВНО СЪДЪРЖАНИЕ */}
      <div className="pt-32 md:pt-44 pb-16 md:pb-28">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="text-center mb-20 md:mb-28">
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-slate-900 mb-8 leading-tight">
              Технология и <span className="italic text-teal-700">процеси</span>
            </h1>
            <p className="text-base md:text-xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed">
              В БИОЗИД съчетаваме сигурността на масивната метална конструкция с иновативни материали, които позволяват на къщата да „диша“. 
            </p>
          </div>

          <div className="space-y-24 md:space-y-40">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex flex-col md:flex-row items-center gap-12 md:gap-20 ${
                  index % 2 !== 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="w-full md:w-1/2 relative h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-slate-100 group">
                  <Image
                    src={step.imageSrc}
                    alt={step.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="w-full md:w-1/2 space-y-8">
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight text-slate-900">
                    {step.title}
                  </h2>
                  <p className="text-slate-600 text-lg font-light leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="space-y-4">
                    {step.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start text-slate-500 font-light italic">
                        <span className="text-teal-600 mr-4 mt-1">―</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-32 md:mt-48 bg-slate-50 rounded-[40px] p-10 md:p-20 text-center">
            <h3 className="text-3xl md:text-4xl font-light text-slate-900 mb-8 tracking-tight">Защо тази технология?</h3>
            <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light italic">
              "Комбинацията от масивна стомана <span className="font-bold text-teal-700 not-italic">10х10х5 мм</span> и дишащи панели създава дом, който е едновременно здрав като бункер и изключително здравословен за обитаване."
            </p>
          </div>

        </div>
      </div>

      {/* 3. FOOTER */}
      <Footer />
      
    </div>
  );
}