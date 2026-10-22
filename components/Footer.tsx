import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white py-12 md:py-16 px-6 border-t border-slate-100">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        
        {/* ЛОГО И АВТОРСКИ ПРАВА */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link href="/" aria-label="БИОЗИД - Начална страница">
            <Image 
              src="/logo.png" 
              alt="БИОЗИД - Сглобяеми конопени къщи" 
              width={160} 
              height={48} 
              className="grayscale opacity-80 hover:opacity-100 transition-opacity" 
            />
          </Link>
          {/* Одит: Променен text-slate-400 на text-slate-500 за по-висок цветови контраст (Accessibility) */}
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} БИОЗИД ЕООД. Всички права запазени.
          </p>
        </div>

        {/* НАВИГАЦИЯ ВЪВ ФУТЪРА (За по-добра вътрешна структура и SEO) */}
        <nav aria-label="Бърза навигация" className="flex flex-wrap justify-center gap-6 text-[11px] font-bold tracking-widest uppercase text-slate-600">
          <Link href="/houses" className="hover:text-teal-700 transition-colors">Къщи</Link>
          <Link href="/technology" className="hover:text-teal-700 transition-colors">Технология</Link>
          <Link href="/advantages" className="hover:text-teal-700 transition-colors">Предимства</Link>
          <Link href="/blog" className="hover:text-teal-700 transition-colors">Блог</Link>
          <Link href="/contacts" className="hover:text-teal-700 transition-colors">Контакти</Link>
        </nav>

        {/* СОЦИАЛНИ ИКОНКИ (С aria-label за перфектно SEO и достъпност) */}
        <div className="flex items-center gap-6">
          {/* Facebook */}
          <a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Facebook страница на БИОЗИД"
            className="text-slate-400 hover:text-[#1877F2] transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
            </svg>
          </a>
          
          {/* Instagram */}
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Instagram профил на БИОЗИД"
            className="text-slate-400 hover:text-[#E4405F] transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
          
          {/* TikTok */}
          <a 
            href="https://tiktok.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="TikTok профил на БИОЗИД"
            className="text-slate-400 hover:text-black transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
            </svg>
          </a>

          {/* YouTube */}
          <a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="YouTube канал на БИОЗИД"
            className="text-slate-400 hover:text-[#FF0000] transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.501 6.186C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        </div>

        {/* ЮРИДИЧЕСКИ ЛИНКОВЕ */}
        <div className="flex gap-6 text-[10px] font-bold tracking-widest uppercase text-slate-500">
          <Link href="/privacy" className="hover:text-teal-700 transition-colors">Политика за поверителност</Link>
          <Link href="/terms" className="hover:text-teal-700 transition-colors">Условия за ползване</Link>
        </div>
      </div>
    </footer>
  );
}