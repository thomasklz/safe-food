/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Snowflake, ChefHat, MessageSquareCode, BarChart3, ThermometerSun, BookOpen, SearchCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isColdChainOk: boolean;
  hasApiKey: boolean;
}

export default function Navbar({ activeTab, setActiveTab, isColdChainOk, hasApiKey }: NavbarProps) {
  const navItems = [
    { id: 'inventory', label: 'Nevera Inteligente', icon: Snowflake },
    { id: 'safety_lookup', label: 'Consulta por Alimento', icon: SearchCheck },
    { id: 'recipes', label: 'Recetas de Aprovechamiento', icon: ChefHat },
    { id: 'tutor', label: 'Tutor de Inocuidad IA', icon: MessageSquareCode },
    { id: 'audit', label: 'Auditoría e Impacto', icon: BarChart3 },
    { id: 'study', label: 'Caso de Estudio', icon: BookOpen },
  ];

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-emerald-100">
              <ShieldCheck className="h-6 w-6" id="brand-logo" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-800">
                SafeFood <span className="text-emerald-600">IA</span>
              </h1>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-mono font-medium">
                Inocuidad & Nutrición Doméstica
              </p>
            </div>
          </div>

          {/* Quick Stats & Badges */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cold Chain Health Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
              isColdChainOk 
                ? 'bg-cyan-50 text-cyan-700 border-cyan-100' 
                : 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'
            }`}>
              <ThermometerSun className="h-4 w-4" />
              <span>
                Cadena de Frío: {isColdChainOk ? 'Estable (4°C)' : '¡Falla detectada (>5°C)!'}
              </span>
            </div>

            {/* API Key Status */}
            <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
              hasApiKey ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}>
              {hasApiKey ? 'Gemini IA: Activo' : 'Gemini IA: Modo Demo'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 overflow-x-auto py-1 scrollbar-none border-t border-stone-100">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border-b-2 border-emerald-600 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <IconComponent className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-600' : 'text-stone-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
