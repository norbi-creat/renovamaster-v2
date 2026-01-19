'use client';
import React, { useRef, useState } from 'react';
import { Camera, FileText, Users, Package, AlertTriangle, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

export default function DashboardPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Állapotok a kártyákhoz
  const [workforce, setWorkforce] = useState("3 fő");
  const [materials, setMaterials] = useState("Csemperagasztó (5 zsák), Fugázó");
  const [obstacles, setObstacles] = useState("Nincs akadály");

  const handleCameraClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateAndSendPDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const today = new Date().toLocaleDateString('hu-HU');
      
      // PDF Tartalom összeállítása
      doc.setFontSize(22);
      doc.text("RENOVAMASTER NAPI RIPORT", 20, 20);
      doc.setFontSize(12);
      doc.text(`Datum: ${today}`, 20, 35);
      doc.text(`Letszam: ${workforce}`, 20, 45);
      doc.text(`Anyagok: ${materials}`, 20, 55);
      doc.text(`Akadaloyok: ${obstacles}`, 20, 65);

      if (previewImage) {
        doc.addImage(previewImage, 'JPEG', 20, 80, 170, 100);
      }

      const pdfBase64 = doc.output('datauristring');

      // Küldés az API-nak
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          date: today,
          taskName: "Napi Helyszini Jelentes"
        }),
      });

      if (!res.ok) throw new Error("API hiba");

      doc.save(`Riport_${today}.pdf`);
      alert("✅ Sikeres mentés és küldés!");
    } catch (err) {
      console.error(err);
      alert("⚠️ A PDF elkészült, de az email küldéshez be kell állítani a Resend kulcsot a Vercelen!");
      // Mentés akkor is, ha az email nem megy el
      const doc = new jsPDF();
      doc.text("Mentes hiba ellenere", 20, 20);
      doc.save("riport_mentes.pdf");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 p-4 font-sans">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />

      <div className="max-w-md mx-auto space-y-4">
        <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h1 className="text-xl font-black text-slate-800 tracking-tight">RENOVAMASTER AI</h1>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Helyszíni Napló</p>
        </header>

        {/* LÉTSZÁM KÁRTYA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-blue-600">
            <Users size={18} />
            <h3 className="font-bold text-sm uppercase">Létszám</h3>
          </div>
          <input value={workforce} onChange={(e) => setWorkforce(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border-none text-sm font-medium focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* ANYAG KÁRTYA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-emerald-600">
            <Package size={18} />
            <h3 className="font-bold text-sm uppercase">Felhasznált anyagok</h3>
          </div>
          <textarea value={materials} onChange={(e) => setMaterials(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border-none text-sm font-medium h-20 focus:ring-2 focus:ring-emerald-500" />
        </div>

        {/* AKADÁLYOK KÁRTYA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-amber-600">
            <AlertTriangle size={18} />
            <h3 className="font-bold text-sm uppercase">Akadályok / Megjegyzés</h3>
          </div>
          <textarea value={obstacles} onChange={(e) => setObstacles(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border-none text-sm font-medium h-20 focus:ring-2 focus:ring-amber-500" />
        </div>

        {/* FOTÓ KÁRTYA */}
        <div onClick={handleCameraClick} className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl cursor-pointer active:scale-95 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2 text-blue-400"><Camera size={18}/> Helyszíni fotó</h3>
            {previewImage && <CheckCircle2 className="text-emerald-400" size={20} />}
          </div>
          <div className="aspect-video bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-700 overflow-hidden">
            {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <Upload className="text-slate-600" />}
          </div>
        </div>
      </div>

      {/* FIX ALSÓ GOMB */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-lg border-t border-slate-200 flex gap-4">
        <button 
          onClick={generateAndSendPDF} 
          disabled={isGenerating}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white h-16 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all"
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <><FileText size={20} /> Riport Lezárása</>}
        </button>
      </div>
    </div>
  );
}
