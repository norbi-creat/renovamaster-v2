import { createClient } from '@supabase/supabase-js';
import { CheckCircle2, Clock, MapPin, Camera } from 'lucide-react';

// Ez a sor kényszeríti a Vercelt, hogy ne tárolja el a régi adatokat (cache)
export const revalidate = 0; 

export default async function Dashboard() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: materials, error } = await supabase
    .from('material_list')
    .select('*')
    .order('created_at', { ascending: true });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-blue-900 tracking-tighter italic">RenovaMaster AI</h1>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border shadow-sm text-sm font-bold">
            <MapPin size={18} className="text-red-500" /> Veszprém | #H511436
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white">
            <h2 className="text-2xl font-bold">Rendszergarancia Ellenőrzés</h2>
            <p className="opacity-60 text-sm mt-1">180 nm homlokzati szigetelés technológiai validálása</p>
          </div>

          <div className="divide-y divide-slate-100">
            {materials && materials.length > 0 ? (
              materials.map((item) => (
                <div key={item.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-xl">{item.material_name}</h3>
                    <p className="text-slate-500 font-medium">
                      {item.planned_quantity} {item.unit} — Tervezett mennyiség
                    </p>
                  </div>
                  
                  <div>
                    {item.is_verified ? (
                      <div className="flex items-center gap-3 text-green-600 bg-green-50 px-6 py-3 rounded-2xl border border-green-200 font-black text-sm shadow-sm">
                        <CheckCircle2 size={24} /> IGAZOLVA
                      </div>
                    ) : (
                      <button className="w-full md:w-auto flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-wider">
                        <Camera size={20} /> Fotó feltöltése
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <div className="animate-bounce mb-4 text-slate-300">⚠️</div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nincs adat a Supabase táblában</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
