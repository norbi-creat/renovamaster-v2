'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, Truck, Layers, Box, CheckCircle } from 'lucide-react';
import masterData from '@/lib/master_arlista.json';

// Mintaadatok a grafikonhoz
const weeklyData = [
  { day: 'H', cost: 210, limit: 200 },
  { day: 'K', cost: 150, limit: 200 },
  { day: 'Sze', cost: 450, limit: 200 },
  { day: 'Cs', cost: 380, limit: 200 },
  { day: 'P', cost: 190, limit: 200 },
];

export default function DashboardPage() {
  // Kiválasztjuk a JSON-ból a hidegburkolást referenciának
  const selectedItem = masterData.munkanemek["47_hidegburkolas"].tetelek[0];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">RenovaMaster AI Dashboard</h1>
        <p className="text-slate-500">Projekt: Helyszíni kivitelezési felügyelet</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. BAL FELSŐ: Költség diagram */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-700">
            <Wallet className="text-green-600" /> Heti Költségvetés (eFt)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cost > entry.limit ? '#ef4444' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. JOBB FELSŐ: Logisztika */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-700">
            <Truck className="text-blue-600" /> Logisztika & Beszerzés
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-sm font-medium text-blue-800 italic">47-041-1 Anyagszállítás</span>
              <span className="text-[10px] font-bold px-2 py-1 bg-blue-200 text-blue-700 rounded uppercase">Folyamatban</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600 italic">Konténer rendelés (AZ-001)</span>
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-200 text-slate-500 rounded uppercase">Várólistán</span>
            </div>
          </div>
        </div>

        {/* 3. BAL ALSÓ: Szöveges rétegrend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-700">
            <Layers className="text-purple-600" /> Technológiai Leírás
          </h2>
          <div className="space-y-3">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">{selectedItem.nev}</h3>
              <p className="text-xs text-slate-400 font-mono">KÓD: {selectedItem.kod}</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic">
              <span className="font-semibold text-slate-800 italic uppercase">Alkalmazás:</span> {selectedItem.alkalmazas}
            </p>
          </div>
        </div>

        {/* 4. JOBB ALSÓ: Vizuális Rétegrend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-700">
            <Box className="text-orange-500" /> Vizuális Megjelenítés
          </h2>
          <div className="relative w-full h-48 flex flex-col-reverse p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <div className="h-10 bg-slate-400 rounded-t shadow-inner flex items-center justify-center text-white text-[10px] font-bold">ALAPBETON</div>
            <div className="h-4 bg-blue-300 opacity-70 flex items-center justify-center text-white text-[10px] font-bold border-y border-blue-400">SZIGETELÉS</div>
            <div className="h-12 bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg transform hover:scale-[1.02] transition-transform">BURKOLAT</div>
          </div>
          <p className="mt-3 text-[10px] text-slate-400 text-center uppercase tracking-widest">LiDAR 3D keresztmetszet</p>
        </div>

      </div>
    </div>
  );
}
