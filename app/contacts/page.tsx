// app/contacts/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactsPage() {
  const searchParams = useSearchParams();
  const autoMessage = searchParams.get('message');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (autoMessage) {
      setMessage(autoMessage);
    }
  }, [autoMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Тук ще добавиш логиката за изпращане на имейл
    console.log({ name, email, phone, message });
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      
      <main className="pt-28 md:pt-44 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-[1200px]">
          
          <div className="text-center mb-16 md:mb-24">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-700 mb-6">Контакти</h4>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-slate-900 leading-tight mb-6">
              Свържете се с <br className="sm:hidden" /> 
              <span className="italic text-teal-700 font-medium">нашия екип</span>
            </h1>
            <p className="text-base md:text-xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
              Имате въпроси за нашите технологии, цени или искате да обсъдим ваш проект? Ние сме тук, за да ви помогнем.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            
            {/* ЛЯВА ЧАСТ: ИНФОРМАЦИЯ ЗА КОНТАКТ */}
            <div className="space-y-12">
              <div className="bg-slate-50 rounded-[32px] p-8 md:p-12 border border-slate-100">
                <h3 className="text-2xl font-light text-slate-900 mb-8 tracking-tight">Нашите офиси</h3>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 text-teal-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Централен офис - Варна</p>
                      <p className="text-sm text-slate-500 font-light">ул. „Доктор Петър Берон“ № 1,<br />Варна 9000</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 text-teal-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-3.28a1 1 0 01-.948-.684l-1.498-4.493a1 1 0 01.502-1.21l2.257-1.13a11.042 11.042 0 00-5.516-5.516l-1.13 2.257a1 1 0 01-1.21.502l-4.493-1.498a1 1 0 01-.684-.949V5z"></path></svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Телефон</p>
                      <p className="text-sm text-slate-500 font-light">+359 888 123 456</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 text-teal-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Имейл</p>
                      <p className="text-sm text-slate-500 font-light">info@biozid.bg</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative h-64 md:h-80 rounded-[32px] overflow-hidden shadow-lg border border-slate-50">
                <Image src="/biozid_map.jpg" alt="Карта с местоположението на BioZid" fill className="object-cover" />
                <div className="absolute inset-0 bg-teal-900/10" />
              </div>
            </div>

            {/* ДЯСНА ЧАСТ: ФОРМУЛЯР ЗА КОНТАКТ */}
            <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl shadow-teal-50/50 border border-slate-50">
              <h2 className="text-3xl font-light text-slate-900 mb-12 tracking-tight">Изпратете <span className="text-teal-700 italic font-medium">запитване</span></h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ТВОЕТО ИМЕ */}
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Твоето име</label>
                  <input 
                    type="text" 
                    placeholder="Иван Петров" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm outline-none focus:border-teal-300 transition focus:bg-white focus:shadow-xl"
                  />
                </div>
                
                {/* ТЕЛЕФОН */}
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Телефон</label>
                  <input 
                    type="tel" 
                    placeholder="0888 123 456" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm outline-none focus:border-teal-300 transition focus:bg-white focus:shadow-xl"
                  />
                </div>
                
                {/* ИМЕЙЛ АДРЕС */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Имейл адрес</label>
                  <input 
                    type="email" 
                    placeholder="ivan@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm outline-none focus:border-teal-300 transition focus:bg-white focus:shadow-xl"
                  />
                </div>

                {/* ВАШЕТО СЪОБЩЕНИЕ */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Вашето съобщение</label>
                  <textarea 
                    rows={5} 
                    placeholder="Въведете съобщението си тук..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm text-slate-900 outline-none focus:border-teal-300 transition focus:bg-white focus:shadow-xl"
                  ></textarea>
                </div>
                
                {/* ИМАТЕ ГОТОВ ПРОЕКТ? (ОПЦИОНАЛНО) */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Имате готов проект? (Опционално)</label>
                  <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 hover:border-teal-300 transition-colors cursor-pointer group">
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-teal-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <p className="text-sm font-medium text-slate-900">Прикачете скица или архитектурен план</p>
                      <p className="text-xs text-slate-400 font-light">Поддържани формати: PDF, DWG, JPG, PNG (до 20MB)</p>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 mt-6">
                  <button type="submit" className="w-full bg-slate-900 text-white text-center py-5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-teal-700 transition-all shadow-xl">
                    Изпрати запитване
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}