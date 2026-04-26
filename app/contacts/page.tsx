"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ContactsPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  
  // Добавяме състояния за статуса на изпращане
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlMessage = params.get("message");
      if (urlMessage) {
        setMessage(urlMessage);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName(null);
    }
  };

  // Логика за изпращане на формата с файл
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Събираме всички данни от формата, включително файла
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData, // Изпращаме директно FormData (без headers, за да може браузърът сам да сетне boundary)
      });

      if (response.ok) {
        setSubmitStatus('success');
        e.currentTarget.reset();
        setMessage("");
        setFileName(null);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error("Възникна грешка:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 relative">
      
      {/* HEADER */}
      <Navbar />

      <div className="pt-32 md:pt-44 pb-20 md:pb-32">
        <div className="container mx-auto px-6 max-w-[1400px]">
          
          <div className="text-center mb-16 md:mb-24">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-700 mb-6">Контакти</h4>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-slate-900 leading-tight">
              Готови ли сте за вашия <br />
              <span className="italic text-teal-700 font-medium">нов дом?</span>
            </h1>
          </div>

          <div className="grid lg:grid-cols-5 gap-16 md:gap-24 items-start">
            
            {/* ЛЯВА КОЛОНА: ИНФОРМАЦИЯ ЗА КОНТАКТ */}
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h3 className="text-2xl font-light text-slate-900 mb-8">Свържете се с нас</h3>
                <p className="text-slate-600 font-light leading-relaxed mb-8">
                  Имате въпроси относно технологията, процеса на строителство или искате да обсъдим вашия индивидуален проект? Ние сме насреща.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Телефон</span>
                  <a href="tel:0887494844" className="text-2xl font-light text-teal-700 hover:text-teal-900 transition">
                    0887 49 48 44
                  </a>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Имейл</span>
                  <a href="mailto:office@biozid.bg" className="text-xl font-light text-slate-900 hover:text-teal-700 transition">
                    office@biozid.bg
                  </a>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Производствена база</span>
                  <p className="text-lg font-light text-slate-900 leading-relaxed">
                    БИОЗИД ЕООД<br />
                    гр. Добрич,<br />
                    ул. Ан. Стоянов 1
                  </p>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Работно време</span>
                  <p className="text-lg font-light text-slate-600">
                    Пон - Пет: 09:00 - 18:00 ч.<br />
                    Събота и Неделя: Почивен ден
                  </p>
                </div>
              </div>

              {/* СОЦИАЛНИ ВРЪЗКИ */}
              <div className="pt-8 border-t border-slate-200">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-6 block">Последвайте ни</span>
                <div className="flex items-center gap-6">
                  <Link href="#" className="text-slate-400 hover:text-[#1877F2] transition-colors duration-300">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                    </svg>
                  </Link>
                  <Link href="#" className="text-slate-400 hover:text-[#E4405F] transition-colors duration-300">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </Link>
                  <Link href="#" className="text-slate-400 hover:text-black transition-colors duration-300">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
                    </svg>
                  </Link>
                  <Link href="#" className="text-slate-400 hover:text-[#FF0000] transition-colors duration-300">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.501 6.186C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* ДЯСНА КОЛОНА: ФОРМА ЗА ЗАПИТВАНЕ */}
            <div className="lg:col-span-3 bg-white rounded-[40px] p-8 md:p-14 shadow-2xl border border-slate-100">
              <h3 className="text-2xl font-light text-slate-900 mb-8">Изпратете запитване</h3>
              
              <form className="space-y-8" onSubmit={handleSubmit}>
                
                {/* Име и Телефон в един ред на десктоп */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 ml-2">Име и Фамилия</label>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-light"
                      placeholder="Иван Иванов"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 ml-2">Телефон</label>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-light"
                      placeholder="0888 123 456"
                    />
                  </div>
                </div>

                {/* Имейл */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 ml-2">Имейл адрес</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-light"
                    placeholder="ivan@example.com"
                  />
                </div>

                {/* Съобщение */}
                <div className="space-y-2">
                  <label htmlFor="message" className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 ml-2">Вашето съобщение</label>
                  <textarea 
                    id="message"
                    name="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-light resize-none"
                    placeholder="Разкажете ни за вашата идея..."
                  ></textarea>
                </div>

                {/* Качване на файл */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 ml-2">Имате готов проект? (Опционално)</label>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                    <input 
                      type="file" 
                      id="file-upload" 
                      name="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.png,.dwg"
                    />
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <svg className="w-10 h-10 text-teal-600 mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {fileName ? (
                        <p className="text-teal-700 font-medium">Избран файл: {fileName}</p>
                      ) : (
                        <>
                          <p className="text-slate-600 font-medium mb-1">Прикачете скица или архитектурен план</p>
                          <p className="text-xs text-slate-400 font-light">Поддържани формати: PDF, DWG, JPG, PNG (до 20MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Статус и Бутон за изпращане */}
                {submitStatus === 'success' && (
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100 text-center">
                    Запитването е изпратено успешно! Ще се свържем с вас скоро.
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 text-center">
                    Възникна грешка при изпращането. Моля, опитайте отново или ни се обадете.
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-teal-700 transition-colors shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Изпращане..." : "Изпрати запитване"}
                </button>

              </form>
            </div>
            
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
      
    </main>
  );
}