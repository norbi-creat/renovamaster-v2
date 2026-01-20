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
  
  // VÁLLALKOZÁS ADATAI (FIX)
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

  const totalHours = items.reduce((sum, i) => sum + (i.norma * i.qty), 0);
  const workDays = totalHours > 0 ? Math.ceil(totalHours / (workers * 8)) : 0;
  const totalNetOverall = items.reduce((sum, i) => sum + ((i.workPrice + i.materialPrice) * i.qty), 0);
  const vat = totalNetOverall * 0.27;
  const brutton = totalNetOverall + vat;

  const generatePDF = () => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('hu-HU');
    
    // Fejléc cégadatokkal
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(provider.name, 20, 20);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text([
      `Székhely: ${provider.address}`,
      `Adószám: ${provider.taxId} | Cégjegyzékszám: ${provider.regId}`
    ], 20, 26);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("VÁLLALKOZÁSI SZERZŐDÉS", 105, 45, { align: "center" });
    
    doc.setFontSize(9);
    doc.text(`Projekt: ${customer.projectId}`, 20, 55);
    doc.text(`Dátum: ${now}`, 160, 55);

    doc.line(20, 58, 190, 58);
    
    // Megrendelő
    doc.setFont("helvetica", "bold");
    doc.text("MEGRENDELŐ:", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text([
      `Név: ${customer.name || '...........................................'}`,
      `Cím: ${customer.address || '...........................................'}`,
      `Munkavégzés helye: ${customer.location || '....................'} (Hrsz: ${customer.locationId || '....'})`
    ], 20, 70);

    const tableData = items.filter(i => i.task).map(i => [
      i.task, 
      `${i.qty} ${i.unit}`, 
      `${Math.round(i.workPrice + i.materialPrice).toLocaleString()} Ft`, 
      `${Math.round((i.workPrice + i.materialPrice) * i.qty).toLocaleString()} Ft`
    ]);

    (doc as any).autoTable({
      startY: 90,
      head: [['Munka megnevezése', 'Menny.', 'Nettó Egységár', 'Összesen']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 8 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Összesítés
    doc.setFont("helvetica", "bold");
    doc.text(`Nettó összesen: ${Math.round(totalNetOverall).toLocaleString()} Ft`, 130, finalY);
    doc.text(`ÁFA (27%): ${Math.round(vat).toLocaleString()} Ft`, 130, finalY + 7);
    doc.setFontSize(12);
    doc.text(`BRUTTÓ: ${Math.round(brutton).toLocaleString()} Ft`, 130, finalY + 16);

    // Fizetési ütemezés
    doc.setFontSize(10);
    doc.text("PÉNZÜGYI TELJESÍTÉS ÜTEMEZÉSE:", 20, finalY + 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text([
      `1. Előleg (30%, szerződéskötéskor): ${Math.round(brutton * 0.3).toLocaleString()} Ft`,
      `2. Részszámla (40%, 50%-os készültségnél): ${Math.round(brutton * 0.4).toLocaleString()} Ft`,
      `3. Végszámla (30%, műszaki átadáskor): ${Math.round(brutton * 0.3).toLocaleString()} Ft`
    ], 20, finalY + 32);

    // Aláírások
    const signY = finalY + 60;
    doc.line(20, signY, 80, signY);
    doc.line(130, signY, 190, signY);
    doc.text("Vállalkozó (Kaheliszto Kft.)", 35, signY + 5);
    doc.text("Megrendelő", 153, signY + 5);

    doc.save(`Szerzodes_${customer.name || 'Ugyfel'}.pdf`);
  };

  // ... (A többi rész változatlan: felület és logika) ...
  return (
    // A korábbi return blokk a navigációval és fülekkel
    <div className="min-h-screen bg-[#f1f5f9] pb-32 font-sans text-slate-900">
      {/* (Itt a navigáció és a fülek kódja ugyanaz, mint az előző turnben, 
          csak a PDF gomb most már a frissített generatePDF-et hívja meg) */}
      
      {/* Navigáció marad... */}
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
           <div className="space-y-6">
             {/* Ügyfél adatok bevitele kártya */}
             <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
                <input placeholder="Megrendelő neve" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold" onChange={e => setCustomer({...customer, name: e.target.value})} />
                <input placeholder="Lakcím" className="w-full p-4 bg-slate-50 rounded-2xl text-xs" onChange={e => setCustomer({...customer, address: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Hrsz." className="p-4 bg-blue-50/50 rounded-2xl text-xs font-bold" onChange={e => setCustomer({...customer, locationId: e.target.value})} />
                  <input placeholder="Munkavégzés címe" className="p-4 bg-blue-50/50 rounded-2xl text-xs font-bold" onChange={e => setCustomer({...customer, location: e.target.value})} />
                </div>
             </div>
             {/* Tételek listája... */}
             {items.map((item, index) => (
               <div key={index} className="bg-white p-6 rounded-[2.5rem] shadow-lg">
                 <select onChange={(e) => updateItemTask(index, e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-sm font-bold">
                   <option value="">Válassz munkanemet...</option>
                   {munkanemek.map((m, i) => <option key={i} value={m.label}>{m.label}</option>)}
                 </select>
                 <input type="number" placeholder="Mennyiség" className="w-full p-4 bg-slate-100 rounded-2xl font-black text-xl" onChange={e => {
                    const newItems = [...items];
                    newItems[index].qty = parseFloat(e.target.value) || 0;
                    setItems(newItems);
                 }} />
               </div>
             ))}
             <button onClick={() => setItems([...items, { task: '', qty: 0, unit: '', workPrice: 0, materialPrice: 0, materials: [], norma: 0 }])} className="w-full p-5 border-4 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black">+ ÚJ TÉTEL</button>
           </div>
        )}

        {activeTab === 'tervezes' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl text-center">
               <p className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">Szerződéskötés</p>
               <button onClick={generatePDF} className="w-full bg-blue-600 text-white p-6 rounded-[2.5rem] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                 <FileText size={24} /> PDF SZERZŐDÉS LETÖLTÉSE
               </button>
               <p className="mt-4 text-[10px] text-slate-400 italic">A PDF tartalmazza a Kaheliszto Kft. adatait és a fizetési ütemezést.</p>
            </div>
            
            {/* Anyagkigyűjtés összesítő... */}
            <div className="bg-[#0f172a] p-8 rounded-[3rem] text-white">
               <h3 className="text-xs font-black uppercase text-emerald-400 mb-4">Anyagszükséglet</h3>
               {/* getAggregatedMaterials() map ide... */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
