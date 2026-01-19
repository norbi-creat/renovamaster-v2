'use client';
import React, { useState } from 'react';
import { ClipboardList, User, MapPin, Plus, Trash2, Banknote, FileText, ArrowLeft, Loader2, ruler } from 'lucide-react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

export default function MunkalapPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  
  // Munkanemek állapota (LiDAR mérésekhez és igényekhez)
  const [items, setItems] = useState([{ task: '', qty: '', unit: 'm2' }]);

  const addItem = () => setItems([...items, { task: '', qty: '', unit: 'm2' }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const generatePDF = async () => {
    if (!clientName || items[0].task === "") {
      alert("Kérlek töltsd ki a nevet és legalább egy munkanemet!");
      return;
    }
    
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const today = new Date().toLocaleDateString('hu-HU');

      doc.setFontSize(20);
      doc.text("MUNKALAP - MEGRENDELÉS", 20, 20);
      
      doc.setFontSize(10);
      doc.text(`Kelt: ${today}`, 20, 30);
      doc.text(`Megrendelő: ${clientName}`, 20, 40);
      doc.text(`Helyszín: ${address}`, 20, 45);
      
      doc.line(20, 50, 190, 50);
      
      // Táblázat fejléce
      doc.setFontSize(11);
      doc.text("Munkanem (LiDAR / Igény alapján)", 20, 60);
      doc.text("Menny.", 150, 60);
      doc.text("Egység", 170, 60);
      doc.line(20, 63, 190, 63);

      let y = 70;
      items.forEach((item) => {
        doc.text(item.task, 20, y);
        doc.text(item.qty, 150, y);
        doc.text(item.unit, 170, y);
        y += 8;
      });

      doc.line(20, y + 5, 190, y + 5);
      doc.setFontSize(12);
      doc.text(`Vállalási ár összesen: ${price} Ft`, 20, y + 15);
      
      doc.text("Aláírások:", 20, y + 40);
      doc.text("___________________", 20, y + 60);
      doc.text("___________________", 120, y + 60);
      doc.text("Vállalkozó", 35, y + 65);
      doc.text("Megrendelő", 135, y + 65);

      const pdfBase64 = doc.output('datauristring');

      await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          date: today,
          taskName: `Munkalap - ${clientName}`
        }),
      });

      doc.save(`Munkalap_${clientName}.pdf`);
      alert("✅ Munkalap elküldve!");
    } catch (err) {
      alert("Hiba történt.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-32 font-sans">
      <button onClick={() => router.push('/')} className="mb-4 flex items-center gap-2 text-slate-600 font-bold">
        <ArrowLeft size={20} /> Vissza
      </button>

      <div className="max-w-md mx-auto space-y-4">
        <header className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg">
          <h1 className="text-xl font-black uppercase tracking-tight">LiDAR alapú Munkalap</h1>
        </header>

        {/* ÜGYFÉL ADATOK */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <input placeholder="Ügyfél neve" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border-none text-sm font-bold" />
          <input placeholder="Cím" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border-none text-sm font-medium" />
        </div>

        {/* MUNKANEMEK LISTÁJA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm uppercase text-slate-500">Munkanemek és Méretek</h3>
            <button onClick={addItem} className="bg-emerald-100 text-emerald-700 p-2 rounded-lg flex items-center gap-1 text-xs font-bold">
              <Plus size={16} /> Hozzáad
            </button>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-xl space-y-2 relative">
                <input 
                  placeholder="Munkanem (pl: Gipszkartonozás)" 
                  value={item.task} 
                  onChange={(e) => updateItem(index, 'task', e.target.value)}
                  className="w-full bg-white p-2 rounded-lg border-none text-sm font-medium"
                />
                <div className="flex gap-2">
                  <input 
                    placeholder="Menny." 
                    type="number"
                    value={item.qty} 
                    onChange={(e) => updateItem(index, 'qty', e.target.value)}
                    className="w-1/2 bg-white p-2 rounded-lg border-none text-sm"
                  />
                  <select 
                    value={item.unit} 
                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    className="w-1/2 bg-white p-2 rounded-lg border-none text-sm"
                  >
                    <option value="m2">m²</option>
                    <option value="fm">fm</option>
                    <option value="db">db</option>
                    <option value="m3">m³</option>
                  </select>
                </div>
                {items.length > 1 && (
                  <button onClick={() => removeItem(index)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ÁR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase mb-2">
            <Banknote size={18} /> Összesített vállalási ár
          </div>
          <input type="number" placeholder="Ft" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border-none text-lg font-black text-emerald-700" />
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
