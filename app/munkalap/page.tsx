'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, ArrowLeft, Loader2, Info, Calculator, User, MapPin, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function MunkalapPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [munkanemek, setMunkanemek] = useState<any[]>([]);
  const [receptek, setReceptek] = useState<any[]>([]);
  
  // Ügyfél és Projekt adatok állapota
  const [customer, setCustomer] = useState({
    name: '',
    address: '',
    taxId: '',
    location: '',
    projectId: `PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const [items, setItems] = useState([{ group: '', task: '', qty: 1, unit: '', workPrice: 0, materialPrice: 0, receptDetails: [] }]);

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
      const parsedM = mRows.slice(1).map(r => ({
        code: r[0], label: r[1], norma: parseFloat(r[2]?.replace(',', '.')) || 0, unit: r[3]
      })).filter(i => i.label);

      const rRows = rCsv.split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
      const parsedR = rRows.slice(1).map(r => ({
        code: r[0], component: r[2], norma: parseFloat(r[3]?.replace(',', '.')) || 0, unit: r[4]
      })).filter(r => r.code);

      setMunkanemek(parsedM);
      setReceptek(parsedR);
    });
  }, []);

  const updateItemTask = (index: number, taskLabel: string) => {
    const work = munkanemek.find(a => a.label === taskLabel);
    if (work) {
      const calculatedWorkPrice = work.norma * REZSIORADIJ;
      const relatedR = receptek.filter(r => r.code === work.code);
      let currentMatPrice = 0;
      let details: any = [];

      relatedR.forEach(r => {
        const matPrice = r.norma * REZSIORADIJ;
        currentMatPrice += matPrice;
        details.push(`${r.component}: ${r.norma} ${r.unit}`);
      });

      const newItems = [...items];
      newItems[index] = { 
        ...newItems[index], 
        task: taskLabel, workPrice: calculatedWorkPrice, materialPrice: currentMatPrice, unit: work.unit, receptDetails: details
      };
      setItems(newItems);
    }
  };

  const grandTotal = items.reduce((sum, i) => sum + ((i.workPrice + i.materialPrice) * i.qty), 0);

  const generatePDF = async () => {
    setIsGenerating(true);
    const doc = new jsPDF() as any;
    
    // PDF Fejléc adatokkal
    doc.setFontSize(20);
    doc.text("MUNKALAP", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Projekt azonosító: ${customer.projectId}`, 14, 35);
    doc.text(`Megrendelő: ${customer.name}`, 14, 42);
    doc.text(`Cím: ${customer.address}`, 14, 49);
    doc.text(`Adóazonosító: ${customer.taxId}`, 14, 56);
    doc.text(`Helyszín: ${customer.location}`, 14, 63);
    doc.text(`Dátum: ${new Date().toLocaleDateString('hu-HU')}`, 14, 70);

    const tableData = items.map(item => [
      item.task,
      item.qty + " " + item.unit,
      Math.round(item.workPrice).toLocaleString() + " Ft",
      Math.round(item.materialPrice).toLocaleString() + " Ft",
      Math.round((item.workPrice + item.materialPrice) * item.qty).toLocaleString() + " Ft"
    ]);

    doc.autoTable({
      startY: 80,
      head: [['Megnevezés', 'Menny.', 'Munkadíj/egys.', 'Anyagdíj/egys.', 'Összesen']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.text(`Végösszeg: ${Math.round(grandTotal).toLocaleString()} Ft`, 14, (doc as any).lastAutoTable.cursor.y + 15);
    
    doc.save(`Munkalap_${customer.name || 'general'}.pdf`);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-32">
      <div className="max-w-md mx-auto space-y-4">
        <header className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black italic text-blue-400">MESTER MUNKALAP</h1>
            <p className="text-[10px] opacity-60 uppercase">Projekt: {customer.projectId}</p>
          </div>
          <button onClick={generatePDF} disabled={isGenerating} className="bg-blue-600 p-3 rounded-2xl active:scale-90 transition-all">
            {isGenerating ? <Loader2 className="animate-spin" /> : <FileText size={24} />}
          </button>
        </header>

        {/* Ügyfél és Helyszín Kártya */}
        <div className="bg-white p-5 rounded-3xl shadow-md border border-slate-200 space-y-3">
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
            <User size={18} className="text-blue-500" />
            <input placeholder="Megrendelő neve" className="bg-transparent w-full text-sm font-bold outline-none" 
                   onChange={e => setCustomer({...customer, name: e.target.value})} />
          </div>
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
            <MapPin size={18} className="text-blue-500" />
            <input placeholder="Lakcím / Székhely" className="bg-transparent w-full text-sm outline-none"
                   onChange={e => setCustomer({...customer, address: e.target.value})} />
          </div>
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
            <Hash size={18} className="text-blue-500" />
            <input placeholder="Adóazonosító jel" className="bg-transparent w-full text-sm outline-none"
                   onChange={e => setCustomer({...customer, taxId: e.target.value})} />
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 font-bold text-xs text-slate-400 uppercase">Kivitelezési helyszín</div>
          <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-2xl ring-1 ring-blue-100">
            <MapPin size={18} className="text-blue-600" />
            <input placeholder="Helyszín címe" className="bg-transparent w-full text-sm font-bold text-blue-900 outline-none"
                   onChange={e => setCustomer({...customer, location: e.target.value})} />
          </div>
        </div>

        {/* Tételek listája - A már meglévő TERC logika szerint */}
        {items.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-3xl shadow-lg border border-slate-200 relative">
            <select 
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].group = e.target.value;
                setItems(newItems);
              }}
              className="w-full p-3 bg-slate-50 rounded-xl mb-3 text-sm font-bold outline-none"
            >
              <option value="">-- Főcsoport választása --</option>
              {['11','21','22','33','47','45','48','75','AZ'].map(code => (
                <option key={code} value={code}>{code} - Főcsoport</option>
              ))}
            </select>

            {item.group && (
              <select 
                onChange={(e) => updateItemTask(index, e.target.value)}
                className="w-full p-3 bg-blue-50 rounded-xl mb-3 text-sm font-semibold outline-none ring-1 ring-blue-100"
              >
                <option value="">-- Munkanem választása --</option>
                {munkanemek.filter(m => m.code?.startsWith(item.group)).map((m, i) => (
                  <option key={i} value={m.label}>{m.label}</option>
                ))}
              </select>
            )}

            {item.receptDetails.length > 0 && (
              <div className="bg-amber-50 p-3 rounded-xl mb-3 text-[10px] text-amber-800">
                <strong>Anyagszükséglet:</strong> {item.receptDetails.join(', ')}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-slate-50 p-2 rounded-xl text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Munkadíj</p>
                <p className="font-black">{Math.round(item.workPrice).toLocaleString()} Ft</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Anyagdíj</p>
                <p className="font-black text-emerald-600">{Math.round(item.materialPrice).toLocaleString()} Ft</p>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <input type="number" value={item.qty} onChange={e => {
                const newItems = [...items];
                newItems[index].qty = parseFloat(e.target.value) || 0;
                setItems(newItems);
              }} className="w-20 bg-slate-100 p-2 rounded-lg font-black text-center" />
              <div className="text-right">
                <p className="text-[18px] font-black text-blue-600">
                  {Math.round((item.workPrice + item.materialPrice) * item.qty).toLocaleString()} Ft
                </p>
              </div>
              {items.length > 1 && (
                <button onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-red-400 p-2">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}

        <button onClick={() => setItems([...items, { group: '', task: '', qty: 1, unit: '', workPrice: 0, materialPrice: 0, receptDetails: [] }])} className="w-full p-4 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 font-bold flex items-center justify-center gap-2">
          <Plus size={20}/> Új sor hozzáadása
        </button>

        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl">
          <p className="text-xs opacity-50 uppercase text-center mb-1">Mindösszesen Bruttó</p>
          <p className="text-4xl font-black text-emerald-400 text-center">
            {Math.round(grandTotal).toLocaleString()} Ft
          </p>
        </div>
      </div>
    </div>
  );
}
