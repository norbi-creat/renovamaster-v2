'use client';
import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, FileText, ArrowLeft, Loader2, Search, HardHat } from 'lucide-react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function MunkalapPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [fullArlista, setFullArlista] = useState<any[]>([]);
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([{ group: '', task: '', qty: 1, unit: 'm2', price: 0 }]);

  const REZSIORADIJ = 9250;

  // TERC Főcsoportok meghatározása
  const focsoportok = [
    { id: '11', name: '11 - Irtás, földmunka' },
    { id: '21', name: '21 - Kőművesmunkák' },
    { id: '22', name: '22 - Betonozás' },
    { id: '33', name: '33 - Szigetelések' },
    { id: '45', name: '45 - Épületasztalos munka' },
    { id: '47', name: '47 - Lakatos munka' },
    { id: '48', name: '48 - Tetőfedés' },
    { id: '75', name: '75 - Festés, mázolás' }
  ];

  useEffect(() => {
    const sheetId = "1QDkPgvvPx7wwTKlvoDLLwIWlY1z6ladQtoRynOYsHa4";
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=249861285`;
    
    fetch(url)
      .then(res => res.text())
      .then(csvText => {
        const rows = csvText.split('\n').map(row => row.split('","').map(cell => cell.replace(/"/g, '')));
        const parsed = rows.slice(1).map(r => ({
          code: r[0], // A oszlop: TERC kód
          label: r[1], // B oszlop: Megnevezés
          price: parseInt(r[5]) || 0, // F oszlop: Pufferelt ár
          unit: r[2] || 'm2' // C oszlop: Egység
        })).filter(i => i.label);
        setFullArlista(parsed);
      });
  }, []);

  const addItem = () => setItems([...items, { group: '', task: '', qty: 1, unit: 'm2', price: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const updateItemTask = (index: number, taskLabel: string) => {
    const found = fullArlista.find(a => a.label === taskLabel);
    const newItems = [...items];
    if (found) {
      newItems[index] = { ...newItems[index], task: taskLabel, price: found.price, unit: found.unit };
      setItems(newItems);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const generatePDF = async () => {
    setIsGenerating(true);
    const doc = new jsPDF() as any;
    const today = new Date().toLocaleDateString('hu-HU');

    doc.setFontSize(20);
    doc.text("MUNKALAP / ÁRAJÁNLAT", 14, 20);
    doc.setFontSize(10);
    doc.text(`Megrendelő: ${clientName}`, 14, 30);
    doc.text(`Cím: ${address}`, 14, 35);
    doc.text(`Rezsióradíj: ${REZSIORADIJ} Ft/óra`, 14, 40);

    const tableData = items.map(i => [
      i.task, 
      i.qty, 
      i.unit, 
      new Intl.NumberFormat('hu-HU').format(i.price) + " Ft",
      new Intl.NumberFormat('hu-HU').format(i.price * i.qty) + " Ft"
    ]);

    doc.autoTable({
      startY: 50,
      head: [['Munkanem megnevezése', 'Menny.', 'Egs.', 'Egységár', 'Összesen']],
      body: tableData,
      foot: [['', '', '', 'Végösszeg:', new Intl.NumberFormat('hu-HU').format(totalAmount) + " Ft"]],
      theme: 'striped',
      headStyles: { fillColor: [31, 41, 55] }
    });

    const pdfBase64 = doc.output('datauristring');
    await fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfBase64, date: today, taskName: `Munkalap - ${clientName}` }),
    });

    doc.save(`Munkalap_${clientName}.pdf`);
    setIsGenerating(false);
    alert("Munkalap elküldve!");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-32 font-sans">
      <button onClick={() => router.push('/')} className="mb-4 flex items-center gap-2 text-slate-500 font-bold underline"><ArrowLeft size={18}/> Vissza a főmenübe</button>
      
      <div className="max-w-md mx-auto space-y-4">
        <header className="bg-slate-800 p-6 rounded-3xl text-white shadow-xl flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl"><HardHat size={24}/></div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">TERC Kalkulátor</h1>
            <p className="text-[10px] opacity-70 italic text-blue-300">Rezsióradíj: {REZSIORADIJ} Ft</p>
          </div>
        </header>

        <div className="bg-white p-5 rounded-3xl shadow-sm space-y-3">
          <input placeholder="Ügyfél neve" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Helyszín" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none text-slate-600 focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 relative animate-in fade-in zoom-in duration-200">
              {/* FŐCSOPORT VÁLASZTÓ */}
              <label className="text-[10px] font-black uppercase text-blue-600 mb-2 block tracking-widest">1. Főcsoport választása</label>
              <select 
                value={item.group} 
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index].group = e.target.value;
                  newItems[index].task = ''; // Reset task if group changes
                  setItems(newItems);
                }}
                className="w-full p-3 bg-slate-50 rounded-xl border-none mb-4 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-200"
              >
                <option value="">-- Válasszon szakágat --</option>
                {focsoportok.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>

              {/* MUNKANEM VÁLASZTÓ (Csak ha van főcsoport) */}
              {item.group && (
                <>
                  <label className="text-[10px] font-black uppercase text-emerald-600 mb-2 block tracking-widest">2. Munkanem (TERC norma)</label>
                  <select 
                    value={item.task} 
                    onChange={(e) => updateItemTask(index, e.target.value)}
                    className="w-full p-3 bg-emerald-50 rounded-xl border-none mb-4 text-sm font-medium text-slate-800 outline-none ring-1 ring-emerald-200"
                  >
                    <option value="">-- Válasszon munkanemet --</option>
                    {fullArlista
                      .filter(a => a.code.startsWith(item.group))
                      .map((a, i) => <option key={i} value={a.label}>{a.code} - {a.label}</option>)}
                  </select>
                </>
              )}

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Mennyiség ({item.unit})</label>
                  <input type="number" value={item.qty} onChange={e => {
                    const newItems = [...items];
                    newItems[index].qty = parseFloat(e.target.value) || 0;
                    setItems(newItems);
                  }} className="w-full p-3 bg-slate-100 rounded-xl border-none text-sm font-black outline-none" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Részösszeg</p>
                  <p className="text-lg font-black text-slate-800">{new Intl.NumberFormat('hu-HU').format(item.price * item.qty)} Ft</p>
                </div>
              </div>

              {items.length > 1 && (
                <button onClick={() => removeItem(index)} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg active:scale-90 transition-all"><Trash2 size={16}/></button>
              )}
            </div>
          ))}
        </div>

        <button onClick={addItem} className="w-full p-4 border-2 border-dashed border-slate-300 rounded-3xl text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-white transition-all active:scale-95"><Plus size={20}/> Új tétel hozzáadása</button>

        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ClipboardList size={80}/></div>
          <div className="text-xs opacity-60 uppercase font-black tracking-widest mb-1">Várható ajánlati ár</div>
          <div className="text-3xl font-black text-blue-400">{new Intl.NumberFormat('hu-HU').format(totalAmount)} Ft</div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 z-50">
        <button onClick={generatePDF} disabled={isGenerating} className="w-full bg-blue-600 text-white h-16 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-all">
          {isGenerating ? <Loader2 className="animate-spin" /> : <><FileText size={20} /> Munkalap Generálása</>}
        </button>
      </div>
    </div>
  );
}
