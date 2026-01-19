'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, ArrowLeft, Loader2, Info, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function MunkalapPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [fullArlista, setFullArlista] = useState<any[]>([]);
  const [receptek, setReceptek] = useState<any[]>([]);
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([{ group: '', task: '', qty: 1, unit: 'm2', workPrice: 0, materialPrice: 0, receptText: '' }]);

  useEffect(() => {
    const sheetId = "1QDkPgvvPx7wwTKlvoDLLwIWlY1z6ladQtoRynOYsHa4";
    const arlistaUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=249861285`;
    const receptUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=263045857`;
    
    Promise.all([
      fetch(arlistaUrl).then(res => res.text()),
      fetch(receptUrl).then(res => res.text())
    ]).then(([arlistaCsv, receptCsv]) => {
      const arRows = arlistaCsv.split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
      const parsedArlista = arRows.slice(1).map(r => ({
        code: r[0],
        label: r[1],
        unit: r[2],
        price: parseInt(r[5]?.replace(/[^0-9]/g, '')) || 0
      })).filter(i => i.label);

      const recRows = receptCsv.split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
      const parsedReceptek = recRows.slice(1).map(r => ({
        parentCode: r[0],
        component: r[2],
        norma: parseFloat(r[3]?.replace(',', '.')) || 0,
        unit: r[4]
      })).filter(r => r.parentCode);

      setFullArlista(parsedArlista);
      setReceptek(parsedReceptek);
    });
  }, []);

  const updateItemTask = (index: number, taskLabel: string) => {
    const foundWork = fullArlista.find(a => a.label === taskLabel);
    if (foundWork) {
      // Anyagköltség számítása a recept alapján
      const relatedRecept = receptek.filter(r => r.parentCode === foundWork.code);
      let currentMatPrice = 0;
      let receptStrings: string[] = [];

      relatedRecept.forEach(res => {
        // Megkeressük az összetevő árát az árlistában (név alapján)
        const componentData = fullArlista.find(a => a.label === res.component);
        const compPrice = componentData ? componentData.price : 0;
        const subTotal = res.norma * compPrice;
        currentMatPrice += subTotal;
        receptStrings.push(`${res.component}: ${res.norma} ${res.unit} (${subTotal} Ft)`);
      });

      const newItems = [...items];
      newItems[index] = { 
        ...newItems[index], 
        task: taskLabel, 
        workPrice: foundWork.price, 
        materialPrice: currentMatPrice,
        unit: foundWork.unit,
        receptText: receptStrings.join(', ')
      };
      setItems(newItems);
    }
  };

  const grandTotal = items.reduce((sum, i) => sum + ((i.workPrice + i.materialPrice) * i.qty), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-32">
      <div className="max-w-md mx-auto space-y-4">
        <header className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-2xl border-b-4 border-blue-600">
          <h1 className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
            <Calculator className="text-blue-500" /> MESTER-KALK
          </h1>
          <p className="text-[10px] uppercase font-bold text-slate-400">Anyag + Munkadíj Számítás</p>
        </header>

        {items.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-3xl shadow-lg border border-slate-200 relative overflow-hidden">
            <select 
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].group = e.target.value;
                setItems(newItems);
              }}
              className="w-full p-3 bg-slate-100 rounded-xl mb-3 text-sm font-bold outline-none"
            >
              <option value="">-- Főcsoport --</option>
              <option value="11">11 - Földmunka</option>
              <option value="21">21 - Kőműves</option>
              <option value="75">75 - Festés</option>
            </select>

            {item.group && (
              <select 
                onChange={(e) => updateItemTask(index, e.target.value)}
                className="w-full p-3 bg-blue-50 rounded-xl mb-3 text-sm font-semibold outline-none ring-1 ring-blue-200"
              >
                <option value="">-- Munkanem választása --</option>
                {fullArlista.filter(a => a.code?.startsWith(item.group)).map((a, i) => (
                  <option key={i} value={a.label}>{a.label}</option>
                ))}
              </select>
            )}

            {item.receptText && (
              <div className="bg-emerald-50 p-3 rounded-xl mb-3 border border-emerald-100">
                <p className="text-[10px] text-emerald-800 leading-relaxed">
                  <span className="font-bold uppercase tracking-wider block mb-1 underline">Anyagszükséglet (számolva):</span>
                  {item.receptText}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <p className="text-[9px] uppercase font-bold text-slate-400">Munkadíj / {item.unit}</p>
                <p className="font-black text-slate-700">{new Intl.NumberFormat('hu-HU').format(item.workPrice)} Ft</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <p className="text-[9px] uppercase font-bold text-slate-400">Anyag / {item.unit}</p>
                <p className="font-black text-emerald-600">{new Intl.NumberFormat('hu-HU').format(item.materialPrice)} Ft</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
              <div className="w-1/3">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Mennyiség</label>
                <input type="number" value={item.qty} onChange={e => {
                  const newItems = [...items];
                  newItems[index].qty = parseFloat(e.target.value) || 0;
                  setItems(newItems);
                }} className="w-full bg-slate-100 p-2 rounded-lg font-black outline-none" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Részösszeg</p>
                <p className="text-xl font-black text-blue-600">
                  {new Intl.NumberFormat('hu-HU').format((item.workPrice + item.materialPrice) * item.qty)} Ft
                </p>
              </div>
            </div>
          </div>
        ))}

        <button onClick={() => setItems([...items, { group: '', task: '', qty: 1, unit: 'm2', workPrice: 0, materialPrice: 0, receptText: '' }])} className="w-full p-4 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-white transition-all">
          <Plus size={20}/> Új tétel hozzáadása
        </button>

        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl border-t-4 border-emerald-500">
          <div className="flex justify-between items-center">
            <div className="text-xs opacity-60 uppercase font-black tracking-widest">Mindösszesen</div>
            <div className="text-4xl font-black text-emerald-400 tracking-tighter">
              {new Intl.NumberFormat('hu-HU').format(grandTotal)} Ft
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
