'use client';
import React, { useRef, useState } from 'react';
import { Camera, FileText, Thermometer, Calendar, PackageCheck, AlertTriangle, Upload, CheckCircle2 } from 'lucide-react';
import masterData from '@/lib/master_arlista.json';
import jsPDF from 'jspdf';

export default function DashboardPage() {
  const selectedTask = masterData.munkanemek["47_hidegburkolas"].tetelek[0];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

      // PDF SZERKESZTÉSE (Adat-alapú)
      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('RENOVAMASTER AI', 15, 20);
      doc.setFontSize(10);
      doc.text(`NAPI HELYSZÍNI JELENTÉS - ${today}`, 15, 30);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text('AKTUALIS FELADAT:', 15, 55);
      doc.setFontSize(14);
      doc.text(selectedTask.nev.toUpperCase(), 15, 65);

      doc.setDrawColor(200, 200, 200);
      doc.line(15, 75, 195, 75);
      doc.setFontSize(10);
      doc.text('LIDAR MERESI ADATOK:', 15, 85);
      doc.text('Keszultseg: 68.2%', 15, 95);
      doc.text('Szamitott fogyas: ~42.5 kg', 15, 105);
      doc.text('Letszam: 3 Fo', 15, 115);

      if (previewImage) {
        doc.text('HELYSZINI FOTO:', 15, 130);
        doc.addImage(previewImage, 'JPEG', 15, 135, 180, 110);
      }

      const pdfBase64 = doc.output('datauristring');

      // KÜLDÉS AZ API-NAK
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          date: today,
          taskName: selectedTask.nev
        }),
      });

      if (response.ok) {
        alert("✅ Riport elmentve és elküldve a Projektmenedzsernek!");
      } else {
        alert("⚠️ A PDF elkészült, de az email küldés sikertelen volt.");
      }

      doc.save(`RenovaMaster_Riport_${today}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Hiba történt a folyamat során.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 font-sans">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
      />

      <div className="max-w-md mx-auto p-4 pt-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 mb-6">
          <h1 className="text-2xl font-black text-slate-900 uppercase italic">RenovaMaster AI</h1>
          <p className="text-[10px] text-blue-600 font-bold tracking-[0.3em] mt-1 border-t pt-2">MOBIL OPERÁCIÓ</p>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Aktuális Munka</p>
            <p className="font-bold text-slate-800 text-sm">{selectedTask.nev}</p>
          </div>

          <div className="bg-[#0f172a] text-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-800">
            <h3 className="flex items-center gap-2 mb-4 font-bold text-sm text-blue-400">
              <Camera size={18} /> Helyszíni Fotó
            </h3>
            <div className="aspect-[4/3] bg-slate-800 rounded-2xl mb-4 flex items-center justify-center border-2 border-dashed border-slate-700 overflow-hidden relative">
               {previewImage ? (
                 <img src={previewImage} alt="Fotó" className="w-full h-full object-cover" />
               ) : (
                 <div className="text-center p-4">
                    <Upload className="mx-auto text-slate-600 mb-2" size={24} />
                    <p className="text-slate-500 text-[10px] uppercase font-mono italic">Készítsen fotót!</p>
                 </div>
               )}
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 text-center">
              <div>
                <p className="text-[8px] text-slate-500 uppercase font-bold">Készültség</p>
                <p className="font-mono text-sm text-emerald-400 font-bold italic">68.2%</p>
              </div>
              <div>
                <p className="text-[8px] text-slate-500 uppercase font-bold">Létszám</p>
                <p className="font-mono text-sm text-blue-400 font-bold italic underline">3 Fő</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t flex gap-4 z-50">
        <button 
          onClick={handleCameraClick}
          className="flex-1 bg-slate-100 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-200 active:bg-slate-200 transition-all shadow-sm"
        >
          <Camera size={22} className="text-blue-600" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Fotó</span>
        </button>
        
        <button 
          onClick={generateAndSendPDF}
          disabled={isGenerating}
          className={`flex-[2.5] h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg transition-all ${
            isGenerating ? 'bg-slate-400 animate-pulse' : 'bg-blue-600 text-white active:scale-95 shadow-blue-500/20'
          }`}
        >
          {isGenerating ? 'Folyamatban...' : <><FileText size={20} /> Nap Lezárása</>}
        </button>
      </div>
    </div>
  );
}
