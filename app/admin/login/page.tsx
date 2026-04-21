"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Тук по-късно ще сложим реалната логика за връзка със Supabase/Бекенда
    setTimeout(() => {
      if (email === 'admin@biozid.bg' && password === 'admin123') {
        // Успешен вход -> пренасочване към таблото (Dashboard)
        window.location.href = '/admin/dashboard';
      } else {
        setError('Грешен имейл или парола. Моля, опитайте отново.');
        setIsLoading(false);
      }
    }, 1500); // Симулираме време за зареждане
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      
      {/* Бутон за връщане към сайта */}
      <Link href="/" className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-teal-600 transition flex items-center gap-2">
        <span>&larr;</span> Към сайта
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        
        <div className="bg-slate-900 p-8 text-center flex flex-col items-center justify-center border-b-4 border-teal-600">
          <Image src="/logo.png" alt="БИОЗИД" width={120} height={35} className="brightness-0 invert mb-2" />
          <h1 className="text-white text-xs font-bold uppercase tracking-widest mt-4 opacity-80">Система за управление</h1>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-xs font-bold border border-red-100 text-center">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Служебен Имейл</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded outline-none focus:border-teal-500 transition text-sm font-medium text-slate-800"
                placeholder="office@biozid.bg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Парола</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded outline-none focus:border-teal-500 transition text-sm font-medium text-slate-800"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4 rounded text-xs font-bold uppercase tracking-widest transition shadow-lg flex justify-center items-center ${
                isLoading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-slate-900'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Вход в системата'
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Достъп само за оторизиран персонал
          </p>
        </div>
      </div>
    </main>
  );
}