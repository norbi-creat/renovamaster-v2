'use client';
import React from 'react';
import { Truck, Users, AlertTriangle, Calendar, PackageCheck, Thermometer } from 'lucide-react';
import masterData from '@/lib/master_arlista.json';

export default function DashboardPage() {
  const selectedTask = masterData.munkanemek["47_hidegburkolas"].tetelek[0];

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      {/* FEJLÉC - OPERATÍV STÁTUSZ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Helyszíni Operáció</h1>
          <p className="text-slate-500 font-medium">Aktuális fázis: {selectedTask.nev}</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
            <Thermometer size={18} className="text-orange-500" />
            <span className="text-sm font-bold">22°C / 45% pára</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. ANYAG ELLÁTOTTSÁG (A legfontosabb!) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-blue-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-700 flex items-center gap-2"><PackageCheck /> Anyagkészlet</h2>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold text-xs">72H BIZTONSÁG</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 italic">Csemperagasztó:</span>
              <span className="font-bold text-green-600 underline">KÉSZLETEN (12 zsák)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 italic">Fugázó (szürke):</span>
              <span className="font-bold text-orange-500 animate-pulse">ÚTON (Érkezik: 14:00)</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-slate-600 font-bold">Összesített állapot:</span>
              <span className="text-blue-600 font-bold italic">FOLYAMATOS</span>
            </div>
          </div>
        </div>

        {/* 2. ERŐFORRÁS / LÉTSZÁM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-purple-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-700 flex items-center gap-2"><Users /> Aktuális Létszám</h2>
            <span className="text-xs font-bold text-purple-600 italic underline">3 FŐ A HELYSZÍNEN</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium italic text-slate-700">Burkoló mester (AZ-998)</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium italic text-slate-700">Segédmunkás (AZ-002)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 tracking-widest uppercase">Becsült befejezés: 2 munkanap</p>
          </div>
        </div>

        {/* 3. KRITIKUS FIGYELMEZTETÉS */}
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <h2 className="font-bold text-red-700 flex items-center gap-2 mb-4"><AlertTriangle /> Akadályok</h2>
          <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm">
            <p className="text-sm text-red-600 font-bold italic underline mb-1 uppercase">Várakozás:</p>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              A konyhai strangnál a gépész nem fejezte be a nyomáspróbát. A burkolás itt nem kezdhető meg!
            </p>
          </div>
        </div>

        {/* 4. TECHNOLÓGIAI RÉTEGREND (Dinamikus JSON-ból) */}
        <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Calendar className="text-blue-500" size={20} />
            <h2 className="font-bold text-slate-800">Technológiai sorrend és Normaidő</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-green-500">
              <p className="text-[10px] text-slate-400 font-bold italic uppercase">1. Lépés</p>
              <p className="text-xs font-bold text-slate-700 italic">Aljzatkiegyenlítés</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-wider">2. Lépés (Aktuális)</p>
              <p className="text-xs font-bold text-slate-700 italic">{selectedTask.nev}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg border-l-4 border-slate-300 opacity-50">
              <p className="text-[10px] text-slate-400 font-bold italic uppercase">3. Lépés</p>
              <p className="text-xs font-bold text-slate-500 italic">Fugázás (24h múlva)</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg border-l-4 border-slate-300 opacity-50">
              <p className="text-[10px] text-slate-400 font-bold italic uppercase">4. Lépés</p>
              <p className="text-xs font-bold text-slate-500 italic">Szilózás / Átadás</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
