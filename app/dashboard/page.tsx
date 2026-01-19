'use client';
import React, { useRef, useState } from 'react';
import { 
  Camera, Upload, FileText, Thermometer, Calendar, 
  PackageCheck, AlertTriangle 
} from 'lucide-react';
import masterData from '@/lib/master_arlista.json';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DashboardPage() {
  const selectedTask = masterData.munkanemek["47_hidegburkolas"].tetelek[0];
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!reportRef.current || isGenerating) return;
    
    setIsGenerating(true);
    // Kicsi várakozás, hogy a UI frissüljön (pl. gomb letiltása)
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // 1. Mentjük az eredeti stílust és kényszerítjük a láthatóságot
      const element = reportRef.current;
      const originalScrollY = window.scrollY;
      window.scrollTo(0, 0);

      // 2. HTML2Canvas konfiguráció mobilos stabilitáshoz
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#f8fafc',
        width: element.offsetWidth,
        height: element.scrollHeight,
        onclone: (clonedDoc) => {
          // Itt kényszeríthetjük a klónozott elemen a képek láthatóságát
          const images = clonedDoc.getElementsByTagName('img');
          for (let i = 0; i < images.length; i++) {
            images[i].style.display = 'block';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`RenovaMaster_${new Date().getTime()}.pdf`);
      
      // Visszaállítjuk a görgetést
      window.scrollTo(0, originalScrollY);
    } catch (err) {
      console.error("PDF hiba:", err);
      alert("A generálás megszakadt. Próbáld meg bezárni a többi böngésző fület!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      {/* PDF TARTALOM */}
      <div ref={reportRef} className="max-w-4xl mx-auto bg-[#f8fafc] p-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6">
          <h1 className="text-xl font-black uppercase italic">RenovaMaster AI</h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-widest">NAPI JELENTÉS</p>
        </div>

        {/* Adat kártyák */}
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-blue-500 uppercase">Munka</p>
            <p className="font-bold text-slate-800">{selectedTask.nev}</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200">
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 italic">Állapot:</span>
                <span className="text-emerald-600 font-mono font-bold">68.2%</span>
             </div>
          </div>

          {/* Sötét panel adatokkal */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
            <h3 className="flex items-center gap-2 mb-4 font-bold">
              <Camera size={18} className="text-blue-400" /> Helyszíni Fotó & Adatok
            </h3>
            {/* Itt van a kritikus rész: a kép konténere */}
            <div className="aspect-video bg-slate-800 rounded-xl mb-4 flex items-center justify-center border border-dashed border-slate-700 overflow-hidden">
               <p className="text-slate-500 text-xs italic font-mono">Ide kerül a validált fotó...</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 p-3 rounded-lg">
                <p className="text-[9px] text-slate-500 uppercase">Fogyás</p>
                <p className="font-mono text-sm">42.5 kg</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <p className="text-[9px] text-slate-500 uppercase">Létszám</p>
                <p className="font-mono text-sm">3 Fő</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FIX ALSÓ SÁV */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t flex gap-3 z-50">
        <button className="flex-1 bg-slate-100 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-200 active:bg-slate-200 transition-all">
          <Camera size={20} className="text-slate-600" />
          <span className="text-[8px] font-bold uppercase">Fotózás</span>
        </button>
        <button 
          onClick={generatePDF}
          disabled={isGenerating}
          className={`flex-[2] h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${
            isGenerating ? 'bg-slate-400' : 'bg-blue-600 text-white active:scale-95 shadow-blue-500/20'
          }`}
        >
          {isGenerating ? 'Generálás...' : <><FileText size={18} /> Mentés & Lezárás</>}
        </button>
      </div>
    </div>
  );
}
