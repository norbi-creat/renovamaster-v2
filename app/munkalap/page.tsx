'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, ArrowLeft, Loader2, Info, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function MunkalapPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [munkanemek, setMunkanemek] = useState<any[]>([]);
  const [receptek, setReceptek] = useState<any[]>([]);
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([{ group: '', task: '', qty: 1, unit: '', workPrice: 0, materialPrice: 0, receptDetails: [] }]);

  const REZSIORADIJ = 9250;

  useEffect(() => {
    const sheetId = "1QDkPgvvPx7wwTKlvoDLLwIWlY1z6ladQtoRynOYsHa4";
    const munkanemUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=249861285`;
    const receptUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=263045857`;
    
    Promise.all([
      fetch(munkanemUrl).then(res => res.text()),
      fetch(receptUrl).then(res => res.text())
    ]).then(([mCsv, rCsv]) => {
      // Munkanemek (A: Kód, B: Megnevezés, C: Norma, D: Egység)
      const mRows = mCsv.split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
      const parsedM = mRows.slice(1).map(r => ({
        code: r[0],
        label: r[1],
        norma: parseFloat(r[2]?.replace(',', '.')) || 0,
        unit: r[3]
      })).filter(i => i.label);

      // Receptek (A: Kód, C: Összetevő, D: Norma, E: Egység)
      const rRows = rCsv.split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
      const parsedR = rRows.slice(1).map(r => ({
        code: r[0],
        component: r[2],
        norma: parseFloat(r[3]?.replace(',', '.')) || 0,
        unit: r[4]
      })).filter(r => r.code);

      setMunkanemek(parsedM);
      setReceptek(parsedR);
    });
  }, []);

  const updateItemTask = (index: number, taskLabel: string) => {
    const work = munkanemek.find(a => a.label === taskLabel);
    if (work) {
      // MUNKADÍJ: Norma * Rezsióradíj
      const calculatedWorkPrice = work.norma * REZSIORADIJ;

      // ANYAGDÍJ: Recept normák összege * Rezsióradíj (a megadott logika szerint)
      const relatedR = receptek.filter(r => r.code === work.code);
      let currentMatPrice = 0;
      let details: any = [];

      relatedR.forEach(r => {
        const matPrice = r.norma * REZSIORADIJ;
        currentMatPrice += matPrice;
        details.push(`${r.component}: ${r.norma} ${r.unit}`);
      });

      const newItems = [...items];
      newItems[index] = { 
        ...newItems[index], 
        task: taskLabel, 
        workPrice: calculatedWorkPrice, 
        materialPrice: currentMatPrice,
        unit: work.unit,
        receptDetails: details
      };
      setItems(newItems);
    }
  };

  const grandTotal = items.reduce((sum, i) => sum + ((i.workPrice + i.materialPrice) * i.qty), 0);

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-32 font-sans">
      <div className="max-w-md mx-auto space-y-4">
        <header className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl border-b-4 border-blue-500">
          <h1 className="text-xl font-black italic flex items-center gap-2 text-blue-400">
            <Calculator /> TERC SZÁMÍTÓ
          </h1>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
            Óradíj: {new Intl.NumberFormat('hu-HU').format(REZSIORADIJ)} Ft
          </p>
        </header>

        {items.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-3xl shadow-lg border border-slate-200 relative">
            <select 
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].group = e.target.value;
                setItems(newItems);
              }}
              className="w-full p-3 bg-slate-50 rounded-xl mb-3 text-sm font-bold border-none ring-1 ring-slate-200"
            >
              <option value="">-- Főcsoport (A oszlop) --</option>
              {['11','21','22','33','47','45','48','75','AZ'].map(code => (
                <option key={code} value={code}>{code} - Főcsoport</option>
              ))}
            </select>

            {item.group && (
              <select 
                onChange={(e) => updateItemTask(index, e.target.value)}
                className="w-full p-3 bg-blue-50 rounded-xl mb-3 text-sm font-semibold border-none ring-1 ring-blue-200"
              >
                <option value="">-- Munkanem választása (B oszlop) --</option>
                {munkanemek.filter(m => m.code?.startsWith(item.group)).map((m, i) => (
                  <option key={i} value={m.label}>{m.label}</option>
                ))}
              </select>
            )}

            {item.receptDetails.length > 0 && (
              <div className="bg-amber-50 p-3 rounded-xl mb-3 border border-amber-100">
                <p className="text-[10px] text-amber-800 font-medium">
                  <strong>Összetevők:</strong> {item.receptDetails.join(', ')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-2 text-center">
              <div className="bg-slate-50 p-2 rounded-xl">
                <p className="text-[9px] text-slate-400 uppercase font-bold">Munkadíj</p>
                <p className="text-sm font-black text-slate-800">{Math.round(item.workPrice).toLocaleString()} Ft</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl">
                <p className="text-[9px] text-slate-400 uppercase font-bold">Anyagdíj</p>
                <p className="text-sm font-black text-emerald-600">{Math.round(item.materialPrice).toLocaleString()} Ft</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
              <div className="w-1/3">
                <input type="number" value={item.qty} onChange={e => {
                  const newItems = [...items];
                  newItems[index].qty = parseFloat(e.target.value) || 0;
                  setItems(newItems);
                }} className="w-full bg-slate-100 p-2 rounded-lg font-black text-center outline-none" />
                <p className="text-[8px] text-center text-slate-400 mt-1 uppercase">Mennyiség ({item.unit})</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Összesen</p>
                <p className="text-xl font-black text-blue-600">
                  {Math.round((item.workPrice + item.materialPrice) * item.qty).toLocaleString()} Ft
                </p>
              </div>
            </div>
          </div>
        ))}

        <button onClick={() => setItems([...items, { group: '', task: '', qty: 1, unit: '', workPrice: 0, materialPrice: 0, receptDetails: [] }])} className="w-full p-4 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 font-bold flex items-center justify-center gap-2 active:scale-95">
          <Plus size={20}/> Új sor hozzáadása
        </button>

        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl">
          <p className="text-xs opacity-50 uppercase font-black tracking-widest text-center mb-1">Végösszeg (Bruttó)</p>
          <p className="text-4xl font-black text-emerald-400 text-center tracking-tighter">
            {Math.round(grandTotal).toLocaleString()} Ft
          </p>
        </div>
      </div>
    </div>
  );
}
