'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, User, MapPin, Box, Info, Calculator, Calendar, Users, Clock, ClipboardList, LayoutDashboard, Receipt, Hammer, Wallet, CreditCard } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function FelmeroMunkalapPage() {
  const [activeTab, setActiveTab] = useState('felmeres');
  const [munkanemek, setMunkanemek] = useState<any[]>([]);
  const [receptek, setReceptek] = useState<any[]>([]);
  const [lidarInput, setLidarInput] = useState("");
  const [workers, setWorkers] = useState(2);
  
  // VÁLLALKOZÁS ADATAI
  const provider = {
    name: 'Kaheliszto Építőipari Kft.',
    address: '3561 Felsőzsolca, Nagyszilvás u. 26.',
    taxId: '32020162-2-05',
    regId: '05-09-035703'
  };

  const [customer, setCustomer] = useState({
    name: '', birthPlaceDate: '', address: '', taxId: '', location: '', locationId: '',
    startDate: '', projectId: `PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const [items, setItems] = useState([{ 
    task: '', qty: 0, unit: '', workPrice: 0, materialPrice: 0, materials: [] as any[], norma: 0 
  }]);

  // ADATOK BETÖLTÉSE
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
        code: r[0], name: r[1], amount: parseFloat(r[2]?.replace(',', '.')) || 0, unit: r[3],
        price: parseFloat(r[5]?.replace(',', '.')) || 0
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

  // --- SZÁMÍTÁSOK ---
  const totalHours = items.reduce((sum, i) => sum + (i.norma * i.qty), 0);
  const workDays = totalHours > 0 ? Math.ceil(totalHours / (workers * 8)) : 0;
  const totalNetWork = items.reduce((sum, i) => sum + (i.workPrice * i.qty), 0);
  const totalNetMaterial = items.reduce((sum, i) => sum + (i.materialPrice * i.qty), 0);
  const totalNetOverall = totalNetWork + totalNetMaterial;
  const vat = totalNetOverall * 0.27;
  const brutton = totalNetOverall + vat;

  const getAggregatedMaterials = () => {
    const totals: { [key: string]: { name: string, qty: number, unit: string } } = {};
    items.forEach(item => {
      item.materials.forEach(m => {
        const key = m.name + m.unit;
        if (!totals[key]) totals[key] = { name: m.name, qty: 0, unit: m.unit };
        totals[key].qty += (m.amount * item.qty);
      });
    });
    return Object.values(totals);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('hu-HU');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(provider.name, 20, 20);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text([`Székhely: ${provider.address}`, `Adószám: ${provider.taxId} | Cégjegyzékszám: ${provider.regId}`], 20, 26);
    doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("VÁLLALKOZÁSI SZERZŐDÉS", 105, 45, { align: "center" });
    doc.setFontSize(9); doc.text(`Projekt: ${customer.projectId}`, 20, 55); doc.text(`Dátum: ${now}`, 160, 55);
    doc.line(20, 58, 190, 58);
    doc.text("MEGRENDELŐ:", 20, 65); doc.setFont("helvetica", "normal");
    doc.text([`Név: ${customer.name || '...'}`, `Lakcím: ${customer.address || '...'}`, `Helyszín: ${customer.location || '...'} (Hrsz: ${customer.locationId || '...'})`], 20, 70);
    const tableData = items.filter(i => i.task).map(i => [i.task, `${i.qty} ${i.unit}`, `${Math.round(i.workPrice + i.materialPrice).toLocaleString()} Ft`, `${Math.round((i.workPrice + i.materialPrice) * i.qty).toLocaleString()} Ft`]);
    (doc as any).autoTable({ startY: 85, head: [['Megnevezés', 'Menny.', 'Nettó Egységár', 'Összesen']], body: tableData, theme: 'grid', headStyles: { fillColor: [30, 41, 59] } });
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold"); doc.text(`BRUTTÓ: ${Math.round(brutton).toLocaleString()} Ft`, 130, finalY + 15);
    doc.text("FIZETÉSI ÜTEMEZÉS:", 20, finalY + 25); doc.setFont("helvetica", "normal");
    doc.text([`1. Előleg (30%): ${Math.round(brutton * 0.3).toLocaleString()} Ft`, `2. Részszámla (40%): ${Math.round(brutton * 0.4).toLocaleString()} Ft`, `3. Végszámla (30%): ${Math.round(brutton * 0.3).toLocaleString()} Ft`], 20, finalY + 32);
    doc.save(`Szerzodes_${customer.name || 'Ugyfel'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-32 font-sans text-slate-900">
      
      {/* NAVIGÁCIÓ */}
      <div className="sticky top-0 z-50 bg-[#0f172a] p-4 shadow-2xl">
        <div className="max-w-xl mx-auto flex gap-2">
          <button onClick={() => setActiveTab('felmeres')} className={`flex-1 p-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'felmeres' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}>
            <ClipboardList size={18} /> FELMÉRÉS
          </button>
          <button onClick={() => setActiveTab('tervezes')} className={`flex-1 p-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'tervezes' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}>
            <LayoutDashboard size={18} /> TERVEZÉS
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        
        {activeTab === 'felmeres' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* LiDAR */}
            <div className="bg-[#1e1b4b] p-5 rounded-[2rem] text-white shadow-xl border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-3"><Box size={18} /><p className="text-xs font-black uppercase tracking-widest">LiDAR Import</p></div>
              <textarea placeholder="Illeszd be az adatokat..." className="w-full bg-[#312e81]/40 p-4 rounded-2xl text-xs outline-none h-20 resize-none" value={lidarInput} onChange={(e) => setLidarInput(e.target.value)} />
            </div>

            {/* Ügyfél Adatok */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 mb-2 text-blue-600 font-black uppercase tracking-widest text-xs"><User size={18} /> Ügyfél & Helyszín</div>
              <input placeholder="Megrendelő neve" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100" onChange={e => setCustomer({...customer, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Születési adatok" className="p-4 bg-slate-50 rounded-2xl text-xs border border-slate-100" onChange={e => setCustomer({...customer, birthPlaceDate: e.target.value})} />
                <input placeholder="Adószám" className="p-4 bg-slate-50 rounded-2xl text-xs border border-slate-100 font-mono" onChange={e => setCustomer({...customer, taxId: e.target.value})} />
              </div>
              <input placeholder="Lakcím" className="w-full p-4 bg-slate-50 rounded-2xl text-xs border border-slate-100" onChange={e => setCustomer({...customer, address: e.target.value})} />
              <div className="pt-2 border-t border-slate-50 grid grid-cols-3 gap-3">
                <input placeholder="Hrsz." className="col-span-1 p-4 bg-blue-50/50 rounded-2xl text-xs font-bold border border-blue-100" onChange={e => setCustomer({...customer, locationId: e.target.value})} />
                <input placeholder="Munkavégzés címe" className="col-span-2 p-4 bg-blue-50/50 rounded-2xl text-xs font-bold border border-blue-100" onChange={e => setCustomer({...customer, location: e.target.value})} />
              </div>
            </div>

            {/* Tételek */}
            {items.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
                <select onChange={(e) => updateItemTask(index, e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-sm font-bold border border-slate-200 outline-none appearance-none">
                  <option value="">Válassz munkanemet...</option>
                  {munkanemek.map((m, i) => <option key={i} value={m.label}>{m.label}</option>)}
                </select>
                <div className="flex justify-between items-end gap-4 border-t border-slate-50 pt-4">
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Mennyiség ({item.unit || 'm2'})</p>
                    <input type="number" className="w-full p-4 bg-slate-100 rounded-2xl font-black text-xl outline-none" onChange={e => {
                      const newItems = [...items];
                      newItems[index].qty = parseFloat(e.target.value) || 0;
                      setItems(newItems);
                    }} />
                  </div>
                  <p className="text-2xl font-black text-blue-600 tracking-tighter">{Math.round((item.workPrice + item.materialPrice) * item.qty).toLocaleString()} Ft</p>
                </div>
              </div>
            ))}
            <button onClick={() => setItems([...items, { task: '', qty: 0, unit: '', workPrice: 0, materialPrice: 0, materials: [], norma: 0 }])} className="w-full p-5 border-4 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black">+ ÚJ TÉTEL</button>
          </div>
        )}

        {activeTab === 'tervezes' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {/* Pénzügyek */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-black uppercase tracking-widest text-xs"><Receipt size={18} className="text-emerald-500" /> Költségösszesítő (Nettó)</div>
              <div className="space-y-3">
                <div className="flex justify-between p-4 bg-blue-50 rounded-2xl"><span className="text-xs font-bold text-blue-900 uppercase">Munkadíj</span><span className="font-black text-blue-600">{Math.round(totalNetWork).toLocaleString()} Ft</span></div>
                <div className="flex justify-between p-4 bg-emerald-50 rounded-2xl"><span className="text-xs font-bold text-emerald-900 uppercase">Anyagdíj</span><span className="font-black text-emerald-600">{Math.round(totalNetMaterial).toLocaleString()} Ft</span></div>
              </div>
            </div>

            {/* Fizetési Ütemezés */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-black uppercase tracking-widest text-xs"><CreditCard size={18} className="text-amber-500" /> Fizetési Ütemezés (Bruttó)</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span>30% Előleg</span><span className="font-bold">{Math.round(brutton * 0.3).toLocaleString()} Ft</span></div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span>40% Részlet</span><span className="font-bold">{Math.round(brutton * 0.4).toLocaleString()} Ft</span></div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl border-l-4 border-amber-400"><span>30% Végszámla</span><span className="font-bold">{Math.round(brutton * 0.3).toLocaleString()} Ft</span></div>
              </div>
            </div>

            {/* Időgazdálkodás */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 opacity-80 mb-4"><Clock size={18} /><p className="text-xs font-black uppercase tracking-[0.2em]">Időgazdálkodás</p></div>
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div><p className="text-[10px] font-bold uppercase opacity-60 mb-1">Munkaóra</p><p className="text-4xl font-black">{totalHours.toFixed(1)}</p></div>
                  <div><p className="text-[10px] font-bold uppercase opacity-60 mb-1">Munkanap</p><p className="text-4xl font-black">{workDays}</p></div>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                  <Users size={18} /><input type="range" min="1" max="10" value={workers} onChange={(e) => setWorkers(parseInt(e.target.value))} className="flex-1 accent-white" />
                  <span className="text-xl font-black">{workers} fő</span>
                </div>
              </div>
              <Calendar size={120} className="absolute -right-8 -top-8 opacity-10 rotate-12" />
            </div>

            {/* Anyaglista */}
            <div className="bg-[#0f172a] p-8 rounded-[3rem] text-white shadow-2xl border-b-[10px] border-emerald-500">
               <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6">Összesített Anyagszükséglet</h3>
               <div className="space-y-3">
                  {getAggregatedMaterials().map((m, i) => (
                    <div key={i} className="flex justify-between text-sm border-b border-slate-800 pb-2">
                      <span className="opacity-70">{m.name}</span>
                      <span className="font-bold text-emerald-400">{m.qty.toFixed(2)} {m.unit}</span>
                    </div>
                  ))}
               </div>
            </div>

            <button onClick={generatePDF} className="w-full bg-blue-600 text-white p-6 rounded-[2.5rem] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
               <FileText size={24} /> SZERZŐDÉS GENERÁLÁSA (PDF)
            </button>
          </div>
        )}

        {/* Bruttó Összesítő */}
        <div className="bg-[#0f172a] text-white p-8 rounded-[3rem] shadow-2xl border-b-[10px] border-blue-600 flex justify-between items-center sticky bottom-4 z-40">
          <div><p className="text-[10px] font-black text-blue-400 uppercase mb-1">Bruttó Fizetendő</p><span className="text-4xl font-black text-emerald-400 tracking-tighter tabular-nums">{Math.round(brutton).toLocaleString()} Ft</span></div>
          <div className="text-right"><p className="text-[10px] font-bold opacity-40 uppercase">27% ÁFA Tartalom</p><p className="font-bold text-sm text-slate-300">Nettó: {Math.round(totalNetOverall).toLocaleString()} Ft</p></div>
        </div>
      </div>
    </div>
  );
}
