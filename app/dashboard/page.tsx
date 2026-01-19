'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, Truck, Layers, Box } from 'lucide-react';

// Mintaadatok, hogy akkor is működjön, ha az adatbázis még töltődik
const weeklyData = [
  { day: 'H', cost: 210, limit: 200 },
  { day: 'K', cost: 150, limit: 200 },
  { day: 'Sze', cost: 450, limit: 200 },
  { day: 'Cs', cost: 380, limit: 200 },
  { day: 'P', cost: 190, limit: 200 },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">RenovaMaster AI Dashboard</h1>
        <p className="text-slate-500">Kivitelezési státusz: Aktív</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Költségdiagram */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Wallet className="text-green-600" /> Heti Költségvetés</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cost > entry.limit ? '#ef4444' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Logisztika */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Truck className="text-blue-600" /> Logisztika</h2>
          <div className="p-4 bg-blue-50 rounded-lg text-blue-700 text-sm italic">
            Anyagszállítás: Kőzetgyapot 15cm (Folyamatban)
          </div>
        </div>

        {/* Szöveges rétegrend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Layers className="text-purple-600" /> Technológia</h2>
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 italic">Homlokzati hőszigetelés</h3>
            <p className="text-sm text-slate-600">Kód: 21-151-1</p>
            <p className="text-xs text-slate-400">Ragasztás, dübelezés, hálózás, alapozás, színezés.</p>
          </div>
        </div>

        {/* Vizuális keresztmetszet */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-lg font-semibold mb-4 text-left flex items-center gap-2"><Box className="text-orange-500" /> Vizuális Keresztmetszet</h2>
          <div className="w-full h-40 bg-slate-100 rounded-lg flex flex-col-reverse p-4 gap-1">
            <div className="h-8 bg-gray-400 rounded flex items-center justify-center text-[10px] text-white">FALAZAT</div>
            <div className="h-12 bg-yellow-300 flex items-center justify-center text-[10px] font-bold">KŐZETGYAPOT</div>
            <div className="h-2 bg-orange-400 rounded-t flex items-center justify-center text-[10px] text-white">VAKOLAT</div>
          </div>
        </div>
      </div>
    </div>
  );
}
