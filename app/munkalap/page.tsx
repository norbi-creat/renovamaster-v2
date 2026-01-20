'use client';
import React, { useState, useEffect } from 'react';
import { FileText, User, Box, Info, Calculator, Calendar, Users, Clock, ClipboardList, LayoutDashboard } from 'lucide-react';

export default function FelmeroMunkalapPage() {
  const [activeTab, setActiveTab] = useState('felmeres'); // 'felmeres' vagy 'tervezes'
  const [munkanemek, setMunkanemek] = useState<any[]>([]);
  const [receptek, setReceptek] = useState<any[]>([]);
  const [workers, setWorkers] = useState(2);
  
  const [customer, setCustomer] = useState({
    name: '', birthPlaceDate: '', address: '', taxId: '', location: '',
    startDate: '', projectId: `PRJ-${new Date().getFullYear()}-001`
  });

  const [items, setItems] = useState([{ 
    task: '', qty: 0, unit: '', workPrice: 0, materialPrice: 0, materials: [] as any[], norma: 0 
  }]);

  // Adatok betöltése (Ugyanaz a logika, mint eddig)
  useEffect(() => {
    // ... (fetch logic marad a régi)
  }, []);

  const totalHours = items.reduce((sum, i) => sum + (i.norma * i.qty), 0);
  const workDays = totalHours > 0 ? Math.ceil(totalHours / (workers * 8)) : 0;

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-24 font-sans">
      
      {/* FIX FELSŐ NAVIGÁCIÓ */}
      <div className="sticky top-0 z-50 bg-[#0f172a] p-4 shadow-2xl">
        <div className="max-w-xl mx-auto flex gap-2">
          <button 
            onClick={() => setActiveTab('felmeres')}
            className={`flex-1 p-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'felmeres' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-800 text-slate-400'}`}
          >
            <ClipboardList size={18} /> FELMÉRÉS
          </button>
          <button 
            onClick={() => setActiveTab('tervezes')}
            className={`flex-1 p-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'tervezes' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'bg-slate-800 text-slate-400'}`}
          >
            <LayoutDashboard size={18} /> TERVEZÉS
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-6 mt-2">
        
        {/* 1. DASHBOARD: FELMÉRÉS */}
        {activeTab === 'felmeres' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Itt a LiDAR, Ügyféladatok és a Tételek listája */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
               <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-widest">Helyszíni Adatok</h3>
               {/* ... LiDAR és Ügyfél inputok ... */}
            </div>
            {/* Tételek kártyái ide kerülnek */}
          </div>
        )}

        {/* 2. DASHBOARD: PROJEKT TERVEZŐ */}
        {activeTab === 'tervezes' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            
            {/* IDŐZÍTÉS KÁRTYA */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative">
              <div className="flex items-center gap-2 mb-6 text-blue-600">
                <Clock size={20} />
                <h3 className="font-black uppercase tracking-widest text-xs">Időterv és Erőforrás</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 text-center">Összes munkaidő</p>
                  <p className="text-3xl font-black text-slate-800 text-center">{totalHours.toFixed(1)} óra</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-400 uppercase mb-2 text-center">Átfutási idő</p>
                  <p className="text-3xl font-black text-blue-700 text-center">{workDays} nap</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Brigád létszáma</span>
                  <div className="flex items-center gap-4 mt-1 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <Users className="ml-2 text-slate-400" size={18} />
                    <input type="range" min="1" max="10" value={workers} onChange={(e) => setWorkers(parseInt(e.target.value))} className="flex-1 accent-blue-600" />
                    <span className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-xl font-black">{workers}</span>
                  </div>
                </label>
              </div>
            </div>

            {/* ANYAGKIGYŰJTÉS KÁRTYA */}
            <div className="bg-[#0f172a] p-6 rounded-[2.5rem] text-white shadow-2xl border-b-8 border-emerald-500">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Összesített Anyagszükséglet</h3>
                  <button className="bg-emerald-600 p-2 rounded-xl text-[10px] font-bold">LISTA MÁSOLÁSA</button>
               </div>
               {/* Itt a receptek alapján összesített lista */}
               <div className="space-y-2 opacity-80 text-sm italic">
                  <p>Még nincs tétel kiválasztva...</p>
               </div>
            </div>

            {/* SZERZŐDÉS GENERÁLÁSA */}
            <button className="w-full bg-blue-600 text-white p-6 rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-3 hover:bg-blue-500 transition-all">
               <FileText size={24} /> SZERZŐDÉS PDF GENERÁLÁSA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
