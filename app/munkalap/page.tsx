'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, User, MapPin, Box, Info, Calculator } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function FelmeroMunkalapPage() {
  const [munkanemek, setMunkanemek] = useState<any[]>([]);
  const [receptek, setReceptek] = useState<any[]>([]);
  const [lidarInput, setLidarInput] = useState("");
  
  const [customer, setCustomer] = useState({
    name: '', birthPlaceDate: '', address: '', taxId: '', location: '',
    projectId: `PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const [items, setItems] = useState([{ 
    task: '', qty: 0, unit: '', workPrice: 0, materialPrice: 0, materials: [] as any[] 
  }]);

  // GOOGLE SHEETS ADATOK BEOLVASÁSA
  useEffect(() => {
    const sheetId = "1QDkPgvvPx7wwTKlvoDLLwIWlY1z6ladQtoRynOYsHa4";
    const masterUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=249861285`; // Mester fül
    const receptUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=263045857`; // Recept fül
    
    Promise.all([
      fetch(masterUrl).then(res => res.text()),
      fetch(receptUrl).then(res => res.text())
    ]).then(([mCsv, rCsv]) => {
      // Mester fül feldolgozása (Kód, Megnevezés, Egység, Norma, Rezsióradíj)
      const mRows = mCsv.split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
      setMunkanemek(mRows.slice(1).map(r => ({
        code: r[0],
        label: r[1],
        unit: r[2],
        norma: parseFloat(r[3]?.replace(',', '.')) || 0,
        hourlyRate: parseFloat(r[4]?.replace(',', '.')) || 9250
      })).filter(i => i.label));

      // Recept fül feldolgozása (Kód, Anyag neve, Anyag norma, Egység, Anyag Egységár, össz ár)
      const rRows = rCsv.split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
      setReceptek(rRows.slice(1).map(r => ({
        code: r[0],
        name: r[1],
        amount: r[2],
        unit: r[3],
        price: parseFloat(r[5]?.replace(',', '.')) || 0 // Az "össz ár" oszlop (F)
      })).filter(r => r.code));
    });
  }, []);

  const updateItemTask = (index: number, taskLabel: string) => {
    const work = munkanemek.find(a => a.label === taskLabel);
    if (work) {
      // Megkeressük a hozzátartozó anyagokat a kód alapján
      const relatedMaterials = receptek.filter(r => r.code === work.code);
      const totalMatPrice = relatedMaterials.reduce((sum, r) => sum + r.price, 0);

      const newItems = [...items];
      newItems[index] = { 
        ...newItems[index], 
        task: taskLabel, 
        unit: work.unit,
        workPrice: work.norma * work.hourlyRate, 
        materialPrice: totalMatPrice,
        materials: relatedMaterials
      };
      setItems(newItems);
    }
  };

  const totalNet = items.reduce((sum, i) => sum + ((i.workPrice + i.materialPrice) * i.qty), 0);
  const vat = totalNet * 0.27;

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-900">
      <div className="max-w-xl mx-auto space-y-4">
        
        {/* FEJLÉC (Képed alapján sötétkék) */}
        <div className="bg-[#0f172a] p-6 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
          <div>
            <h1 className="text-xl font-black italic tracking-tighter flex items-center gap-2">
              <Calculator className="text-blue-400" /> FELMÉRŐ DASHBOARD
            </h1>
            <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest opacity-70">RenovaMaster v2.0</p>
          </div>
          <button className="bg-blue-600 p-3 rounded-2xl shadow-lg"><FileText /></button>
        </div>

        {/* LiDAR KÁRTYA */}
        <div className="bg-[#1e1b4b] p-5 rounded-[2rem] text-white shadow-xl border border-indigo-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Box size={18} className="text-indigo-400" />
            <p className="text-xs font-black uppercase tracking-widest text-indigo-200">LiDAR Adat Import</p>
          </div>
          <textarea 
            placeholder="Polycam / Canvas export adatok ide..."
            className="w-full bg-[#312e81]/50 p-4 rounded-2xl text-xs outline-none border border-indigo-400/20 h-20 placeholder:text-indigo-400/50 resize-none"
            value={lidarInput}
            onChange={(e) => setLidarInput(e.target.value)}
          />
        </div>

        {/* ÜGYFÉL ADATOK (Képed alapján fehér kártya) */}
        <div className="bg-white p-6 rounded-[2rem] shadow-md border border-slate-100 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Ügyfél adatok</p>
          <input placeholder="Megrendelő teljes neve" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-100 outline-none" onChange={e => setCustomer({...customer, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Születési hely/idő" className="p-4 bg-slate-50 rounded-2xl text-sm border border-slate-100 outline-none" onChange={e => setCustomer({...customer, birthPlaceDate: e.target.value})} />
            <input placeholder="Adóazonosító jel" className="p-4 bg-slate-50 rounded-2xl text-sm border border-slate-100 outline-none" onChange={e => setCustomer({...customer, taxId: e.target.value})} />
          </div>
          <input placeholder="Lakóhely (Cím)" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-100 outline-none" onChange={e => setCustomer({...customer, address: e.target.value})} />
          <input placeholder="Kivitelezési helyszín" className="w-full p-4 bg-blue-50 rounded-2xl text-sm font-bold border border-blue-100 outline-none text-blue-700 placeholder:text-blue-300" onChange={e => setCustomer({...customer, location: e.target.value})} />
        </div>

        {/* TÉTELEK (Az Excelből behúzott adatokkal) */}
        {items.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
            <select 
              onChange={(e) => updateItemTask(index, e.target.value)} 
              className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-sm font-bold border border-slate-200 outline-none"
            >
              <option value="">Válassz munkanemet...</option>
              {munkanemek.map((m, i) => <option key={i} value={m.label}>{m.label}</option>)}
            </select>
            
            {item.materials.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-2xl mb-4 border border-amber-100 flex items-start gap-3">
                <Info size={16} className="text-amber-500 mt-1 shrink-0" />
                <p className="text-[11px] text-amber-900 italic">
                  <span className="font-bold not-italic block mb-1 uppercase">Összetevők:</span>
                  {item.materials.map(m => `${m.name}: ${m.amount} ${m.unit}`).join(', ')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Munkadíj</p>
                <p className="text-lg font-black text-slate-700">{Math.round(item.workPrice * (item.qty || 1)).toLocaleString()} Ft</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Anyagdíj</p>
                <p className="text-lg font-black text-emerald-600">{Math.round(item.materialPrice * (item.qty || 1)).toLocaleString()} Ft</p>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 border-t border-slate-50 pt-4">
              <div className="flex-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Mennyiség ({item.unit || 'm2'})</p>
                <input 
                  type="number" 
                  className="w-full p-4 bg-slate-100 rounded-2xl font-black text-xl outline-none" 
                  onChange={e => {
                    const newItems = [...items];
                    newItems[index].qty = parseFloat(e.target.value) || 0;
                    setItems(newItems);
                }} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Összesen</p>
                <p className="text-3xl font-black text-blue-600 tracking-tighter">
                  {Math.round((item.workPrice + item.materialPrice) * item.qty).toLocaleString()} Ft
                </p>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setItems([...items, { task: '', qty: 0, unit: '', workPrice: 0, materialPrice: 0, materials: [] }])} 
          className="w-full p-5 border-4 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-bold hover:bg-white transition-all"
        >
          + Új tétel hozzáadása
        </button>

        {/* ÖSSZESÍTŐ (Képed alapján sötétkék) */}
        <div className="bg-[#0f172a] text-white p-8 rounded-[3rem] shadow-2xl border-b-8 border-blue-600">
          <div className="flex justify-between items-center">
            <span className="text-sm font-black uppercase text-blue-400">Bruttó fizetendő:</span>
            <span className="text-4xl font-black text-emerald-400 tracking-tighter">
              {Math.round(totalNet + vat).toLocaleString()} Ft
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
