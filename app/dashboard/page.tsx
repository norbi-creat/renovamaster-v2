'use client';
import React from 'react';
import { Wallet, Truck, Layers, Box, ChevronRight } from 'lucide-react';
// Itt hivatkozunk a korábban létrehozott JSON fájlodra
import masterData from '@/lib/master_arlista.json';

export default function DashboardPage() {
  // Kiválasztunk egy példa tételt a JSON-ból (pl. Hidegburkolás első eleme)
  const sampleItem = masterData.munkanemek["47_hidegburkolas"].tetelek[0];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-10 border-b pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">DASHBOARD</h1>
            <p className="text-slate-500 font-medium">RenovaMaster AI • Építésvezetői nézet</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Projekt kód</span>
            <p className="font-mono text-blue-600 font-bold">#REV-2024-001</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* KÖLTSÉGVETÉS PANEL */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-2xl">
                <Wallet className="text-green-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Költségfigyelő</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Aktuális költés:</span>
                <span className="font-bold text-slate-900">1.240.500 Ft</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[65%]"></div>
              </div>
              <p className="text-xs text-slate-400 italic">A keret 65%-a felhasználva.</p>
            </div>
          </div>

          {/* LOGISZTIKA PANEL */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Truck className="text-blue-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Szállítások</h2>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center border border-slate-100">
              <div>
                <p className="font-bold text-slate-800 text-sm">{sampleItem.kod} sz. tétel</p>
                <p className="text-xs text-slate-500">Státusz: Úton a telephelyről</p>
              </div>
              <ChevronRight className="text-slate-300" />
            </div>
          </div>

          {/* TECHNOLÓGIA PANEL (JSON adatokkal) */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-2xl">
                <Layers className="text-purple-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 text-purple-700 italic">Műszaki leírás: {sampleItem.nev}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Alkalmazási terület</h3>
                <p className="text-slate-700 leading-relaxed italic">
                  {sampleItem.alkalmazas}
                </p>
              </div>
              <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 flex flex-col items-center justify-center text-center">
                <Box className="text-orange-500 mb-2" size={32} />
                <h3 className="text-xs font-bold text-orange-800 uppercase tracking-widest">LiDAR metszet</h3>
                <p className="text-[10px] text-orange-600 font-medium">3 réteg detektálva</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
