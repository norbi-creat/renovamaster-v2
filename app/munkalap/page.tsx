'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, User, MapPin, Box, Info, Calculator, Calendar, Users, Clock, ClipboardList, LayoutDashboard } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function FelmeroMunkalapPage() {
  const [activeTab, setActiveTab] = useState('felmeres'); // 'felmeres' vagy 'tervezes'
  const [munkanemek, setMunkanemek] = useState<any[]>([]);
  const [receptek, setReceptek] = useState<any[]>([]);
  const [lidarInput, setLidarInput] = useState("");
  const [workers, setWorkers] = useState(2);
  
  const [customer, setCustomer] = useState({
    name: '',
    birthPlaceDate: '',
    address: '',
    taxId: '',
    location: '',
    locationId: '', // Helyrajzi szám
    startDate: '',
    projectId: `PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const [items, setItems] = useState([{ 
    task: '', qty: 0, unit: '', workPrice: 0, materialPrice: 0, materials: [] as any[], norma: 0 
  }]);

  // ADATOK BETÖLTÉSE A GOOGLE SHEETS-BŐL
  useEffect(() => {
    const sheetId = "1QDkPgvvPx7wwTKlvoDLLwIWlY1z6ladQtoRynOYsHa4";
    const masterUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=249861285`;
    const receptUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=263045857`;
    
    Promise.all([
      fetch(masterUrl).then(res => res.text()),
      fetch(receptUrl).then(res => res.text())
    ]).then(([mCsv, rCsv]) => {
      const mRows = mCsv.split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
      setMunkanemek(mRows.slice(1).map(r => ({
        code: r[0], label: r[1], unit: r[2],
        norma: parseFloat(r[3]?.replace(',', '.')) || 0,
        hourlyRate: parseFloat(r[4]?.replace(',', '.')) || 9250
      })).filter(i => i.label));

      const rRows = rCsv.split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
      setReceptek(rRows.slice(1).map(r => ({
        code: r[0], name: r[1], amount: r[2], unit: r[3],
        price: parseFloat(r[5]?.replace(',', '.')) || 0 // Össz ár oszlop
      })).filter(r => r.code));
    });
  }, []);

  const updateItemTask = (index: number, taskLabel: string) => {
    const work = munkanemek.find(a => a.label === taskLabel);
    if (work) {
      const relatedMaterials = receptek.filter(r => r.code === work.code);
      const totalMatPrice = relatedMaterials.reduce((sum, r) => sum + r.price, 0);

      const newItems = [...items];
      newItems[index] = { 
        ...newItems[index], task: taskLabel, unit: work.unit,
        workPrice: work.norma * work.hourlyRate, materialPrice: totalMatPrice,
        materials: relatedMaterials, norma: work.norma
      };
      setItems(newItems);
    }
  };

  // SZÁMÍTÁSOK
  const totalHours = items.reduce((sum, i) => sum + (i.norma * i.qty), 0);
  const workDays = totalHours > 0 ? Math.ceil(totalHours / (workers * 8)) : 0;
  const totalNet = items.reduce((sum, i) => sum + ((i.workPrice + i.materialPrice) * i.qty), 0);
  const vat = totalNet * 0.27;

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-24 font-sans text-slate-900">
      
      {/* FELSŐ NAVIGÁCIÓ */}
      <div className="sticky top-0 z-50 bg-[#0f172a] p-4 shadow-2xl">
        <div className="max-w-xl mx-auto flex gap-2">
          <button 
            onClick={() => setActiveTab('felmeres')}
            className={`flex-1 p-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'felmeres' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}
          >
            <ClipboardList size={18} /> FELMÉRÉS
          </button>
          <button 
            onClick={() => setActiveTab('tervezes')}
            className={`flex-1 p-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'tervezes' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}
          >
            <LayoutDashboard size={18} /> TERVEZÉS
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        
        {/* 1. DASHBOARD: FELMÉRÉS */}
        {activeTab === 'felmeres' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* LIDAR IMPORT */}
            <div className="bg-[#1e1b4b] p-5 rounded-[2rem] text-white shadow-xl border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-3 text-indigo-300">
                <Box size={18} />
                <p className="text-xs font-black uppercase tracking-widest text-indigo-200">LiDAR Adat Import</p>
              </div>
              <textarea 
                placeholder="Illeszd be a Polycam / Canvas export adatokat..."
                className="w-full bg-[#312e81]/40 p-4 rounded-2xl text-xs outline-none border border-indigo-400/20 h-20 resize-none placeholder:text-indigo-400/30"
                value={lidarInput}
                onChange={(e) => setLidarInput(e.target.value)}
              />
            </div>

            {/* ÜGYFÉL & HELYSZÍNI ADATOK */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 mb-2 text-blue-600">
                <User size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">Helyszíni Adatok</h3>
              </div>
              
              <input placeholder="Megrendelő teljes neve" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none" onChange={e => setCustomer({...customer, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Születési hely, idő" className="p-4 bg-slate-50 rounded-2xl text-xs border border-slate-100 outline-none" onChange={e => setCustomer({...customer, birthPlaceDate: e.target.value})} />
                <input placeholder="Adóazonosító jel" className="p-4 bg-slate-50 rounded-2xl text-xs border border-slate-100 outline-none font-mono" onChange={e => setCustomer({...customer, taxId: e.target.value})} />
              </div>
              <input placeholder="Hivatalos lakcím" className="w-full p-4 bg-slate-50 rounded-2xl text-xs border border-slate-100 outline-none" onChange={e => setCustomer({...customer, address: e.target.value})} />
              
              <div className="pt-2 border-t border-slate-50 grid grid-cols-3 gap-3">
                <input placeholder="Hrsz." className="col-span-1 p-4 bg-blue-50/50 rounded-2xl text-xs font-bold border border-blue-100 outline-none" onChange={e => setCustomer({...customer, locationId: e.target.value})} />
                <input placeholder="Munkavégzés pontos címe" className="col-span-2 p-4 bg-blue-50/50 rounded-2xl text-xs font-bold border border-blue-100 outline-none" onChange={e => setCustomer({...customer, location: e.target.value})} />
              </div>
            </div>

            {/* TÉTELEK */}
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
                  <select 
                    onChange={(e) => updateItemTask(index, e.target.value)} 
                    className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-sm font-bold border border-slate-200 outline-none appearance-none"
                  >
                    <option value="">Válassz munkanemet...</option>
                    {munkanemek.map((m, i) => <option key={i} value={m.label}>{m.label}</option>)}
                  </select>
                  
                  {item.materials.length > 0 && (
                    <div className="bg-amber-50 p-4 rounded-2xl mb-4 border border-amber-100 flex items-start gap-3">
                      <Info size={16} className="text-amber-500 mt-1 shrink-0" />
                      <p className="text-[11px] text-amber-900 italic leading-relaxed">
                        <span className="font-bold not-italic block mb-1 uppercase text-[9px] opacity-70">Összetevők:</span>
                        {item.materials.map(m => `${m.name}: ${m.amount} ${m.unit}`).join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-end gap-4 border-t border-slate-50 pt-4 text-right">
                    <div className="flex-1 text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Mennyiség ({item.unit || 'm2'})</p>
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-full p-4 bg-slate-100 rounded-2xl font-black text-xl outline-none" 
                        onChange={e => {
                          const newItems = [...items];
                          newItems[index].qty = parseFloat(e.target.value) || 0;
                          setItems(newItems);
                      }} />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-blue-600 tracking-tighter">
                        {Math.round((item.workPrice + item.materialPrice) * item.qty).toLocaleString()} Ft
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setItems([...items, { task: '', qty: 0, unit: '', workPrice: 0, materialPrice: 0, materials: [], norma: 0 }])} className="w-full p-5 border-4 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black">+ ÚJ TÉTEL</button>
            </div>
          </div>
        )}

        {/* 2. DASHBOARD: PROJEKT TERVEZŐ */}
        {activeTab === 'tervezes' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* IDŐTERV KÁRTYA */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 opacity-80 mb-4">
                  <Clock size={18} />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Munkaidő Kalkuláció</p>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Összesen</p>
                    <p className="text-4xl font-black">{totalHours.toFixed(1)} <span className="text-sm opacity-50 uppercase">óra</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Időtartam</p>
                    <p className="text-4xl font-black">{workDays} <span className="text-sm opacity-50 uppercase">nap</span></p>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-bold uppercase mb-3 opacity-80">Létszám beállítása</p>
                  <div className="flex items-center gap-4">
                    <Users size={20} className="text-blue-300" />
                    <input type="range" min="1" max="10" value={workers} onChange={(e) => setWorkers(parseInt(e.target.value))} className="flex-1 h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-white" />
                    <span className="text-2xl font-black w-8">{workers}</span>
                  </div>
                </div>
              </div>
              <Calendar size={120} className="absolute -right-8 -top-8 opacity-10 rotate-12" />
            </div>

            {/* SZERZŐDÉS ADATAI */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={18} />
                <p className="text-xs font-black uppercase tracking-widest">Szerződéskötési adatok</p>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase ml-2">Munkavégzés tervezett kezdete</p>
                <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none text-blue-600" onChange={e => setCustomer({...customer, startDate: e.target.value})} />
              </div>
            </div>

            {/* ANYAGKIGYŰJTÉS */}
            <div className="bg-[#0f172a] p-8 rounded-[3rem] text-white shadow-2xl border-b-[10px] border-emerald-500">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Összesített Anyagszükséglet</h3>
                  <button className="bg-emerald-600/20 text-emerald-400 p-3 rounded-xl text-[10px] font-bold border border-emerald-500/20">LISTA MÁSOLÁSA</button>
               </div>
               <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {items.some(i => i.materials.length > 0) ? (
                    items.map(item => item.materials.map((m, i) => (
                      <div key={i} className="flex justify-between text-sm border-b border-slate-800 pb-2">
                        <span className="opacity-70">{m.name}</span>
                        <span className="font-bold text-emerald-400">{Math.round(m.amount * item.qty * 100)/100} {m.unit}</span>
                      </div>
                    )))
                  ) : (
                    <p className="text-slate-500 italic text-sm text-center">Nincs még hozzáadott anyag...</p>
                  )}
               </div>
            </div>

            {/* GENERÁLÁS */}
            <button className="w-full bg-blue-600 text-white p-6 rounded-[2.5rem] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
               <FileText size={24} /> SZERZŐDÉS GENERÁLÁSA
            </button>
          </div>
        )}

        {/* FIX BRUTTÓ ÖSSZESÍTŐ (Alul) */}
        <div className="bg-[#0f172a] text-white p-8 rounded-[3rem] shadow-2xl border-b-[10px] border-blue-600 flex justify-between items-center sticky bottom-4">
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Bruttó összesen</p>
            <span className="text-3xl font-black text-emerald-400 tracking-tighter tabular-nums">
              {Math.round(totalNet + vat).toLocaleString()} Ft
            </span>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold opacity-40 uppercase">ÁFA (27%)</p>
             <p className="font-bold text-sm text-slate-300">{Math.round(vat).toLocaleString()} Ft</p>
          </div>
        </div>
      </div>
    </div>
  );
}
