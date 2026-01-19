'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ClipboardList, ShoppingCart, BarChart3, ChevronRight, HardHat } from 'lucide-react';

export default function MainMenu() {
  const router = useRouter();

  const menuItems = [
    { 
      title: "Napi Jelentés", 
      desc: "Fotó, létszám, haladás", 
      icon: <FileText className="text-blue-500" />, 
      path: "/dashboard", // Ideiglenesen ide mutat, ahol a mostani kódod van
      color: "border-l-blue-500"
    },
    { 
      title: "Munkalap", 
      desc: "Új megrendelés rögzítése", 
      icon: <ClipboardList className="text-emerald-500" />, 
      path: "/munkalap", 
      color: "border-l-emerald-500"
    },
    { 
      title: "Anyagbeszerzés", 
      desc: "Bevásárlólista és hiányok", 
      icon: <ShoppingCart className="text-amber-500" />, 
      path: "#", 
      color: "border-l-amber-500"
    },
    { 
      title: "Statisztika", 
      desc: "Heti és havi összesítők", 
      icon: <BarChart3 className="text-purple-500" />, 
      path: "#", 
      color: "border-l-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <header className="mb-8 mt-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <HardHat size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">RENOVAMASTER</h1>
        </div>
        <p className="text-slate-500 font-medium">Válasszon az alábbi modulok közül:</p>
      </header>

      <div className="grid gap-4">
        {menuItems.map((item, index) => (
          <div 
            key={index}
            onClick={() => item.path !== "#" && router.push(item.path)}
            className={`bg-white p-5 rounded-2xl border-l-4 ${item.color} shadow-sm border-y border-r border-slate-200 flex items-center justify-between active:scale-95 transition-all cursor-pointer`}
          >
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-3 rounded-xl">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{item.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
              </div>
            </div>
            <ChevronRight className="text-slate-300" size={20} />
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-3xl border border-blue-100">
        <p className="text-blue-700 text-sm font-bold mb-1">Mai státusz:</p>
        <p className="text-blue-900 text-xs font-medium opacity-80">Bejelentkezve mint: Miski Norbert</p>
      </div>
    </div>
  );
}


