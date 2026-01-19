'use client';
import React, { useState } from 'react';
import { ClipboardList, User, MapPin, Wrench, Banknote, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

export default function MunkalapPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Adatmezők állapota
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [workDetails, setWorkDetails] = useState("");
  const [price, setPrice] = useState("");

  const generatePDF = async () => {
    if (!clientName || !workDetails) {
      alert("Kérlek töltsd ki legalább a nevet és a munka leírását!");
      return;
    }
    
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const today = new Date().toLocaleDateString('hu-HU');

      doc.setFontSize(22);
      doc.text("MUNKALAP - MEGRENDELÉS", 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Dátum: ${today}`, 20, 35);
      doc.text(`Megrendelő: ${clientName}`, 20, 45);
      doc.text(`Cím: ${address}`, 20, 55);
      
      doc.line(20, 60, 190, 60);
      
      doc.text("Munka leírása:", 20, 70);
      doc.setFontSize(10);
      const splitWork = doc.splitTextToSize(workDetails, 170);
      doc.text(splitWork, 20, 80);
      
      doc.setFontSize(12);
      doc.text(`Vállalási ár: ${price} Ft`, 20, 150);
      
      doc.text("Aláírások:", 20, 180);
      doc.text("___________________", 20, 200);
      doc.text("___________________", 120, 200);
      doc.text("Vállalkozó", 35, 210);
      doc.text("Megrendelő", 135, 210);

      const pdfBase64 = doc.output('datauristring');

      // Email küldés
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
      alert("✅ Munkalap elmentve és elküldve!");
    } catch (err) {
      alert("Hiba történt a PDF generálása közben.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-28 font-sans">
      <button onClick={() => router.push('/')} className="mb-4 flex items-center gap-2 text-slate-600 font-bold">
        <ArrowLeft size={20} /> Vissza a menübe
      </button>

      <div className="max-w-md mx-auto space-y-4">
        <header className="bg-emerald-600 p-6 rounded-3xl shadow-lg text-white">
          <div className="flex items-center gap-3">
            <ClipboardList size={28} />
            <h1 className="text-xl font-black uppercase tracking-tight">Új Munkalap</h1>
          </div>
        </header>

        {/* ÜGYFÉL ADATOK */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase">
            <User size={18} /> Ügyfél neve
          </div>
          <input 
            placeholder="Kovács János"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full bg-slate-50 p-3 rounded-xl border-none text-sm font-medium" 
          />
          
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase">
            <MapPin size={18} /> Helyszín / Cím
          </div>
          <input 
            placeholder="Budapest, Példa utca 12."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-slate-50 p-3 rounded-xl border-none text-sm font-medium" 
          />
        </div>

        {/* MUNKA LEÍRÁSA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase">
            <Wrench size={18} /> Elvégzendő munka
          </div>
          <textarea 
            placeholder="Pl: Fürdőszoba csempézés, vízszerelés..."
            value={workDetails}
            onChange={(e) => setWorkDetails(e.target.value)}
            className="w-full bg-slate-50 p-3 rounded-xl border-none text-sm font-medium h-32" 
          />
        </div>

        {/* ÁRAZÁS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase">
            <Banknote size={18} /> Megállapodott összeg (Ft)
          </div>
          <input 
            type="number"
            placeholder="500000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-slate-50 p-3 rounded-xl border-none text-sm font-medium" 
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-lg border-t border-slate-200">
        <button 
          onClick={generatePDF}
          disabled={isGenerating}
          className="w-full bg-emerald-600 text-white h-16 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <><FileText size={20} /> Munkalap Generálása</>}
        </button>
      </div>
    </div>
  );
}
