'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, ArrowLeft, Loader2, Info } from 'lucide-react';
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
  const [items, setItems] = useState([{ group: '', task: '', qty: 1, unit: 'm2', price: 0, receptText: '' }]);

  const REZSIORADIJ = 9250;

  useEffect(() => {
    const sheetId = "1QDkPgvvPx7wwTKlvoDLLwIWlY1z6ladQtoRynOYsHa4";
    // Itt a gid=249861285 az ÁRLISTA fül, a gid=263045857 pedig a RECEPT fül
    const arlistaUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=249861285`;
    const receptUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=263045857`;
    
    // Mindkét fül betöltése párhuzamosan
    Promise.all([
      fetch(arlistaUrl).then(res => res.text()),
      fetch(receptUrl).then(res => res.text())
    ]).then(([arlistaCsv, receptCsv]) => {
      
      // 1. Árlista feldolgozása
      const arlistaRows = arlistaCsv.split('\n').map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/^"|"$/g, '').trim()));
      const parsedArlista = arlistaRows.slice(1).map(r => {
        const rawPrice = r[5] ? r[5].replace(/[^0-9]/g, '') : "0";
        return { code: r[0], label: r[1], unit: r[2], price: parseInt(rawPrice) || 0 };
      }).filter(i => i.label);

      // 2. Receptek feldolgozása
      const receptRows = receptCsv.split('\n').map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/^"|"$/g, '').trim()));
      const parsedReceptek = receptRows.slice(1).map(r => ({
        code: r[0],
        osszetevo: r[2],
        norma: r[3],
        egyseg: r[4]
      })).filter(r => r.code);

      setFullArlista(parsedArlista);
      setReceptek(parsedReceptek);
    });
  }, []);

  const updateItemTask = (index: number, taskLabel: string) => {
    const found = fullArlista.find(a => a.label === taskLabel);
    if (found) {
      // Megkeressük a kódhoz tartozó összes recept összetevőt
      const hozzaValok = receptek
        .filter(r => r.code === found.code)
        .map(r => `${r.osszetevo}: ${r.norma} ${r.egyseg}`)
        .join(', ');

      const newItems = [...items];
      newItems[index] = { 
        ...newItems[index], 
        task: taskLabel, 
        price: found.price, 
        unit: found.unit,
        receptText: hozzaValok 
      };
      setItems(newItems);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-32">
      <div className="max-w-md mx-auto space-y-4">
        <header className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
          <h1 className="text-xl font-black italic">Mester Kalkulátor</h1>
          <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest">Adatok szinkronizálva</p>
        </header>

        {items.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-3xl shadow-md border border-slate-200 relative">
            <select 
              value={item.group} 
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].group = e.target.value;
                setItems(newItems);
              }}
              className="w-full p-3 bg-blue-50 rounded-xl mb-3 text-sm font-bold outline-none"
            >
              <option value="">-- Válasszon szakágat --</option>
              <option value="11">11 - Földmunka</option>
              <option value="21">21 - Kőművesmunka</option>
              {/* Ide jöhet a többi kód... */}
            </select>

            {item.group && (
              <select 
                value={item.task} 
                onChange={(e) => updateItemTask(index, e.target.value)}
                className="w-full p-3 bg-emerald-50 rounded-xl mb-3 text-sm font-medium outline-none"
              >
                <option value="">-- Válasszon munkanemet --</option>
                {fullArlista
                  .filter(a => a.code?.startsWith(item.group))
                  .map((a, i) => <option key={i} value={a.label}>{a.label}</option>)}
              </select>
            )}

            {/* Itt jelenik meg a recept a tulajdonosnak */}
            {item.receptText && (
              <div className="bg-amber-50 p-3 rounded-xl mb-3 flex items-start gap-2 border border-amber-100">
                <Info size={16} className="text-amber-600 mt-1 flex-shrink-0" />
                <p className="text-[11px] text-amber-800 italic">
                  <strong>Anyagszükséglet:</strong> {item.receptText}
                </p>
              </div>
            )}

            <div className="flex gap-4 items-end">
              <div className="w-1/2">
                <label className="text-[10px] font-bold text-slate-400 mb-1 block">Mennyiség ({item.unit})</label>
                <input type="number" value={item.qty} onChange={e => {
                  const newItems = [...items];
                  newItems[index].qty = parseFloat(e.target.value) || 0;
                  setItems(newItems);
                }} className="w-full p-3 bg-slate-100 rounded-xl font-black outline-none" />
              </div>
              <div className="w-1/2 text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Összeg</p>
                <p className="text-lg font-black text-slate-800">
                   {new Intl.NumberFormat('hu-HU').format(item.price * item.qty)} Ft
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl">
          <div className="text-xs opacity-60 uppercase font-black mb-1">Fizetendő összesen</div>
          <div className="text-3xl font-black text-emerald-400">{new Intl.NumberFormat('hu-HU').format(totalAmount)} Ft</div>
        </div>
      </div>
    </div>
  );
}
