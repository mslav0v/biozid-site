// app/admin/dashboard/cache/page.tsx
"use client";

import { useState } from "react";

export default function CacheManagerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");

  const handleClearCache = async () => {
    setIsLoading(true);
    setStatus('idle');
    setMessage("");

    try {
      // Извикваме API-то с нашата тайна парола
      const response = await fetch('/api/revalidate?secret=biozid-super-secret-123', {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || "Кешът на блога е изчистен успешно! Новите статии вече са видими.");
      } else {
        setStatus('error');
        setMessage(data.message || "Грешка при изчистване на кеша.");
      }
    } catch (error) {
      setStatus('error');
      setMessage("Проблем със сървъра. Опитайте отново по-късно.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Управление на Кеша</h1>
      <p className="text-slate-500 mb-10">
        Използвайте този бутон само когато сте публикували нова статия в Soro и искате тя да се появи на сайта веднага, без да чакате автоматичното опресняване.
      </p>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-6">Изчистване на кеша за Блога</h2>
        
        <button
          onClick={handleClearCache}
          disabled={isLoading}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-3 shadow-md"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Изчистване...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Изчисти кеша сега
            </>
          )}
        </button>

        {/* Съобщения за успех или грешка */}
        {status === 'success' && (
          <div className="mt-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
            {message}
          </div>
        )}
        
        {status === 'error' && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}