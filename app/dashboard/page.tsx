// Importáld az adatot a fájl elején
import masterData from '@/lib/master_arlista.json';

// ... a komponensen belül ...
const selectedItem = masterData.munkanemek["47_hidegburkolas"].tetelek[0]; // Példa választás

// A Dashboard Bal Alsó részén:
<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
    <Layers className="text-purple-600" /> Rétegrend: {selectedItem.nev}
  </h2>
  <div className="space-y-2">
    <p className="text-sm font-bold text-slate-500">KÓD: {selectedItem.kod}</p>
    <p className="text-slate-600 italic">Alkalmazás: {selectedItem.alkalmazas}</p>
    {/* Itt később a normákat is listázhatjuk */}
  </div>
</div>
