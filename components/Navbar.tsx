"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Заключваме скролирането на страницата, когато мобилното меню е отворено
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    // Плътен бял фон (bg-white) без прозрачност, за да няма застъпване на мобилни
    <nav className="fixed top-0 w-full z-[200] bg-white border-b border-gray-100 transition-all duration-300">
      <div className="flex items-center justify-between px-4 md:px-10 h-20 md:h-24 max-w-[1800px] mx-auto bg-white relative z-[201]">
        
        {/* АДАПТИВНО ЛОГО */}
        <Link href="/" className="relative cursor-pointer flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
          <Image 
            src="/logo.png" 
            alt="БИОЗИД" 
            width={180} 
            height={48} 
            priority 
            className="w-[120px] md:w-[150px] lg:w-[180px] h-auto" 
          />
        </Link>
        
        {/* ДЕСКТОП МЕНЮ */}
        <ul className="hidden lg:flex space-x-10 text-[11px] font-bold tracking-[0.2em] text-slate-800 uppercase items-center">
          <li><Link href="/houses" className="hover:text-teal-700 transition">Къщи</Link></li>
          <li><Link href="/processes" className="hover:text-teal-700 transition">Процеси</Link></li>
          <li><Link href="/advantages" className="hover:text-teal-700 transition">Предимства</Link></li>
          <li><Link href="/technology" className="hover:text-teal-700 transition">Технология</Link></li>
          <li><Link href="/calculator" className="text-teal-700 hover:opacity-80 transition">Калкулатор</Link></li>
        </ul>

        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/contacts" className="hidden sm:block border border-slate-900 text-slate-900 px-6 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-slate-900 hover:text-white transition">
            Контакти
          </Link>
          
          {/* БУТОН ЗА МОБИЛНО МЕНЮ */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="lg:hidden text-slate-900 p-2 text-2xl focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* МОБИЛНО МЕНЮ (Плътен падащ панел) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col z-[190] max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="flex flex-col text-center font-bold tracking-widest text-[11px] uppercase px-6">
            <Link href="/" className="py-5 border-b border-slate-100 text-slate-800 hover:text-teal-700" onClick={() => setIsMobileMenuOpen(false)}>Начало</Link>
            <Link href="/houses" className="py-5 border-b border-slate-100 text-slate-800 hover:text-teal-700" onClick={() => setIsMobileMenuOpen(false)}>Къщи</Link>
            <Link href="/processes" className="py-5 border-b border-slate-100 text-slate-800 hover:text-teal-700" onClick={() => setIsMobileMenuOpen(false)}>Процеси</Link>
            <Link href="/advantages" className="py-5 border-b border-slate-100 text-slate-800 hover:text-teal-700" onClick={() => setIsMobileMenuOpen(false)}>Предимства</Link>
            <Link href="/technology" className="py-5 border-b border-slate-100 text-slate-800 hover:text-teal-700" onClick={() => setIsMobileMenuOpen(false)}>Технология</Link>
            <Link href="/calculator" className="py-5 border-b border-slate-100 text-teal-700" onClick={() => setIsMobileMenuOpen(false)}>Калкулатор</Link>
          </div>
          
          <div className="p-6">
            <Link href="/contacts" className="block w-full bg-slate-900 text-white text-center py-4 rounded-xl uppercase tracking-widest text-[10px] shadow-lg" onClick={() => setIsMobileMenuOpen(false)}>
              Свържете се с нас
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}