'use client'; // Fontos a grafikonokhoz!
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, Truck, Layers, Box } from 'lucide-react';
import masterData from '@/lib/master_arlista.json';

const weeklyData = [
  { day: 'H', cost: 210 }, { day: 'K', cost: 150 }, { day: 'Sze', cost: 450 },
  { day: 'Cs', cost: 380 }, { day: 'P', cost: 190 }
];

export default function DashboardPage() {
  // Példaként kiválasztjuk a hidegburkolást a JSON-ból
  const selectedItem = masterData.munkanemek["47_hidegburkolas"].tetelek[0];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-2xl font-bold mb-6">RenovaMaster AI Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BAL FELSŐ: Költség diagram */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Wallet /> Heti Költség</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" /> <YAxis /> <Tooltip />
                <Bar dataKey="cost" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* JOBB FELSŐ: Logisztika */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Truck /> Logisztika</h2>
          <div className="p-4 bg-orange-50 text-orange-700 rounded-lg">Fuvarszervezés: 47-es tétel anyagszállítás folyamatban.</div>
        </div>

        {/* BAL ALSÓ: Szöveges rétegrend (Dinamikusan a JSON-ból) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Layers /> Rétegrend: {selectedItem.nev}</h2>
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-500">KÓD: {selectedItem.kod}</p>
            <p className="text-slate-600 italic">Alkalmazás: {selectedItem.alkalmazas}</p>
          </div>
        </div>

        {/* JOBB ALSÓ: Vizuális Rétegrend (A "Vizuális doboz") */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Box /> Vizuális Megjelenítés</h2>
          <div className="relative w-full h-48 flex flex-col-reverse p-4 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300">
            {/* Itt rajzoljuk ki a rétegeket */}
            <div className="h-12 bg-gray-400 rounded-t shadow-inner flex items-center justify-center text-white text-[10px]">ALAPBETON</div>
            <div className="h-4 bg-blue-400 flex items-center justify-center text-white text-[10px]">SZIGETELÉS</div>
            <div className="h-10 bg-emerald-500 flex items-center justify-center text-white text-[10px] shadow-lg">BURKOLAT</div>
          </div>
        </div>

      </div>
    </div>
  );
}
