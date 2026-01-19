'use client';
import React, { useState } from 'react';
import { 
  Truck, Users, AlertTriangle, Calendar, 
  PackageCheck, Thermometer, Camera, Upload, 
  Layers, Box, ChevronRight, CheckCircle2 
} from 'lucide-react';
// Feltételezzük, hogy a lib mappában ott a JSON
import masterData from '@/lib/master_arlista.json';

export default function DashboardPage() {
  // Példa tétel kiválasztása a JSON-ból: Hidegburkolás
  const selectedTask = masterData.munkanemek["47_hidegburkolas"].tetelek[0];

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
      
      {/* --- FEJLÉC: OPERATÍV STÁTUSZ --- */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Helyszíni Operáció</h1>
            <p className="text-slate-500 font-medium italic">Aktuális fázis: {selectedTask.nev}</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
              <Thermometer size={18} className="text-orange-500" />
              <span className="text-sm font-bold tracking-tight">22°C / 45% pára (Ideális)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. ANYAG ELLÁTOTTSÁG (LiDAR alapú becslés) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-blue-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-700 flex items-center gap-2"><PackageCheck size={20}/> Anyagkészlet</h2>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold">RECEPTÚRA ALAPJÁN</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 italic">Csemperagasztó:</span>
                <span className="font-bold text-green-600 underline">KÉSZLETEN (12 zsák)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 italic">Fugázó (szürke):</span>
                <span className="font-bold text-orange-500 animate-pulse">ÚTON (Várható: 14:00)</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">LiDAR anyagszükséglet</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[45%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ERŐFORRÁS / LÉTSZÁM */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-purple-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-700 flex items-center gap-2"><Users size={20}/> Létszám</h2>
              <span className="text-xs font-bold text-purple-600 italic underline">3 FŐ JELEN</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium italic text-slate-700 tracking-tight">Burkoló mester (AZ-998)</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium italic text-slate-700 tracking-tight">Segédmunkás (AZ-002)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 tracking-widest uppercase">Munkavégzés: 07:15 óta</p>
            </div>
          </div>

          {/* 3. KRITIKUS AKADÁLYOK */}
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col justify-between">
            <h2 className="font-bold text-red-700 flex items-center gap-2 mb-4"><AlertTriangle size={20}/> Akadályok</h2>
            <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm">
              <p className="text-xs text-red-600 font-bold italic underline mb-1 uppercase tracking-tighter">Várakozás / Ütközés:</p>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                A konyhai strangnál a gépész nyomáspróbája még tart. A burkolás itt nem kezdhető meg!
              </p>
            </div>
          </div>

          {/* --- TECHNOLÓGIAI LÁNC --- */}
          <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6 border-b pb-3">
              <Calendar className="text-blue-500" size={20} />
              <h2 className="font-bold text-slate-800">Műszaki Sorrend & Becsült Készültség</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-green-500 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">1. Lépés</p>
                  <p className="text-xs font-bold text-slate-700 italic underline">Aljzatkiegyenlítés</p>
                </div>
                <CheckCircle2 size={16} className="text-green-500" />
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500 ring-2 ring-blue-200">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">2. Lépés (Aktuális)</p>
                <p className="text-xs font-bold text-blue-700 italic uppercase tracking-tight">{selectedTask.nev}</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg border-l-4 border-slate-300 opacity-60">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">3. Lépés</p>
                <p className="text-xs font-bold text-slate-500 italic">Fugázás (24h múlva)</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg border-l-4 border-slate-300 opacity-60">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">4. Lépés</p>
                <p className="text-xs font-bold text-slate-500 italic">Szilikonozás</p>
              </div>
            </div>
          </div>

          {/* --- MŰSZAKVÉGI RIPORT & FOTÓ --- */}
          <div className="md:col-span-3 bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
                  <Camera className="text-blue-400" size={28} /> Műszakvégi Riport
                </h2>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 inline-block">
                  <p className="text-slate-300 text-sm italic">
                    Tétel: <span className="text-blue-300 font-bold underline tracking-tight">{selectedTask.nev}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                {/* Fotó gomb */}
                <label className="flex-1 sm:flex-none cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 px-8 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all group active:scale-95">
                  <Upload className="group-hover:scale-110 transition-transform text-blue-400" />
                  <span className="text-sm font-bold uppercase tracking-[0.1em]">Fotó feltöltés</span>
                  <input type="file" className="hidden" accept="image/*" capture="environment" />
                </label>

                {/* Záró gomb */}
                <button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                  Nap Lezárása
                </button>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-800 pt-8">
              <div className="text-center md:text-left">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">Számított fogyás</p>
                <p className="text-xl font-mono text-blue-400 font-bold">~42.5 kg</p>
              </div>
              <div className="text-center md:text-left border-l border-slate-800 pl-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">Aktuális készültség</p>
                <p className="text-xl font-mono text-emerald-400 font-bold">68.2 %</p>
              </div>
              <div className="text-center md:text-left border-l border-slate-800 pl-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">Következő anyag</p>
                <p className="text-lg font-mono text-orange-400 font-bold italic">Fugázó (MAPEI)</p>
              </div>
              <div className="text-center md:text-left border-l border-slate-800 pl-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">LiDAR Validálás</p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-white uppercase italic">Aktív</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
