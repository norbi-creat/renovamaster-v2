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
  
  // FIX VÁLLALKOZÓI ADATOK
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

  // ADATOK BETÖLTÉSE GOOGLE SHEETS-BŐL
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

  // --- PDF GENERÁLÁS (MINTA ALAPJÁN) ---
  const generatePDF = () => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('hu-HU');
    
    // Alapértelmezett betűtípus beállítása a magyar ékezetekhez
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("VÁLLALKOZÁSI SZERZŐDÉS", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text("amely létrejött egyrészről", 20, 30);
    
    // Megrendelő táblázat - Keret nélkül, tiszta igazítással
    (doc as any).autoTable({
      startY: 32,
      body: [
        ['Név:', customer.name || '...........................................'],
        ['Születési hely/idő:', customer.birthPlaceDate || '...........................................'],
        ['Lakóhelye:', customer.address || '...........................................'],
        ['Adóazonosító jele:', customer.taxId || '...........................................']
      ],
      theme: 'plain',
      styles: { font: "times", fontSize: 10, cellPadding: 1 },
      columnStyles: { 0: { cellWidth: 40 } }
    });

    const nextY = (doc as any).lastAutoTable.finalY + 8;
    doc.text("(a továbbiakban: Megrendelő), másrészről", 20, nextY);
    
    // Vállalkozó táblázat
    (doc as any).autoTable({
      startY: nextY + 2,
      body: [
        ['Cég neve:', provider.name],
        ['Cégjegyzékszám:', provider.regId],
        ['Székhelye:', provider.address],
        ['Adószáma:', provider.taxId]
      ],
      theme: 'plain',
      styles: { font: "times", fontSize: 10, cellPadding: 1 },
      columnStyles: { 0: { cellWidth: 40 } }
    });

    const vY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont("times", "bold");
    doc.text("mint vállalkozó (a továbbiakban: Vállalkozó) között az alábbi ingatlan", 20, vY);
    doc.setFont("times", "normal");
    doc.text(`Helyrajzi szám: ${customer.locationId || '...........'}  Cím: ${customer.location || '...........'}`, 20, vY + 7);
    
    const bodyText = `felújítási munkáinak elvégzésére. A Vállalkozó vállalja a jelen szerződés 1. számú mellékletében részletezett munkálatok teljesítését a mellékletben meghatározott díj ellenében. Jelen szerződésben nem szabályozott kérdésekben a Polgári Törvénykönyv (2013. évi V. törvény) az irányadó.`;
    const splitBody = doc.splitTextToSize(bodyText, 170);
    doc.text(splitBody, 20, vY + 15);

    const signY = vY + 75;
    doc.text("Dátum: " + now, 20, signY);
    doc.line(20, signY + 20, 80, signY + 20); doc.text("Megrendelő", 40, signY + 25);
    doc.line(130, signY + 20, 190, signY + 20); doc.text("Vállalkozó (Kaheliszto Kft.)", 140, signY + 25);

    // 2. OLDAL: KÖLTSÉGVETÉS
    doc.addPage();
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("1. SZÁMÚ MELLÉKLET - RÉSZLETES KÖLTSÉGVETÉS", 105, 20, { align: "center" });
    
    const tableData = items.filter(i => i.task).map(i => [
      i.task,
      `${Math.round(i.materialPrice * i.qty).toLocaleString()} Ft`,
      `${Math.round(i.workPrice * i.qty).toLocaleString()} Ft`,
      `${Math.round((i.workPrice + i.materialPrice) * i.qty).toLocaleString()} Ft`
    ]);

    (doc as any).autoTable({
      startY: 30,
      head: [['Megnevezés', 'Anyagköltség', 'Munkadíj', 'Nettó Össz.']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], font: "times", fontStyle: 'bold' },
      styles: { font: "times", fontSize: 9 }
    });

    const fY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Nettó Mindösszesen: ${Math.round(totalNetOverall).toLocaleString()} Ft`, 120, fY);
    doc.text(`ÁFA (27%): ${Math.round(vat).toLocaleString()} Ft`, 120, fY + 7);
    doc.setFontSize(11);
    doc.setFont("times", "bold");
    doc.text(`BRUTTÓ VÉGÖSSZEG: ${Math.round(brutton).toLocaleString()} Ft`, 120, fY + 16);

    doc.setFontSize(10);
    doc.text("FIZETÉSI ÜTEMEZÉS:", 20, fY + 35);
    doc.setFont("times", "normal");
    const schedule = [
      `1. Előleg (30%): ${Math.round(brutton * 0.3).toLocaleString()} Ft`,
      `2. Részszámla (40%): ${Math.round(brutton * 0.4).toLocaleString()} Ft`,
      `3. Végszámla (30%): ${Math.round(brutton * 0.3).toLocaleString()} Ft`
    ];
    doc.text(schedule, 20, fY + 42);

    doc.save(`Szerzodes_Kaheliszto_${customer.name || 'projekt'}.pdf`);
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
        
        {/* --- FELMÉRÉS FÜL --- */}
        {activeTab === 'felmeres' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* LiDAR Import */}
            <div className="bg-[#1e1b4b] p-5 rounded-[2rem] text-white shadow-xl border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-3"><Box size={18} /><p className="text-xs font-black uppercase tracking-widest text-indigo-300">LiDAR Adat Import</p></div>
              <textarea placeholder="Másold ide a LiDAR adatokat..." className="w-full bg-[#312e81]/40 p-4 rounded-2xl text-xs outline-none border border-indigo-400/20 h-20 resize-none" value={lidarInput} onChange={(e) => setLidarInput(e.target.value)} />
            </div>

            {/* Ügyfél adatok */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 mb-2 text-blue-600 font-black uppercase tracking-widest text-xs"><User size={18} /> Ügyfél Információk</div>
              <input placeholder="Megrendelő teljes neve" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100" onChange={e => setCustomer({...customer, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Születési adatok" className="p-4 bg-slate-50 rounded-2xl text-xs border border-slate-100" onChange={e => setCustomer({...customer, birthPlaceDate: e.target.value})} />
                <input placeholder="Adóazonosító jel" className="p-4 bg-slate-50 rounded-2xl text-xs border border-slate-100 font-mono" onChange={e => setCustomer({...customer, taxId: e.target.value})} />
              </div>
              <input placeholder="Bejelentett lakcím" className="w-full p-4 bg-slate-50 rounded-2xl text-xs border border-slate-100" onChange={e => setCustomer({...customer, address: e.target.value})} />
              <div className="pt-2 border-t border-slate-50 grid grid-cols-3 gap-3">
                <input placeholder="Hrsz." className="col-span-1 p-4 bg-blue-50/50 rounded-2xl text-xs font-bold border border-blue-100 text-blue-700" onChange={e => setCustomer({...customer, locationId: e.target.value})} />
                <input placeholder="Kivitelezés pontos címe" className="col-span-2 p-4 bg-blue-50/50 rounded-2xl text-xs font-bold border border-blue-100 text-blue-700" onChange={e => setCustomer({...customer, location: e.target.value})} />
              </div>
            </div>

            {/* Tételek */}
            {items.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
                <select onChange={(e) => updateItemTask(index, e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-sm font-bold border border-slate-200 outline-none">
                  <option value="">Válassz munkanemet...</option>
                  {munkanemek.map((m, i) => <option key={i} value={m.label}>{m.label}</option>)}
                </select>
                <div className="flex justify-between items-end gap-4 border-t border-slate-50 pt-4">
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 italic">Mennyiség ({item.unit || 'm2'})</p>
                    <input type="number" className="w-full p-4 bg-slate-100 rounded-2xl font-black text-xl outline-none text-slate-700" onChange={e => {
                      const newItems = [...items];
                      newItems[index].qty = parseFloat(e.target.value) || 0;
                      setItems(newItems);
                    }} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sor összesen</p>
                    <p className="text-2xl font-black text-blue-600 tracking-tighter tabular-nums">{Math.round((item.workPrice + item.materialPrice) * item.qty).toLocaleString()} Ft</p>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setItems([...items, { task: '', qty: 0, unit: '', workPrice: 0, materialPrice: 0, materials: [], norma: 0 }])} className="w-full p-5 border-4 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black hover:border-blue-200 hover:text-blue-400 transition-all">+ ÚJ TÉTEL HOZZÁADÁSA</button>
          </div>
        )}

        {/* --- TERVEZÉS FÜL --- */}
        {activeTab === 'tervezes' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {/* Pénzügyi Bontás */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-black uppercase tracking-widest text-xs"><Receipt size={18} className="text-emerald-500" /> Költségmegoszlás (Nettó)</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                  <div className="flex items-center gap-3"><Hammer size={18} className="text-blue-500" /><span className="text-xs font-bold text-blue-900 uppercase">Munkadíj</span></div>
                  <span className="font-black text-blue-600">{Math.round(totalNetWork).toLocaleString()} Ft</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                  <div className="flex items-center gap-3"><Wallet size={18} className="text-emerald-500" /><span className="text-xs font-bold text-emerald-900 uppercase">Anyagdíj</span></div>
                  <span className="font-black text-emerald-600">{Math.round(totalNetMaterial).toLocaleString()} Ft</span>
                </div>
              </div>
            </div>

            {/* Fizetési Ütemezés */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-black uppercase tracking-widest text-xs"><CreditCard size={18} className="text-amber-500" /> Ütemezett Kifizetések (Bruttó)</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs p-3 bg-slate-50 rounded-xl"><span>1. Előleg (30%)</span><span className="font-bold">{Math.round(brutton * 0.3).toLocaleString()} Ft</span></div>
                <div className="flex justify-between text-xs p-3 bg-slate-50 rounded-xl"><span>2. Részszámla (40%)</span><span className="font-bold">{Math.round(brutton * 0.4).toLocaleString()} Ft</span></div>
                <div className="flex justify-between text-xs p-3 bg-slate-50 rounded-xl border-l-4 border-amber-400"><span>3. Végszámla (30%)</span><span className="font-bold">{Math.round(brutton * 0.3).toLocaleString()} Ft</span></div>
              </div>
            </div>

            {/* Időterv */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 opacity-80 mb-4"><Clock size={18} /><p className="text-xs font-black uppercase tracking-[0.2em]">Kivitelezési idő</p></div>
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div><p className="text-[10px] font-bold uppercase opacity-60 mb-1">Teljes munkaóra</p><p className="text-4xl font-black">{totalHours.toFixed(1)}</p></div>
                  <div><p className="text-[10px] font-bold uppercase opacity-60 mb-1">Munkanapok</p><p className="text-4xl font-black">{workDays}</p></div>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                  <Users size={18} /><input type="range" min="1" max="12" value={workers} onChange={(e) => setWorkers(parseInt(e.target.value))} className="flex-1 accent-white" />
                  <span className="text-xl font-black">{workers} fő</span>
                </div>
              </div>
              <Calendar size={120} className="absolute -right-8 -top-8 opacity-10 rotate-12" />
            </div>

            {/* Anyagkigyűjtés */}
            <div className="bg-[#0f172a] p-8 rounded-[3rem] text-white shadow-2xl border-b-[10px] border-emerald-500">
               <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6 underline underline-offset-8 decoration-emerald-500/30">Anyagszükséglet Összesítve</h3>
               <div className="space-y-3">
                  {getAggregatedMaterials().map((m, i) => (
                    <div key={i} className="flex justify-between text-sm border-b border-slate-800 pb-2">
                      <span className="opacity-70">{m.name}</span>
                      <span className="font-bold text-emerald-400">{m.qty.toFixed(2)} {m.unit}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Szerződés generálás gomb */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 italic">Hivatalos Dokumentum</p>
                <button onClick={generatePDF} className="w-full bg-blue-600 text-white p-6 rounded-[2.5rem] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-blue-700">
                  <FileText size={24} /> PDF SZERZŐDÉS GENERÁLÁSA
                </button>
                <p className="text-[9px] text-slate-400 mt-4 italic">Kétoldalas PDF: Vállalkozási Szerződés + 1. sz. Melléklet (Költségvetés)</p>
            </div>
          </div>
        )}

        {/* --- FIX BRUTTÓ ÖSSZESÍTŐ (VÉGIG LÁTSZIK) --- */}
        <div className="bg-[#0f172a] text-white p-8 rounded-[3rem] shadow-2xl border-b-[10px] border-blue-600 flex justify-between items-center sticky bottom-4 z-40 mx-2">
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 italic">Végösszeg (Bruttó)</p>
            <span className="text-4xl font-black text-emerald-400 tracking-tighter tabular-nums">
              {Math.round(brutton).toLocaleString()} Ft
            </span>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold opacity-40 uppercase">Nettó + ÁFA</p>
             <p className="font-bold text-sm text-slate-300 italic">{Math.round(totalNetOverall).toLocaleString()} Ft + ÁFA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
