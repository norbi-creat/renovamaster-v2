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

  // PDF Generáló funkció
  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: '#f8fafc'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.setFontSize(18);
    pdf.text('RenovaMaster AI - Napi Riport', 10, 15);
    pdf.setFontSize(10);
    pdf.text(`Dátum: ${new Date().toLocaleDateString('hu-HU')}`, 10, 22);
    pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
    pdf.save(`RenovaMaster_Riport_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      
      {/* Ez a div lesz a PDF alapja */}
      <div ref={reportRef} className="max-w-6xl mx-auto bg-[#f8fafc] p-2">
        
        {/* FEJLÉC */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tighter">Helyszíni Operáció</h1>
            <p className="text-slate-500 font-medium italic">
              Munkanem: <span className="text-blue-600">{selectedTask.nev}</span>
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
            <Thermometer size={18} className="text-orange-500" />
            <span className="text-sm font-bold">22°C / 45% pára</span>
          </div>
        </div>

        {/* OPERATÍV KÁRTYÁK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-blue-500">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 mb-4"><PackageCheck size={20}/> Anyagok</h2>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between"><span>Csemperagasztó:</span> <span className="text-green-600 font-bold">OK</span></p>
              <p className="flex justify-between"><span>Fugázó:</span> <span className="text-orange-500 font-bold italic underline">ÚTON</span></p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-purple-500">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 mb-4"><Users size={20}/> Létszám</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium italic">Burkoló mester (AZ-998)</p>
              <p className="font-medium italic">Segédmunkás (AZ-002)</p>
            </div>
          </div>

          <div className="bg-[#fff1f2] p-6 rounded-2xl border border-rose-100">
            <h2 className="font-bold text-rose-700 flex items-center gap-2 mb-2"><AlertTriangle size={20} /> Akadályok</h2>
            <p className="text-xs text-slate-600 italic leading-tight">Gépész nyomáspróba folyamatban a konyhában.</p>
          </div>
        </div>

        {/* TECHNOLÓGIA */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={20}/> Haladás</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border-l-4 border-emerald-500 flex justify-between items-center opacity-50">
              <span className="text-xs font-bold italic underline">Aljzatkiegyenlítés</span>
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border-l-4 border-blue-500 ring-1 ring-blue-100">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-tighter">{selectedTask.nev}</span>
            </div>
          </div>
        </div>

        {/* MŰSZAKVÉGI PANEL (A PDF-ben is jól mutat) */}
        <div className="bg-[#0f172a] text-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
                <Camera className="text-blue-400" size={28} /> Műszakvégi Riport
              </h2>
              <div className="bg-slate-800/50 p-2 px-4 rounded-xl border border-slate-700 text-sm text-blue-300 font-bold italic underline">
                Tétel: {selectedTask.nev}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto no-print">
              <label className="cursor-pointer bg-[#1e293b] hover:bg-slate-700 border border-slate-700 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all">
                <Upload className="text-blue-400" size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">Fotó</span>
                <input type="file" className="hidden" accept="image/*" capture="environment" />
              </label>

              <button 
                onClick={generatePDF}
                className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <FileText size={20} /> Nap Lezárása & PDF
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-800 pt-8">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1 italic">Fogyás</p>
              <p className="text-lg font-mono text-blue-400 font-bold">~42.5 kg</p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1 italic">Készültség</p>
              <p className="text-xl font-mono text-emerald-400 font-bold">68.2 %</p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1 italic">Következő</p>
              <p className="text-md font-mono text-orange-400 font-bold uppercase">Fugázó</p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1 italic">LiDAR</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-white uppercase italic">Aktív</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
