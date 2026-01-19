'use client';
import React, { useRef } from 'react';
import { 
  Truck, Users, AlertTriangle, Calendar, 
  PackageCheck, Thermometer, Camera, Upload, 
  CheckCircle2, FileText 
} from 'lucide-react';
import masterData from '@/lib/master_arlista.json';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DashboardPage() {
  const selectedTask = masterData.munkanemek["47_hidegburkolas"].tetelek[0];
  const reportRef = useRef<HTMLDivElement>(null);

  // PDF Generáló funkció - Mobilra optimalizálva
  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    try {
      // 1. Visszatekerünk az elejére, hogy a html2canvas mindent lásson
      window.scrollTo(0, 0);

      // 2. Kép készítése a tartalomról
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Jó felbontás
        useCORS: true, 
        logging: false,
        backgroundColor: '#f8fafc',
        // Kényszerítjük a teljes magasságot
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // 3. PDF összeállítása
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      // Letöltés indítása
      pdf.save(`RenovaMaster_Riport_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF generálási hiba:", err);
      alert("Hiba történt a PDF mentésekor. Kérlek próbáld újra!");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans text-slate-900">
      
      {/* EZ A RÉSZ KERÜL A PDF-BE */}
      <div ref={reportRef} className="max-w-4xl mx-auto bg-[#f8fafc] p-6 md:p-10">
        
        {/* --- FEJLÉC ÉS LOGÓ --- */}
        <div className="flex justify-between items-center mb-8 border-b-2 border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">RenovaMaster AI</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Helyszíni Napi Jelentés</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Projekt Kód</p>
            <p className="text-sm font-mono font-bold text-blue-600">#REV-2026-0119</p>
          </div>
        </div>

        {/* --- OPERATÍV ADATOK --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-blue-500 mb-1 uppercase tracking-widest italic">Aktuális Munkanem</p>
            <p className="font-bold text-slate-800 text-base underline">{selectedTask.nev}</p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium italic">Környezeti adatok:</span>
              <span className="font-bold text-orange-600 flex items-center gap-1">
                <Thermometer size={16} /> 22°C / 45% Pára
              </span>
            </div>
          </div>
        </div>

        {/* --- KRITIKUS ÁLLAPOTOK --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2">
              <PackageCheck size={14} /> Anyag & Készlet
            </h3>
            <div className="space-y-2 italic">
              <div className="flex justify-between"><span>Csemperagasztó:</span> <span className="font-bold text-emerald-600 underline">KÉSZLETEN</span></div>
              <div className="flex justify-between"><span>Fugázó:</span> <span className="font-bold text-orange-500 animate-pulse underline italic">ÚTON</span></div>
            </div>
          </div>
          <div className="p-5 bg-[#fff1f2] rounded-2xl border border-rose-100">
            <h3 className="text-[10px] font-bold text-rose-700 uppercase mb-3 tracking-widest flex items-center gap-2">
              <AlertTriangle size={14} /> Akadályok
            </h3>
            <p className="text-xs text-slate-600 leading-tight italic font-medium">
              Gépész nyomáspróba a vizesblokkban folyamatban. Burkolás korlátozott.
            </p>
          </div>
        </div>

        {/* --- HALADÁS --- */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
            <Calendar size={14} /> LiDAR Alapú Teljesítés
          </h3>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-slate-600">Összesített készültség:</span>
            <span className="text-xl font-mono font-black text-emerald-600 underline italic">68.2%</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[68.2%]"></div>
          </div>
        </div>

        {/* --- MŰSZAKVÉGI RIPORT PANEL --- */}
        <div className="bg-[#0f172a] text-white p-8 rounded-[2rem] shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6 tracking-tight">
              <Camera className="text-blue-400" size={24} /> Műszakvégi Adatok
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-widest italic font-mono">Anyagfogyás</p>
                <p className="text-lg font-mono text-blue-400 font-bold underline">~42.5 kg</p>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-widest italic font-mono">Munkaidő</p>
                <p className="text-lg font-mono text-white font-bold">07:45 h</p>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-widest italic font-mono">Létszám</p>
                <p className="text-lg font-mono text-emerald-400 font-bold">3 Fő</p>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-widest italic font-mono">Validálás</p>
                <p className="text-xs font-bold text-white uppercase italic">LiDAR: OK</p>
              </div>
            </div>
          </div>
          {/* Dekoratív háttérelem a PDF-hez */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        </div>

      </div>

      {/* --- FIX ALSÓ SÁV (Nem kerül bele a PDF-be) --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex gap-4 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <label className="flex-1 cursor-pointer bg-slate-50 border-2 border-slate-200 py-4 rounded-2xl flex items-center justify-center gap-2 active:bg-slate-200 transition-all group">
          <Upload size={18} className="text-slate-400 group-hover:text-blue-500" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Fotó feltöltés</span>
          <input type="file" className="hidden" accept="image/*" capture="environment" />
        </label>
        
        <button 
          onClick={generatePDF}
          className="flex-[1.5] bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <FileText size={18} /> Nap Lezárása & PDF
        </button>
      </div>

    </div>
  );
}
