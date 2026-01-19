'use client';
import React, { useRef, useState } from 'react';
import { Camera, Upload, FileText, Thermometer, Calendar, PackageCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import masterData from '@/lib/master_arlista.json';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DashboardPage() {
  const selectedTask = masterData.munkanemek["47_hidegburkolas"].tetelek[0];
  const reportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fotózás indítása
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // PDF Generálás - Mobilos javítással
  const generatePDF = async () => {
    if (!reportRef.current || isGenerating) return;
    setIsGenerating(true);

    try {
      // 1. Kényszerítjük a nézetet az elejére
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 300));

      const element = reportRef.current;
      
      // 2. Html2Canvas finomhangolás
      const canvas = await html2canvas(element, {
        scale: 1.5, // Kicsit kisebb skála a memória miatt
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY, // Fontos mobilon!
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        height: element.scrollHeight,
        backgroundColor: '#f8fafc'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.7); // JPEG a kisebb méretért
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RenovaMaster_Riport_${new Date().getTime()}.pdf`);
    } catch (err) {
      alert("Hiba a mentésnél. Próbálja meg frissíteni az oldalt!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 font-sans">
      
      {/* Rejtett kamera input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
      />

      {/* PDF TARTALOM */}
      <div ref={reportRef} className="max-w-xl mx-auto bg-[#f8fafc] p-5">
        
        {/* FEJLÉC */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6">
          <h1 className="text-xl font-black text-slate-900 uppercase italic leading-none">RenovaMaster AI</h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] mt-1 underline">HELYSZÍNI JELENTÉS</p>
        </div>

        <div className="space-y-4">
          {/* MUNKA ADATOK */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200">
            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mb-1">Aktuális Feladat</p>
            <p className="font-bold text-slate-800 text-sm">{selectedTask.nev}</p>
          </div>

          {/* HALADÁS KÁRTYA */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">LiDAR Készültség</span>
              <span className="text-lg font-mono font-bold text-emerald-600 underline">68.2%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[68%]"></div>
            </div>
          </div>

          {/* MŰSZAKVÉGI PANEL (Sötét) */}
          <div className="bg-[#0f172a] text-white p-6 rounded-[2rem] shadow-xl border border-slate-800 overflow-hidden">
            <h3 className="flex items-center gap-2 mb-4 font-bold text-sm tracking-tight">
              <Camera size={18} className="text-blue-400" /> Napi Dokumentáció
            </h3>
            
            {/* FOTÓ ELŐNÉZET */}
            <div className="aspect-video bg-slate-800 rounded-xl mb-6 flex items-center justify-center border border-dashed border-slate-700 overflow-hidden relative">
               {previewImage ? (
                 <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <p className="text-slate-500 text-[10px] italic font-mono uppercase tracking-widest">Várakozás fotóra...</p>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-5">
              <div>
                <p className="text-[8px] text-slate-500 uppercase font-bold italic">Anyagfogyás</p>
                <p className="font-mono text-sm text-blue-400 underline tracking-tighter">~42.5 kg</p>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <p className="text-[8px] text-slate-500 uppercase font-bold italic">Létszám</p>
                <p className="font-mono text-sm text-emerald-400 tracking-tighter">3 FŐ (AKTÍV)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FIX ALSÓ GOMBOK */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t flex gap-4 z-50">
        <button 
          onClick={handleCameraClick}
          className="flex-1 bg-slate-100 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-200 active:bg-slate-200 transition-all shadow-sm"
        >
          <Camera size={20} className="text-blue-600" />
          <span className="text-[9px] font-black uppercase tracking-widest">Fotó</span>
        </button>
        
        <button 
          onClick={generatePDF}
          disabled={isGenerating}
          className={`flex-[2.5] h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg transition-all ${
            isGenerating ? 'bg-slate-400' : 'bg-blue-600 text-white active:scale-95 shadow-blue-500/20'
          }`}
        >
          {isGenerating ? 'Várjon...' : <><FileText size={20} /> Mentés & PDF</>}
        </button>
      </div>

    </div>
  );
}
