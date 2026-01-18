import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Truck, Container, Wallet, CheckCircle2, Layers } from 'lucide-react';

// Mintaadatok a heti költségdiagramhoz (Bal Felső)
const weeklyData = [
  { day: 'H', cost: 210, limit: 200 },
  { day: 'K', cost: 150, limit: 200 },
  { day: 'Sze', cost: 450, limit: 200 },
  { day: 'Cs', cost: 380, limit: 200 },
  { day: 'P', cost: 190, limit: 200 },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">RenovaMaster AI - Építésvezetői Panel</h1>
        <p className="text-slate-500">Projekt: Belvárosi Lakásfelújítás v2.0</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. BAL FELSŐ: Heti Költségvetés */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wallet className="text-blue-600" /> Heti Költségvetés (eFt)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost">
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cost > entry.limit ? '#ef4444' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. JOBB FELSŐ: Logisztika & Státusz */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Logisztika & Státusz</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Truck className="text-orange-500" />
                <span>Burkoló ragasztó (47-es tétel)</span>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-600 rounded">ÚTON</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Container className="text-blue-500" />
                <span>Sittszállítás (AZ-001)</span>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-600 rounded">RENDELVE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500" />
                <span>Szigetelés átvéve (33-as)</span>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-600 rounded">KÉSZ</span>
            </div>
          </div>
        </div>

        {/* 3. BAL ALSÓ: Szöveges Rétegrend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="text-purple-600" /> Aktuális Rétegrend (LiDAR)
          </h2>
          <div className="prose prose-sm text-slate-600">
            <h3 className="text-md font-bold text-slate-700">Tétel: 48-041-1 Laminált padló</h3>
            <ul className="list-decimal pl-4 space-y-1">
              <li>Tisztított alapfelület (beton)</li>
              <li>Párazáró PE fólia (1.15 norma)</li>
              <li>XPS lépésálló hőszigetelés 5mm</li>
              <li>Laminált padlólap (úsztatott fektetés)</li>
              <li>MDF szegélyléc (75-081-1)</li>
            </ul>
          </div>
        </div>

        {/* 4. JOBB ALSÓ: Vizuális Rétegrend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold mb-4 self-start">Vizuális Rétegrend</h2>
          <div className="relative w-48 h-64 bg-slate-100 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 flex flex-col-reverse p-2 gap-1">
            {/* Vizuális szimuláció CSS-el */}
            <div className="h-4 bg-slate-400 w-full rounded shadow-sm text-[10px] flex items-center justify-center text-white">Beton</div>
            <div className="h-2 bg-blue-300 w-full rounded shadow-sm text-[10px] flex items-center justify-center">Fólia</div>
            <div className="h-8 bg-green-200 w-full rounded shadow-sm text-[10px] flex items-center justify-center">XPS 5mm</div>
            <div className="h-6 bg-amber-700 w-full rounded shadow-sm text-[10px] flex items-center justify-center text-white">Laminált</div>
          </div>
          <p className="mt-4 text-xs text-slate-400">LiDAR által generált 3D metszet</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
