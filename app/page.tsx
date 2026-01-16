'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Camera, CheckCircle2, Loader2, MapPin } from 'lucide-react';

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

  async function handleFileUpload(event: any, materialId: string) {
    try {
      setUploading(materialId);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${materialId}-${Math.random()}.${fileExt}`;
      const filePath = `verifications/${fileName}`;

      // 1. Kép feltöltése a Storage-ba
      const { error: uploadError } = await supabase.storage
        .from('material-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Táblázat frissítése (is_verified = true)
      const { error: updateError } = await supabase
        .from('material_list')
        .update({ is_verified: true, photo_url: filePath })
        .eq('id', materialId);

      if (updateError) throw updateError;
      
      fetchMaterials();
    } catch (error) {
      alert('Hiba történt a feltöltéskor!');
      console.error(error);
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-blue-900 italic">RenovaMaster AI</h1>
          <div className="bg-white px-3 py-1 rounded-full border shadow-sm text-xs font-bold flex items-center gap-1">
            <MapPin size={14} className="text-red-500" /> Veszprém
          </div>
        </div>

        <div className="space-y-4">
          {materials.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-extrabold text-xl leading-tight">{item.material_name}</h3>
                  <p className="text-slate-500 text-sm font-medium">{item.planned_quantity} {item.unit}</p>
                </div>
              </div>

              {item.is_verified ? (
                <div className="w-full bg-green-50 text-green-600 py-4 rounded-2xl border border-green-100 flex items-center justify-center gap-2 font-black">
                  <CheckCircle2 size={24} /> IGAZOLVA
                </div>
              ) : (
                <label className="relative w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-blue-200 shadow-xl active:scale-95 transition-all cursor-pointer">
                  {uploading === item.id ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Camera size={20} />
                      <span>FOTÓ FELTÖLTÉSE</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, item.id)}
                        disabled={uploading !== null}
                      />
                    </>
                  )}
                </label>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
