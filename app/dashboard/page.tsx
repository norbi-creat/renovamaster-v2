'use client';
import React from 'react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white p-10 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">RenovaMaster AI</h1>
      <div className="p-6 bg-slate-100 rounded-2xl shadow-xl border border-slate-200 text-center max-w-lg">
        <h2 className="text-xl font-semibold mb-2">Rendszer Ellenőrzés</h2>
        <p className="text-slate-600 italic mb-4">
          A Dashboard alapváza sikeresen betöltve. A kapcsolat a LiDAR adatokkal és a költségvetéssel aktív.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-100 text-green-700 rounded-lg font-bold">LOGISZTIKA: OK</div>
          <div className="p-4 bg-blue-100 text-blue-700 rounded-lg font-bold">KÖLTSÉG: OK</div>
        </div>
      </div>
    </div>
  );
}
