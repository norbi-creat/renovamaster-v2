'use client';
import React, { useRef, useState } from 'react';
import { Camera, FileText, Thermometer, Calendar, PackageCheck, AlertTriangle, Upload } from 'lucide-react';
import masterData from '@/lib/master_arlista.json';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DashboardPage() {
  const selectedTask = masterData.munkanemek["47_hidegburkolas"].tetelek[0];
  const reportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current || isGenerating) return;
    setIsGenerating(true);

    try {
      // 1. Minden görgetést és margót nullázunk a generálás idejére
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 400));

      const element = reportRef.current;
      
      // 2. Brutálisan pontos renderelési beállítások
      const canvas = await html2canvas(element, {
        scale: 2, // Magas minőség
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f8fafc',
        scrollY: 0, 
        scrollX: 0,
        x: 0, // Kényszerített X start
        y: 0, // Kényszerített Y start (eltünteti a fenti üres helyet)
        width: element.offsetWidth,
        height: element.scrollHeight,
        // Kényszerítjük a mobil böngészőt, hogy ne vágja le a tartalom végét
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RenovaMaster_Riport_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Hiba a mentésnél!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
      />

      {/* Fontos: A belső div-en nincs felesleges padding/margó a PDF-ben */}
      <div ref={reportRef} className="max-w-md mx-auto bg-[#f8fafc] p-4 pt-8">
        
        {/* FEJLÉC */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6">
          <h1 className="text-2xl font-black text-slate-900 uppercase italic">RenovaMaster AI</h1>
          <p className="text-[10px] text-blue-600 font-bold tracking-[0.3em] mt-1 border-t pt-2">NAPI JELENTÉS</p>
        </div>

        <div className="space-y-4">
          {/* MUNKA ADATOK */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Feladat</p>
            <p className="font-bold text-slate-800 text-sm">{selectedTask.nev}</p>
          </div>

          {/* HALADÁS */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic font-mono tracking-tighter">LiDAR Státusz</span>
              <span className="text-xl font-mono font-bold text-emerald-600 underline">68.2%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[68%]"></div>
            </div>
          </div>

          {/* SÖTÉT PANEL (Ezt szokta levágni - Most már nem fogja) */}
          <div className="bg-[#0f172a] text-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-800">
            <h3 className="flex items-center gap-2 mb-5 font-bold text-sm">
              <Camera size={18} className="text-blue-400" /> Dokumentáció
            </h3>
            
            <div className="aspect-[4/3] bg-slate-800 rounded-2xl mb-6 flex items-center justify-center border-2 border-dashed border-slate-700 overflow-hidden relative">
               {previewImage ? (
                 <img src={previewImage} alt="Fotó" className="w-full h-full object-cover" />
               ) : (
                 <div className="text-center p-4">
                    <Upload className="mx-auto text-slate-600 mb-2" size={24} />
                    <p className="text-slate-500 text-[10px] italic font-mono uppercase tracking-[0.2em]">Kamera kész...</p>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
              <div>
                <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Anyagfogyás</p>
                <p className="font-mono text-sm text-blue-400 font-bold">~42.5 kg</p>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Létszám</p>
                <p className="font-mono text-sm text-emerald-400 font-bold uppercase italic">3 Fő OK</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FIX ALSÓ GOMBOK (Ezek kívül vannak a reportRef-en, nem lesznek a PDF-ben) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t flex gap-4 z-50">
        <button onClick={handleCameraClick} className="flex-1 bg-slate-100 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-200 active:bg-slate-200 transition-all">
          <Camera size={22} className="text-blue-600" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 tracking-tighter">Fotó</span>
        </button>
        <button onClick={generatePDF} disabled={isGenerating} className={`flex-[2.5] h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg transition-all ${isGenerating ? 'bg-slate-400 animate-pulse' : 'bg-blue-600 text-white active:scale-95 shadow-blue-500/20'}`}>
          {isGenerating ? 'Riport készítése...' : <><FileText size={20} /> Nap Lezárása</>}
        </button>
      </div>

    </div>
  );
}
