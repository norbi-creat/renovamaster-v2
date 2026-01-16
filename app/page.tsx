'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Camera, CheckCircle2, Loader2, MapPin, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    const { data } = await supabase.from('material_list').select('*').order('created_at', { ascending: true });
    if (data) setMaterials(data);
  }

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("RenovaMaster AI - Muszaki Ellenorzo Jelentes", 14, 15);
    doc.setFontSize(10);
    doc.text(`Keszult: ${new Date().toLocaleDateString('hu-HU')}`, 14, 22);
    doc.text("Helyszin: Veszprem - Projekt #H511436", 14, 27);

    const tableData = materials.map(m => [
      m.material_name,
      `${m.planned_quantity} ${m.unit}`,
      m.is_verified ? "IGAZOLVA" : "VARAKOZIK"
    ]);

    (doc as any).autoTable({
      head: [['Anyag megnevezése', 'Mennyiség', 'Állapot']],
      body: tableData,
      startY: 35,
      theme: 'grid'
    });

    doc.save("RenovaMaster-Jelentes.pdf");
  };

  async function handleFileUpload(event: any, materialId: string) {
    try {
      setUploading(materialId);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${materialId}-${Math.random()}.${fileExt}`;
      const filePath = `verifications/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('material-photos').upload(filePath, file);
      if (uploadError) throw uploadError;

      await supabase.from('material_list').update({ is_verified: true, photo_url: filePath }).eq('id', materialId);
      fetchMaterials();
    } catch (error) {
      alert('Hiba történt!');
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 pb-20">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-blue-900 italic tracking-tight">RenovaMaster AI</h1>
          <button 
            onClick={exportPDF}
            className="bg-slate-900 text-white p-2 rounded-xl shadow-lg active:scale-95"
          >
            <FileDown size={20} />
          </button>
        </div>

        <div className="bg-white px-4 py-2 rounded-2xl border shadow-sm text-xs font-bold flex items-center gap-2 mb-6 w-fit">
          <MapPin size={14} className="text-red-500" /> Veszprém - Házszám: #H511436
        </div>

        <div className="space-y-4">
          {materials.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="mb-4">
                <h3 className="font-extrabold text-xl">{item.material_name}</h3>
                <p className="text-slate-500 text-sm font-medium">{item.planned_quantity} {item.unit}</p>
              </div>

              {item.is_verified ? (
                <div className="space-y-4">
                  <div className="w-full bg-green-50 text-green-600 py-3 rounded-2xl border border-green-100 flex items-center justify-center gap-2 font-black">
                    <CheckCircle2 size={24} /> IGAZOLVA
                  </div>
                  {item.photo_url && (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/material-photos/${item.photo_url}`}
                      className="w-full h-48 object-cover rounded-[1.5rem] border-4 border-slate-50 shadow-inner"
                      alt="Bizonyíték"
                    />
                  )}
                </div>
              ) : (
                <label className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-5 rounded-[1.5rem] font-black shadow-blue-200 shadow-2xl cursor-pointer active:scale-95 transition-all">
                  {uploading === item.id ? <Loader2 className="animate-spin" /> : <><Camera size={22} /> FOTÓ FELTÖLTÉSE</>}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileUpload(e, item.id)} />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
