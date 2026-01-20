'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, User, MapPin, Hash, Box, Calculator, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function FelmeroMunkalapPage() {
  const [munkanemek, setMunkanemek] = useState<any[]>([]);
  const [receptek, setReceptek] = useState<any[]>([]);
  const [lidarInput, setLidarInput] = useState("");
  
  const [customer, setCustomer] = useState({
    name: '', birthPlaceDate: '', motherName: '', address: '', taxId: '', location: '',
    projectId: `PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const [items, setItems] = useState([{ 
    group: '', task: '', qty: 0, unit: '', workPrice: 0, materialPrice: 0, materials: [] as any[] 
  }]);

  const REZSIORADIJ = 9250;

  useEffect(() => {
    const sheetId = "1QDkPgvvPx7wwTKlvoDLLwIWlY1z6ladQtoRynOYsHa4";
    const munkanemUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=249861285`;
    const receptUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=263045857`;
    
    Promise.all([
      fetch(munkanemUrl).then(res => res.text()),
      fetch(receptUrl).then(res => res.text())
    ]).then(([mCsv, rCsv]) => {
      const mRows = mCsv.split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
      setMunkanemek(mRows.slice(1).map(r => ({ code: r[0], label: r[1], norma: parseFloat(r[2]?.replace(',', '.')) || 0, unit: r[3] })));
      const rRows = rCsv.split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
      setReceptek(rRows.slice(1).map(r => ({ code: r[0], component: r[2], norma: parseFloat(r[3]?.replace(',', '.')) || 0, unit: r[4] })));
    });
  }, []);

  const updateItemTask = (index: number, taskLabel: string) => {
    const work = munkanemek.find(a => a.label === taskLabel);
    if (work) {
      const relatedMaterials = receptek.filter(r => r.code === work.code);
      const totalMatNorma = relatedMaterials.reduce((sum, r) => sum + r.norma, 0);
      const newItems = [...items];
      newItems[index] = { 
        ...newItems[index], task: taskLabel, workPrice: work.norma * REZSIORADIJ, 
        materialPrice: totalMatNorma * REZSIORADIJ, unit: work.unit, materials: relatedMaterials
      };
      setItems(newItems);
    }
  };

  const totalNetWork = items.reduce((sum, i) => sum + (i.workPrice * i.qty), 0);
  const totalNetMat = items.reduce((sum, i) => sum + (i.materialPrice * i.qty), 0);
  const totalNet = totalNetWork + totalNetMat;
  const vat = totalNet * 0.27;

  const generatePDF = () => {
    const doc = new jsPDF() as any;
    doc.setFontSize(18);
    doc.text("FELMÉRŐ MUNKALAP", 105, 15, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Ügyfél: ${customer.name} | Helyszín: ${customer.location}`, 14, 25);
    const body = items.map(item => [item.task, `${item.qty} ${item.unit}`, `${Math.round(item.workPrice * item.qty).toLocaleString()} Ft`, `${Math.round(item.materialPrice * item.qty).toLocaleString()} Ft`, `${Math.round((item.workPrice + item.materialPrice) * item.qty).toLocaleString()} Ft`]);
    doc.autoTable({ startY: 35, head: [['Megnevezés', 'Menny.', 'Munkadíj', 'Anyagdíj', 'Összesen']], body, theme: 'grid', headStyles: { fillColor: [15, 23, 42] } });
    doc.save(`Felmerolap_${customer.name || 'projekt'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans">
      <div className="max-w-xl mx-auto space-y-4">
        <header className="bg-[#0f172a] p-6 rounded-[2rem] text-white flex justify-between items-center shadow-2xl">
          <div><h1 className="text-xl font-black italic tracking-tighter">FELMÉRŐ DASHBOARD</h1><p className="text-[10px] text-blue-300 font-bold uppercase">{customer.projectId}</p></div>
          <button onClick={generatePDF} className="bg-blue-600 p-3 rounded-2xl active:scale-90"><FileText /></button>
        </header>

        {/* LIDAR KÁRTYA */}
        <div className="bg-[#1e1b4b] p-5 rounded-[2rem] text-white shadow-xl border border-indigo-500/30">
          <div className="flex items-center gap-2 mb-3"><Box size={18} className="text-indigo-400" /><p className="text-xs font-black uppercase tracking-widest text-indigo-200">LiDAR Import</p></div>
          <textarea placeholder="Másold ide a LiDAR adatokat..." className="w-full bg-[#312e81]/50 p-4 rounded-2xl text-xs outline-none h-20 placeholder:text-indigo-400/50" value={lidarInput} onChange={(e) => setLidarInput(e.target.value)} />
        </div>

        {/* ÜGYFÉL ADATOK */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl space-y-4 border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Ügyfél adatok</p>
          <input placeholder="Megrendelő teljes neve" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-100 outline-none" onChange={e => setCustomer({...customer, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Születési hely/idő" className="p-4 bg-slate-50 rounded-2xl text-sm border border-slate-100 outline-none" onChange={e => setCustomer({...customer, birthPlaceDate: e.target.value})} />
            <input placeholder="Adóazonosító jel" className="p-4 bg-slate-50 rounded-2xl text-sm border border-slate-100 outline-none" onChange={e => setCustomer({...customer, taxId: e.target.value})} />
          </div>
          <input placeholder="Lakóhely (Cím)" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-100 outline-none" onChange={e => setCustomer({...customer, address: e.target.value})} />
          <input placeholder="Kivitelezési helyszín" className="w-full p-4 bg-blue-50/50 rounded-2xl text-sm font-bold border border-blue-100 outline-none" onChange={e => setCustomer({...customer, location: e.target.value})} />
        </div>

        {/* TÉTELEK */}
        {items.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
            <select onChange={(e) => updateItemTask(index, e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-sm font-bold border border-slate-200 outline-none">
              <option value="">Válassz munkanemet...</option>
              {munkanemek.map((m, i) => <option key={i} value={m.label}>{m.label}</option>)}
            </select>
            {item.materials.length > 0 && (
              <div className="bg-amber-50/50 p-4 rounded-2xl mb-4 border border-amber-100/50 flex items-start gap-3">
                <Info size={16} className="text-amber-500 mt-1" />
                <p className="text-[11px] text-amber-900 leading-relaxed italic"><strong>Összetevők:</strong> {item.materials.map(m => `${m.component}: ${Math.round(m.norma * (item.qty || 1) * 100)/100} ${m.unit}`).join(', ')}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded-2xl text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Munkadíj</p><p className="text-lg font-black">{Math.round(item.workPrice * (item.qty || 1)).toLocaleString()} Ft</p></div>
              <div className="bg-slate-50 p-4 rounded-2xl text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Anyagdíj</p><p className="text-lg font-black text-emerald-600">{Math.round(item.materialPrice * (item.qty || 1)).toLocaleString()} Ft</p></div>
            </div>
            <div className="flex justify-between items-center gap-4">
              <input type="number" placeholder="Mennyiség" className="w-1/2 p-4 bg-slate-100 rounded-2xl font-black text-xl" onChange={e => {
                const newItems = [...items];
                newItems[index].qty = parseFloat(e.target.value) || 0;
                setItems(newItems);
              }} />
              <div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase">Összesen</p><p className="text-2xl font-black text-blue-600 tracking-tighter">{Math.round((item.workPrice + item.materialPrice) * item.qty).toLocaleString()} Ft</p></div>
            </div>
          </div>
        ))}

        <button onClick={() => setItems([...items, { group: '', task: '', qty: 0, unit: '', workPrice: 0, materialPrice: 0, materials: [] }])} className="w-full p-5 border-4 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold">+ Új tétel hozzáadása</button>

        <div className="bg-[#0f172a] text-white p-8 rounded-[3rem] shadow-2xl border-b-8 border-blue-600 flex justify-between items-center">
          <span className="text-sm font-black uppercase text-blue-400">Bruttó fizetendő:</span>
          <span className="text-3xl font-black text-emerald-400">{Math.round((totalNet + vat)).toLocaleString()} Ft</span>
        </div>
      </div>
    </div>
  );
}
