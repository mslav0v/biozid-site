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
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Затваряне на мобилното меню при натискане на клавиша Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="fixed top-0 w-full z-[200] bg-white border-b border-gray-100 transition-all duration-300">
      <nav aria-label="Основна навигация" className="flex items-center justify-between px-4 md:px-10 h-20 md:h-24 max-w-[1800px] mx-auto bg-white relative z-[201]">
        
        {/* АДАПТИВНО ЛОГО */}
        <Link 
          href="/" 
          className="relative cursor-pointer flex items-center" 
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="БИОЗИД - Начална страница"
        >
          <Image 
            src="/logo.png" 
            alt="БИОЗИД - Сглобяеми екологични конопени къщи" 
            width={180} 
            height={48} 
            priority 
            className="w-[120px] md:w-[150px] lg:w-[180px] h-auto" 
          />
        </Link>
        
        {/* ДЕСКТОП МЕНЮ */}
        <ul className="hidden lg:flex space-x-8 xl:space-x-10 text-[11px] font-bold tracking-[0.2em] text-slate-800 uppercase items-center">
          <li><Link href="/houses" className="hover:text-teal-700 transition-colors py-2">Къщи</Link></li>
          <li><Link href="/processes" className="hover:text-teal-700 transition-colors py-2">Процеси</Link></li>
          <li><Link href="/advantages" className="hover:text-teal-700 transition-colors py-2">Предимства</Link></li>
          <li><Link href="/technology" className="hover:text-teal-700 transition-colors py-2">Технология</Link></li>
          <li><Link href="/blog" className="hover:text-teal-700 transition-colors py-2">Блог</Link></li>
          <li><Link href="/calculator" className="text-teal-700 hover:opacity-80 transition-opacity py-2 font-black">Калкулатор</Link></li>
        </ul>

        <div className="flex items-center gap-4 md:gap-6">
          <Link 
            href="/contacts" 
            className="hidden sm:inline-block border border-slate-900 text-slate-900 px-6 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-slate-900 hover:text-white transition-all"
          >
            Контакти
          </Link>
          
          {/* БУТОН ЗА МОБИЛНО МЕНЮ */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="lg:hidden text-slate-900 p-2 text-2xl focus:outline-none min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label={isMobileMenuOpen ? "Затвори менюто" : "Отвори менюто"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* МОБИЛНО МЕНЮ (Плътен падащ панел) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col z-[190] max-h-[calc(100vh-80px)] overflow-y-auto border-t border-slate-100">
          <ul className="flex flex-col text-center font-bold tracking-widest text-[11px] uppercase px-6">
            <li><Link href="/" className="block py-5 border-b border-slate-100 text-slate-800 hover:text-teal-700 active:bg-slate-50" onClick={() => setIsMobileMenuOpen(false)}>Начало</Link></li>
            <li><Link href="/houses" className="block py-5 border-b border-slate-100 text-slate-800 hover:text-teal-700 active:bg-slate-50" onClick={() => setIsMobileMenuOpen(false)}>Къщи</Link></li>
            <li><Link href="/processes" className="block py-5 border-b border-slate-100 text-slate-800 hover:text-teal-700 active:bg-slate-50" onClick={() => setIsMobileMenuOpen(false)}>Процеси</Link></li>
            <li><Link href="/advantages" className="block py-5 border-b border-slate-100 text-slate-800 hover:text-teal-700 active:bg-slate-50" onClick={() => setIsMobileMenuOpen(false)}>Предимства</Link></li>
            <li><Link href="/technology" className="block py-5 border-b border-slate-100 text-slate-800 hover:text-teal-700 active:bg-slate-50" onClick={() => setIsMobileMenuOpen(false)}>Технология</Link></li>
            <li><Link href="/blog" className="block py-5 border-b border-slate-100 text-slate-800 hover:text-teal-700 active:bg-slate-50" onClick={() => setIsMobileMenuOpen(false)}>Блог</Link></li>
            <li><Link href="/calculator" className="block py-5 border-b border-slate-100 text-teal-700 font-black active:bg-slate-50" onClick={() => setIsMobileMenuOpen(false)}>Калкулатор</Link></li>
          </ul>
          
          <div className="p-6">
            <Link 
              href="/contacts" 
              className="block w-full bg-slate-900 text-white text-center py-4 rounded-xl uppercase tracking-widest text-[10px] font-bold shadow-lg active:scale-[0.98] transition-transform" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Свържете се с нас
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}