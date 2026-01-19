'use client';
import React from 'react';
import { 
  Truck, Users, AlertTriangle, Calendar, 
  PackageCheck, Thermometer, Camera, Upload, 
  CheckCircle2 
} from 'lucide-react';
// Importáljuk az árlistát a lib mappából
import masterData from '@/lib/master_arlista.json';

export default function DashboardPage() {
  // A JSON-ból kiválasztjuk a releváns munkanemet (pl. hidegburkolás)
  const selectedTask = masterData.munkanemek["47_hidegburkolas"].tetelek[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      
      {/* --- FEJLÉC: HELYSZÍNI OPERÁCIÓ --- */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tighter">Helyszíni Operáció</h1>
            <p className="text-slate-500 font-medium italic">
              Aktuális fázis: <span className="text-blue-600">{selectedTask.nev}</span>
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
            <Thermometer size={18} className="text-orange-500" />
            <span className="text-sm font-bold">22°C / 45% pára (Ideális)</span>
          </div>
        </div>

        {/* --- FELSŐ KÁRTYÁK --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* ANYAGKÉSZLET */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-blue-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <PackageCheck size={20} className="text-slate-400" /> Anyagkészlet
              </h2>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold uppercase">Receptúra alapján</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 italic">Csemperagasztó:</span>
                <span className="font-bold text-emerald-600">KÉSZLETEN (12 zsák)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 italic">Fugázó (szürke):</span>
                <span className="font-bold text-orange-500 animate-pulse">ÚTON (Várható: 14:00)</span>
              </div>
              <div className="pt-2 border-t border-slate-50">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">LiDAR anyagszükséglet</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[45%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* LÉTSZÁM */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-purple-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <Users size={20} className="text-slate-400" /> Létszám
              </h2>
              <span className="text-xs font-bold text-purple-600 underline">3 FŐ JELEN</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Burkoló mester (AZ-998)</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Segédmunkás (AZ-002)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest px-2">Munkavégzés: 07:15 óta</p>
            </div>
          </div>

          {/* AKADÁLYOK */}
          <div className="bg-[#fff1f2] p-6 rounded-2xl border border-rose-100">
            <h2 className="font-bold text-rose-700 flex items-center gap-2 mb-4">
              <AlertTriangle size={20} /> Akadályok
            </h2>
            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm">
              <p className="text-xs text-rose-600 font-bold italic underline mb-1 uppercase tracking-tighter">Várakozás / Ütközés:</p>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                A konyhai strangnál a gépész nyomáspróbája még tart. A burkolás itt nem kezdhető meg!
              </p>
            </div>
          </div>
        </div>

        {/* --- TECHNOLÓGIAI SORREND --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center gap-2 mb-6 border-b pb-3">
            <Calendar className="text-blue-500" size={20} />
            <h2 className="font-bold text-slate-800">Műszaki Sorrend & Becsült Készültség</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border-l-4 border-emerald-500 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">1. Lépés</p>
                <p className="text-xs font-bold text-slate-700 italic underline">Aljzatkiegyenlítés</p>
              </div>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border-l-4 border-blue-500 ring-2 ring-blue-100">
              <p className="text-[10px] text-blue-400 font-bold uppercase">2. Lépés (Aktuális)</p>
              <p className="text-xs font-bold text-blue-700 italic uppercase tracking-tight">{selectedTask.nev}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border-l-4 border-slate-300 opacity-60">
              <p className="text-[10px] text-slate-400 font-bold uppercase">3. Lépés</p>
              <p className="text-xs font-bold text-slate-500 italic">Fugázás (24h múlva)</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border-l-4 border-slate-300 opacity-60">
              <p className="text-[10px] text-slate-400 font-bold uppercase">4. Lépés</p>
              <p className="text-xs font-bold text-slate-500 italic">Szilikonozás</p>
            </div>
          </div>
        </div>

        {/* --- MŰSZAKVÉGI RIPORT (SÖTÉT PANEL) --- */}
        <div className="bg-[#0f172a] text-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
                <Camera className="text-blue-400" size={28} /> Műszakvégi Riport
              </h2>
              <div className="bg-slate-800/50 p-3 px-5 rounded-2xl border border-slate-700 inline-block">
                <p className="text-slate-300 text-sm italic">
                  Tétel: <span className="text-blue-300 font-bold underline tracking-tight">{selectedTask.nev}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Fotó gomb - Mobil kamera indítással */}
              <label className="flex-1 sm:flex-none cursor-pointer bg-[#1e293b] hover:bg-slate-700 border border-slate-700 px-8 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all group active:scale-95">
                <Upload className="group-hover:scale-110 transition-transform text-blue-400" />
                <span className="text-sm font-bold uppercase tracking-[0.1em]">Fotó feltöltés</span>
                <input type="file" className="hidden" accept="image/*" capture="environment" />
              </label>

              {/* Nap lezárása gomb */}
              <button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                Nap Lezárása
              </button>
            </div>
          </div>

          {/* ALSÓ STATISZTIKÁK */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-800 pt-8">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-2">Számított fogyás</p>
              <p className="text-xl font-mono text-blue-400 font-bold">~42.5 kg</p>
            </div>
            <div className="border-l border-slate-800 pl-6">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-2">Aktuális készültség</p>
              <p className="text-xl font-mono text-emerald-400 font-bold">68.2 %</p>
            </div>
            <div className="border-l border-slate-800 pl-6">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-2">Következő anyag</p>
              <p className="text-lg font-mono text-orange-400 font-bold italic">Fugázó (MAPEI)</p>
            </div>
            <div className="border-l border-slate-800 pl-6">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-2">LiDAR Validálás</p>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-white uppercase italic">Aktív</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
