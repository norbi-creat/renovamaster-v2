'use client';
import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, FileText, ArrowLeft, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function MunkalapPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [arlista, setArlista] = useState<any[]>([]);
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([{ task: '', qty: 1, unit: 'm2', price: 0 }]);

  // Google Sheets adatok beolvasása (CSV formátumban a leggyorsabb)
  useEffect(() => {
    const sheetId = "1QDkPgvvPx7wwTKlvoDLLwIWlY1z6ladQtoRynOYsHa4";
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=249861285`;
    
    fetch(url)
      .then(res => res.text())
      .then(csvText => {
        // Egyszerű CSV parzoló: sorokra bontás, majd oszlopokra
        const rows = csvText.split('\n').map(row => row.split('","').map(cell => cell.replace(/"/g, '')));
        // A táblázatod alapján: A oszlop (Név), F oszlop (Pufferelt ár)
        const parsed = rows.slice(1).map(r => ({
          label: r[0], // Munkanem neve
          price: parseInt(r[5]) || 0, // F oszlop az ár
          unit: r[1] || 'm2' // B oszlop az egység
        })).filter(i => i.label);
        setArlista(parsed);
      });
  }, []);

  const addItem = () => setItems([...items, { task: '', qty: 1, unit: 'm2', price: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const updateItemTask = (index: number, label: string) => {
    const found = arlista.find(a => a.label === label);
    const newItems = [...items];
    newItems[index] = { 
      task: label, 
      price: found ? found.price : 0, 
      unit: found ? found.unit : 'm2',
      qty: newItems[index].qty 
    };
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const generatePDF = async () => {
    setIsGenerating(true);
    const doc = new jsPDF() as any;
    const today = new Date().toLocaleDateString('hu-HU');

    // Fejléc
    doc.setFontSize(20);
    doc.text("MUNKALAP / AJÁNLAT", 14, 20);
    doc.setFontSize(10);
    doc.text(`Ügyfél: ${clientName}`, 14, 30);
    doc.text(`Helyszín: ${address}`, 14, 35);
    doc.text(`Dátum: ${today}`, 14, 40);

    // TÁBLÁZAT GENERÁLÁSA
    const tableData = items.map(i => [
      i.task, 
      i.qty, 
      i.unit, 
      new Intl.NumberFormat('hu-HU').format(i.price) + " Ft",
      new Intl.NumberFormat('hu-HU').format(i.price * i.qty) + " Ft"
    ]);

    doc.autoTable({
      startY: 50,
      head: [['Munkanem', 'Menny.', 'Egys.', 'Egységár', 'Összesen']],
      body: tableData,
      foot: [['', '', '', 'Végösszeg:', new Intl.NumberFormat('hu-HU').format(totalAmount) + " Ft"]],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] } // Emerald zöld
    });

    const pdfBase64 = doc.output('datauristring');
    await fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfBase64, date: today, taskName: `Munkalap - ${clientName}` }),
    });

    doc.save(`Munkalap_${clientName}.pdf`);
    setIsGenerating(false);
    alert("Sikeresen elküldve!");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-32 font-sans text-slate-900">
      <button onClick={() => router.push('/')} className="mb-4 flex items-center gap-2 text-slate-500 font-bold"><ArrowLeft size={20}/> Vissza</button>
      
      <div className="max-w-md mx-auto space-y-4">
        <header className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg">
          <h1 className="text-xl font-black uppercase tracking-tight italic">Mester Munkalap</h1>
          <p className="text-xs opacity-80">Árlista szinkronizálva</p>
        </header>

        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
          <input placeholder="Ügyfél neve" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none font-bold" />
          <input placeholder="Helyszín" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none" />
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Munkanem kiválasztása</label>
              <select 
                value={item.task} 
                onChange={(e) => updateItemTask(index, e.target.value)}
                className="w-full p-2 bg-slate-50 rounded-lg border-none mb-3 text-sm outline-none"
              >
                <option value="">-- Válasszon az árlistából --</option>
                {arlista.map((a, i) => <option key={i} value={a.label}>{a.label}</option>)}
              </select>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 block">Mennyiség</label>
                  <input type="number" value={item.qty} onChange={e => {
                    const newItems = [...items];
                    newItems[index].qty = parseFloat(e.target.value) || 0;
                    setItems(newItems);
                  }} className="w-full p-2 bg-slate-50 rounded-lg border-none text-sm outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 block">Egységár</label>
                  <div className="p-2 text-sm font-bold text-emerald-600 italic">{item.price} Ft</div>
                </div>
              </div>

              {items.length > 1 && (
                <button onClick={() => removeItem(index)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"><Trash2 size={14}/></button>
              )}
            </div>
          ))}
        </div>

        <button onClick={addItem} className="w-full p-3 border-2 border-dashed border-emerald-300 rounded-2xl text-emerald-600 font-bold flex items-center justify-center gap-2"><Plus size={20}/> Új tétel</button>

        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl italic">
          <div className="text-xs opacity-60 uppercase font-bold">Várható végösszeg</div>
          <div className="text-2xl font-black">{new Intl.NumberFormat('hu-HU').format(totalAmount)} Ft</div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200">
        <button onClick={generatePDF} disabled={isGenerating} className="w-full bg-emerald-600 text-white h-16 rounded-2xl font-black uppercase shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all">
          {isGenerating ? <Loader2 className="animate-spin" /> : <><FileText size={20} /> Munkalap Generálása</>}
        </button>
      </div>
    </div>
  );
}
