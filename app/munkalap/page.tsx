'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, ArrowLeft, Loader2, Info, Calculator, User, MapPin, Hash, Box } from 'lucide-react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function FelmeroMunkalapPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [munkanemek, setMunkanemek] = useState<any[]>([]);
  const [receptek, setReceptek] = useState<any[]>([]);
  const [lidarInput, setLidarInput] = useState(""); // LiDAR adat fogadása
  
  const [customer, setCustomer] = useState({
    name: '', address: '', taxId: '', location: '',
    projectId: `PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const [items, setItems] = useState([{ group: '', task: '', qty: 1, unit: '', workPrice: 0, materialPrice: 0, receptDetails: [] }]);

  const REZSIORADIJ = 9250;

  // Főcsoportok elnevezése
  const focsoportok = [
    { id: '11', name: '11 - Irtás, földmunka' },
    { id: '21', name: '21 - Kőművesmunkák' },
    { id: '22', name: '22 - Betonozás' },
    { id: '33', name: '33 - Szigetelések' },
    { id: '45', name: '45 - Épületasztalos munka' },
    { id: '47', name: '47 - Lakatos munka' },
    { id: '48', name: '48 - Tetőfedés' },
    { id: '75', name: '75 - Festés, mázolás' },
    { id: 'AZ', name: 'AZ - Állványozás' }
  ];

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

      const rRows = rCsv.split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^**"]*){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
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

  const generatePDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("FELMÉRŐ MUNKALAP", 105, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.text(`Projekt ID: ${customer.projectId}`, 14, 35);
      doc.text(`Ügyfél: ${customer.name}`, 14, 42);
      doc.text(`Helyszín: ${customer.location}`, 14, 49);
      doc.text(`Dátum: ${new Date().toLocaleDateString('hu-HU')}`, 14, 56);

      const tableData = items.map(item => [
        item.task,
        item.qty + " " + item.unit,
        Math.round(item.workPrice + item.materialPrice).toLocaleString() + " Ft",
        Math.round((item.workPrice + item.materialPrice) * item.qty).toLocaleString() + " Ft"
      ]);

      (doc as any).autoTable({
        startY: 65,
        head: [['Munka megnevezése', 'Mennyiség', 'Egységár (M+A)', 'Összesen']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59] }
      });

      doc.save(`${customer.projectId}_munkalap.pdf`);
    } catch (e) {
      alert("Hiba a PDF generálásakor!");
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-32">
      <div className="max-w-md mx-auto space-y-4">
        <header className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl flex justify-between items-center border-b-4 border-emerald-500">
          <div>
            <h1 className="text-xl font-black italic">FELMÉRŐ MUNKALAP</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{customer.projectId}</p>
          </div>
          <button onClick={generatePDF} className="bg-emerald-600 p-3 rounded-2xl shadow-lg">
            <FileText size={24} />
          </button>
        </header>

        {/* LiDAR Gyors-beillesztő */}
        <div className="bg-indigo-900 p-4 rounded-3xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 text-indigo-200 text-xs font-bold uppercase">
            <Box size={16} /> LiDAR Adat Import
          </div>
          <textarea 
            placeholder="Illeszd be a LiDAR appból másolt adatokat..."
            className="w-full bg-indigo-800/50 p-3 rounded-xl text-xs outline-none border border-indigo-700 h-16 placeholder:text-indigo-400"
            value={lidarInput}
            onChange={(e) => setLidarInput(e.target.value)}
          />
        </div>

        {/* Ügyfél Adatok */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-3">
          <input placeholder="Megrendelő neve" className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none" onChange={e => setCustomer({...customer, name: e.target.value})} />
          <input placeholder="Kivitelezési helyszín" className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none" onChange={e => setCustomer({...customer, location: e.target.value})} />
        </div>

        {/* Tételek */}
        {items.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-3xl shadow-md border border-slate-200 relative">
            <select 
              value={item.group}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].group = e.target.value;
                setItems(newItems);
              }}
              className="w-full p-3 bg-slate-100 rounded-xl mb-3 text-sm font-bold outline-none ring-1 ring-slate-200"
            >
              <option value="">-- Szakág kiválasztása --</option>
              {focsoportok.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>

            {item.group && (
              <select 
                onChange={(e) => updateItemTask(index, e.target.value)}
                className="w-full p-3 bg-emerald-50 rounded-xl mb-3 text-sm font-semibold outline-none ring-1 ring-emerald-100"
              >
                <option value="">-- Munka megnevezése --</option>
                {munkanemek.filter(m => m.code?.startsWith(item.group)).map((m, i) => (
                  <option key={i} value={m.label}>{m.label}</option>
                ))}
              </select>
            )}

            <div className="flex justify-between items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 mb-1">MENNYISÉG ({item.unit || '?'})</p>
                <input type="number" value={item.qty} onChange={e => {
                  const newItems = [...items];
                  newItems[index].qty = parseFloat(e.target.value) || 0;
                  setItems(newItems);
                }} className="w-full bg-slate-100 p-3 rounded-xl font-black outline-none" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Összeg</p>
                <p className="text-lg font-black text-slate-800">{Math.round((item.workPrice + item.materialPrice) * item.qty).toLocaleString()} Ft</p>
              </div>
            </div>
          </div>
        ))}

        <button onClick={() => setItems([...items, { group: '', task: '', qty: 1, unit: '', workPrice: 0, materialPrice: 0, receptDetails: [] }])} className="w-full p-4 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 font-bold flex items-center justify-center gap-2">
          <Plus size={20}/> Új felmérési sor
        </button>
      </div>
    </div>
  );
}
