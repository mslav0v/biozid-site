"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-[100] bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="flex items-center justify-between px-6 md:px-10 h-20 md:h-24 max-w-[1800px] mx-auto">
        {/* ЛОГО - Увеличено */}
        <Link href="/" className="relative z-10 cursor-pointer flex items-center">
          <Image src="/logo.png" alt="БИОЗИД" width={160} height={48} priority className="md:w-[180px] h-auto" />
        </Link>
        
        {/* ДЕСТКОП МЕНЮ - Кликаеми линкове */}
        <ul className="hidden lg:flex space-x-10 text-[11px] font-bold tracking-[0.2em] text-slate-800 uppercase items-center">
          <li><Link href="/houses" className="hover:text-teal-700 transition">Къщи</Link></li>
          <li><Link href="/processes" className="hover:text-teal-700 transition">Процеси</Link></li>
          <li><Link href="/advantages" className="hover:text-teal-700 transition">Предимства</Link></li>
          <li><Link href="/technology" className="hover:text-teal-700 transition">Технология</Link></li>
          <li><Link href="/calculator" className="text-teal-700 hover:opacity-80 transition">Калкулатор</Link></li>
        </ul>

        <div className="flex items-center gap-6">
          <Link href="/contacts" className="hidden sm:block border border-slate-900 text-slate-900 px-6 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-slate-900 hover:text-white transition">
            Контакти
          </Link>
          
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-slate-900 p-2 text-2xl">
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* МОБИЛНО МЕНЮ */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-8 flex flex-col space-y-6 text-center font-bold tracking-widest text-xs uppercase shadow-2xl">
          <Link href="/houses" onClick={() => setIsMobileMenuOpen(false)}>Къщи</Link>
          <Link href="/processes" onClick={() => setIsMobileMenuOpen(false)}>Процеси</Link>
          <Link href="/advantages" onClick={() => setIsMobileMenuOpen(false)}>Предимства</Link>
          <Link href="/calculator" className="text-teal-700" onClick={() => setIsMobileMenuOpen(false)}>Калкулатор</Link>
          <Link href="/contacts" className="bg-slate-900 text-white py-4 px-6" onClick={() => setIsMobileMenuOpen(false)}>Контакти</Link>
        </div>
      )}
    </nav>
  );
}