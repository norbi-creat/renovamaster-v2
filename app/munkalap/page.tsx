'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, User, MapPin, Hash, Box, Calculator } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function FelmeroMunkalapPage() {
  const [munkanemek, setMunkanemek] = useState<any[]>([]);
  const [receptek, setReceptek] = useState<any[]>([]);
  const [lidarInput, setLidarInput] = useState("");
  
  const [customer, setCustomer] = useState({
    name: '',
    birthPlaceDate: '',
    motherName: '',
    address: '',
    taxId: '',
    location: '',
    projectId: `PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const [items, setItems] = useState([{ 
    group: '', 
    task: '', 
    qty: 0, 
    unit: '', 
    workPrice: 0, 
    materialPrice: 0, 
    materials: [] as any[] 
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
        ...newItems[index], 
        task: taskLabel, 
        workPrice: work.norma * REZSIORADIJ, 
        materialPrice: totalMatNorma * REZSIORADIJ, 
        unit: work.unit,
        materials: relatedMaterials
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
    doc.text("FELMÉRŐ MUNKALAP ÉS ANYAGKIÍRÁS", 105, 15, { align: "center" });

    doc.setFontSize(9);
    doc.text(`Ügyfél neve: ${customer.name}`, 14, 25);
    doc.text(`Lakcím: ${customer.address}`, 14, 30);
    doc.text(`Adóazonosító: ${customer.taxId}`, 14, 35);
    doc.text(`Helyszín: ${customer.location}`, 14, 40);

    const body = items.map(item => [
      item.task,
      `${item.qty} ${item.unit}`,
      `${Math.round(item.workPrice).toLocaleString()} Ft`,
      `${Math.round(item.materialPrice).toLocaleString()} Ft`,
      `${Math.round((item.workPrice + item.materialPrice) * item.qty).toLocaleString()} Ft`
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Megnevezés', 'Mennyiség', 'Munkadíj/egys', 'Anyagdíj/egys', 'Összesen']],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [31, 41, 55] }
    });

    let finalY = (doc as any).lastAutoTable.cursor.y + 10;
    doc.text("RÉSZLETES ANYAGSZÜKSÉGLET:", 14, finalY);
    items.forEach(item => {
      item.materials.forEach(m => {
        finalY += 5;
        doc.text(`- ${m.component}: ${Math.round(m.norma * item.qty * 100) / 100} ${m.unit}`, 20, finalY);
      });
    });

    doc.save(`Munkalap_${customer.name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-xl mx-auto space-y-4">
        {/* FEJLÉC */}
        <div className="bg-slate-900 p-6 rounded-3xl text-white flex justify-between items-center shadow-xl">
          <h1 className="text-xl font-black italic text-blue-400 uppercase">Felmérő Dashboard</h1>
          <button onClick={generatePDF} className="bg-blue-600 p-3 rounded-2xl active:scale-95 transition-all"><FileText /></button>
        </div>

        {/* LIDAR BEMENET KÁRTYA */}
        <div className="bg-indigo-900 p-4 rounded-3xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 text-indigo-200 text-[10px] font-black uppercase tracking-widest">
            <Box size={14} /> LiDAR Adat Beillesztés
          </div>
          <textarea 
            placeholder="Polycam / Canvas export adatok ide..."
            className="w-full bg-indigo-800/50 p-3 rounded-xl text-xs outline-none border border-indigo-700 h-16 placeholder:text-indigo-400"
            value={lidarInput}
            onChange={(e) => setLidarInput(e.target.value)}
          />
        </div>

        {/* ÜGYFÉL ADATOK */}
        <div className="bg-white p-5 rounded-3xl shadow-sm space-y-3 border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Ügyfél adatok</p>
          <input placeholder="Megrendelő teljes neve" className="w-full p-3 bg-slate-50 rounded-xl text-sm" onChange={e => setCustomer({...customer, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Születési hely/idő" className="p-3 bg-slate-50 rounded-xl text-sm" onChange={e => setCustomer({...customer, birthPlaceDate: e.target.value})} />
            <input placeholder="Adóazonosító jel" className="p-3 bg-slate-50 rounded-xl text-sm" onChange={e => setCustomer({...customer, taxId: e.target.value})} />
          </div>
          <input placeholder="Lakóhely (Cím)" className="w-full p-3 bg-slate-50 rounded-xl text-sm" onChange={e => setCustomer({...customer, address: e.target.value})} />
          <input placeholder="Kivitelezési helyszín" className="w-full p-3 bg-blue-50 rounded-xl text-sm font-bold border border-blue-100" onChange={e => setCustomer({...customer, location: e.target.value})} />
        </div>

        {/* TÉTELEK */}
        {items.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-3xl shadow-md border border-slate-200">
            <select onChange={(e) => updateItemTask(index, e.target.value)} className="w-full p-3 bg-slate-100 rounded-xl mb-3 text-sm font-bold">
              <option value="">Válassz munkanemet...</option>
              {munkanemek.map((m, i) => <option key={i} value={m.label}>{m.label}</option>)}
            </select>
            
            <div className="flex gap-4 items-end">
              <div className="w-1/2">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Mennyiség</p>
                <input type="number" className="w-full p-3 bg-slate-50 rounded-xl font-bold" onChange={e => {
                  const newItems = [...items];
                  newItems[index].qty = parseFloat(e.target.value) || 0;
                  setItems(newItems);
                }} />
              </div>
              <div className="w-1/2 text-right">
                <p className="text-[10px] font-bold text-blue-600">Munkadíj: {Math.round(item.workPrice * item.qty).toLocaleString()} Ft</p>
                <p className="text-[10px] font-bold text-emerald-600">Anyagdíj: {Math.round(item.materialPrice * item.qty).toLocaleString()} Ft</p>
              </div>
            </div>
            
            {item.materials.length > 0 && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl text-[10px] text-amber-900 border border-amber-100">
                <strong>Anyagok:</strong> {item.materials.map(m => `${m.component} (${Math.round(m.norma * item.qty * 100)/100} ${m.unit})`).join(', ')}
              </div>
            )}
          </div>
        ))}

        <button onClick={() => setItems([...items, { group: '', task: '', qty: 0, unit: '', workPrice: 0, materialPrice: 0, materials: [] }])} className="w-full p-4 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 font-bold hover:bg-white transition-all">+ Új tétel</button>

        {/* ÖSSZESÍTŐ */}
        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold uppercase opacity-60">Bruttó összesen:</span>
            <span className="text-3xl font-black text-emerald-400">{Math.round((totalNet + vat)).toLocaleString()} Ft</span>
          </div>
        </div>
      </div>
    </div>
  );
}
