import { createClient } from '@supabase/supabase-js';
import { CheckCircle2, Clock, MapPin } from 'lucide-react';

export default async function Dashboard() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: materials } = await supabase
    .from('material_list')
    .select('*')
    .order('created_at', { ascending: true });

  return (
    <main className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">RenovaMaster <span className="text-blue-500">AI</span></h1>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
            <MapPin size={18} className="text-red-500" />
            <span className="font-semibold text-sm">Veszprém | #H511436</span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white">
            <h2 className="text-2xl font-bold">Rendszergarancia Ellenőrzés</h2>
            <p className="text-slate-400 mt-1">180 nm homlokzati szigetelés technológiai validálása</p>
          </div>

          <div className="divide-y divide-slate-50">
            {materials?.map((item) => (
              <div key={item.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                <div className="space-y-1">
                  <h3 className="font-bold text-xl text-slate-800">{item.material_name}</h3>
                  <p className="text-slate-500 font-medium">{item.planned_quantity} {item.unit} — Tervezett mennyiség</p>
                </div>
                {item.is_verified ? (
                  <div className="flex items-center gap-3 text-green-600 bg-green-50 px-6 py-3 rounded-2xl border border-green-100 shadow-sm">
                    <CheckCircle2 size={24} strokeWidth={2.5} />
                    <span className="font-black text-sm tracking-wider">IGAZOLVA</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-amber-500 bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100">
                    <Clock size={24} className="animate-pulse" />
                    <span className="font-black text-sm tracking-wider">FOLYAMATBAN</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}