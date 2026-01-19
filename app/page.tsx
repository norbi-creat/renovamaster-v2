'use client';
import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-10">
      <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        RenovaMaster AI
      </h1>
      <p className="text-slate-400 mb-8 text-xl">Intelligens kivitelezés-felügyelet</p>
      <Link href="/dashboard" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20">
        Dashboard Megnyitása →
      </Link>
    </div>
  );
}
