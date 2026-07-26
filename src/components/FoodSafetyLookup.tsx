/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FoodSafetyRecord, SafetyConditionCategory } from '../types';
import {
  FOOD_SAFETY_RECORDS,
  queryFoodSafetyData,
  THAWING_GUIDELINES,
  evaluateDynamicFoodSafety,
  DynamicAnalysisResult
} from '../foodSafetyData';
import {
  Search, ShieldAlert, Thermometer, Snowflake, Zap, Utensils,
  CheckCircle2, XCircle, RefreshCw, AlertTriangle, Info, HelpCircle,
  FileText, ArrowRight, Flame, Sparkles, Calendar, Sliders, ShieldCheck
} from 'lucide-react';

interface FoodSafetyLookupProps {
  onAskTutor?: (question: string) => void;
}

export default function FoodSafetyLookup({ onAskTutor }: FoodSafetyLookupProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');

  // Selected Record Modal/Detail View
  const [activeRecord, setActiveRecord] = useState<FoodSafetyRecord | null>(null);

  // Power Outage Simulator State
  const [outageHours, setOutageHours] = useState<number>(3);
  const [showOutageSim, setShowOutageSim] = useState<boolean>(false);

  // --- DYNAMIC CALCULATOR STATES ---
  // Selected food record for dynamic calculation
  const [selectedFoodId, setSelectedFoodId] = useState<string>(FOOD_SAFETY_RECORDS[5].id); // default: Pollo
  // Date picker (defaults to 2 days ago to demonstrate real calculation)
  const defaultDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);
  const [calcDateStr, setCalcDateStr] = useState<string>(defaultDateStr);
  const [calcStorageTemp, setCalcStorageTemp] = useState<number>(3.5); // 3.5°C
  const [calcCondition, setCalcCondition] = useState<'refrigerated' | 'frozen' | 'power_outage' | 'room_temp' | 'hot_hold'>('refrigerated');
  const [calcState, setCalcState] = useState<'crudo' | 'cocinado' | 'abierto'>('crudo');

  // Currently selected food record
  const calcFoodRecord = useMemo(() => {
    return FOOD_SAFETY_RECORDS.find((f) => f.id === selectedFoodId) || FOOD_SAFETY_RECORDS[0];
  }, [selectedFoodId]);

  // Dynamic Analysis Computation (computes instantly in real-time)
  const dynamicResult: DynamicAnalysisResult = useMemo(() => {
    return evaluateDynamicFoodSafety(calcFoodRecord, calcDateStr, calcStorageTemp, calcCondition, calcState);
  }, [calcFoodRecord, calcDateStr, calcStorageTemp, calcCondition, calcState]);

  // Filtered dataset for lookup list
  const filteredRecords = queryFoodSafetyData(searchTerm, selectedCategory, selectedCondition);

  // Categories list
  const categories = [
    { id: 'all', label: 'Todos los Alimentos' },
    { id: 'poultry', label: 'Aves (Pollo/Pavo)' },
    { id: 'meat', label: 'Carnes (Res/Cerdo/Cordero)' },
    { id: 'fish_seafood', label: 'Pescados y Mariscos' },
    { id: 'dairy_cheese', label: 'Lácteos y Quesos' },
    { id: 'eggs', label: 'Huevos' },
    { id: 'leftovers', label: 'Sobras y Guisos' },
    { id: 'produce', label: 'Frutas y Verduras' },
    { id: 'grains_bakery', label: 'Panes y Pasteles' },
    { id: 'sauces_other', label: 'Salsas y Condimentos' },
  ];

  const conditions = [
    { id: 'all', label: 'Todas las Condiciones', icon: Info },
    { id: 'coccion', label: 'Cocción Mínima Segura (°C/°F)', icon: Thermometer },
    { id: 'almacenamiento', label: 'Almacenamiento en Frío (Días/Meses)', icon: Snowflake },
    { id: 'corte_energia', label: 'Corte de Luz / Apagón (¿Mantener o Tirar?)', icon: Zap },
    { id: 'asado_horno', label: 'Asado y Horneado (Tiempos)', icon: Flame },
  ];

  return (
    <div className="space-y-6" id="food-safety-lookup-container">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-[24px] p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-400/20 text-emerald-100 text-xs px-3 py-1 rounded-full font-mono font-bold tracking-wide uppercase border border-emerald-300/30">
              Criterios Oficiales FoodSafety.gov & USDA / FAO
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Análisis Dinámico e Inocuidad Alimentaria
          </h2>
          <p className="text-sm text-emerald-100 leading-relaxed">
            Selecciona cualquier alimento, ingresa la fecha de conservación, ajusta la temperatura y condición en tiempo real para obtener recomendaciones inmediatas y diagnóstico microbiológico.
          </p>
        </div>

        {/* QUICK STATS IN BANNER */}
        <div className="mt-5 pt-4 border-t border-emerald-600/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium text-emerald-100">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-emerald-300" />
            <span>Pollo: 74°C (165°F)</span>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-emerald-300" />
            <span>Pescado: 63°C (145°F)</span>
          </div>
          <div className="flex items-center gap-2">
            <Snowflake className="h-4 w-4 text-emerald-300" />
            <span>Nevera: ≤4°C (40°F)</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-300" />
            <span>Corte &gt;2h: Reevaluar</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REAL-TIME DYNAMIC EVALUATOR PANEL (Interactive: Food + Date + Temp + Condition) */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 border-emerald-600/30 rounded-[24px] p-6 shadow-md space-y-6" id="dynamic-evaluator-panel">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
                Análisis Dinámico en Tiempo Real
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <h3 className="text-xl font-black text-stone-850 mt-1">
              Evaluador Interactivo por Alimento, Fecha y Temperatura
            </h3>
          </div>
          <span className="text-xs text-stone-500 font-mono bg-stone-100 px-3 py-1 rounded-lg">
            Cambia los parámetros abajo para actualizar las recomendaciones automáticamente
          </span>
        </div>

        {/* INPUT CONTROLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. SELECTOR DE ALIMENTO */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase font-mono text-stone-700 flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5 text-emerald-600" />
              1. Selecciona Alimento:
            </label>
            <select
              id="select-calc-food"
              value={selectedFoodId}
              onChange={(e) => setSelectedFoodId(e.target.value)}
              className="w-full bg-[#F8FAF7] border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {FOOD_SAFETY_RECORDS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.foodName} ({f.subType || f.category})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-stone-500 font-medium">
              Categoría: <strong className="text-stone-700 capitalize">{calcFoodRecord.category.replace('_', ' ')}</strong>
            </p>
          </div>

          {/* 2. FECHA DE RECEPCIÓN / INGRESO */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase font-mono text-stone-700 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" />
              2. Fecha de Guardado:
            </label>
            <input
              id="input-calc-date"
              type="date"
              value={calcDateStr}
              onChange={(e) => setCalcDateStr(e.target.value)}
              className="w-full bg-[#F8FAF7] border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-emerald-800 font-semibold">
              ⏱️ Transcurridos: <span className="underline font-bold">{dynamicResult.daysElapsed} día(s)</span>
            </p>
          </div>

          {/* 3. TEMPERATURA DE ALMACENAMIENTO (°C) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold uppercase font-mono text-stone-700 flex items-center gap-1.5">
                <Thermometer className="h-3.5 w-3.5 text-emerald-600" />
                3. Temperatura (°C):
              </label>
              <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-md ${
                calcStorageTemp <= 4.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {calcStorageTemp}°C ({Math.round(calcStorageTemp * 1.8 + 32)}°F)
              </span>
            </div>

            <input
              id="range-calc-temp"
              type="range"
              min="-20"
              max="25"
              step="0.5"
              value={calcStorageTemp}
              onChange={(e) => setCalcStorageTemp(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            {/* Quick Temp Presets */}
            <div className="flex gap-1 overflow-x-auto text-[10px] font-bold">
              <button
                onClick={() => { setCalcStorageTemp(-18); setCalcCondition('frozen'); }}
                className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded hover:bg-cyan-200 shrink-0 cursor-pointer"
              >
                Congelador (-18°C)
              </button>
              <button
                onClick={() => { setCalcStorageTemp(3.5); setCalcCondition('refrigerated'); }}
                className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded hover:bg-emerald-200 shrink-0 cursor-pointer"
              >
                Nevera (3.5°C)
              </button>
              <button
                onClick={() => { setCalcStorageTemp(8); setCalcCondition('refrigerated'); }}
                className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded hover:bg-amber-200 shrink-0 cursor-pointer"
              >
                Entibiada (8°C)
              </button>
              <button
                onClick={() => { setCalcStorageTemp(22); setCalcCondition('room_temp'); }}
                className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded hover:bg-rose-200 shrink-0 cursor-pointer"
              >
                Ambiente (22°C)
              </button>
            </div>
          </div>

          {/* 4. CONDICIÓN Y ESTADO */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase font-mono text-stone-700 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-emerald-600" />
              4. Condición y Estado:
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <select
                id="select-calc-condition"
                value={calcCondition}
                onChange={(e) => setCalcCondition(e.target.value as any)}
                className="bg-[#F8FAF7] border border-stone-300 rounded-xl px-2 py-2 text-[11px] font-bold text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="refrigerated">Refrigeración (≤4°C)</option>
                <option value="frozen">Congelado (-18°C)</option>
                <option value="power_outage">Corte de Luz / Apagón</option>
                <option value="room_temp">Temp. Ambiente (&gt;20°C)</option>
              </select>

              <select
                id="select-calc-state"
                value={calcState}
                onChange={(e) => setCalcState(e.target.value as any)}
                className="bg-[#F8FAF7] border border-stone-300 rounded-xl px-2 py-2 text-[11px] font-bold text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="crudo">Crudo / Fresco</option>
                <option value="cocinado">Cocinado / Sobras</option>
                <option value="abierto">Paquete Abierto</option>
              </select>
            </div>
            <p className="text-[11px] text-stone-500">
              Afecta el tiempo de degradación y riesgo.
            </p>
          </div>

        </div>

        {/* DYNAMIC RESULT OUTPUT DISPLAY BOX */}
        <div className={`rounded-[20px] p-5 border-2 space-y-4 transition-all animate-fadeIn ${
          dynamicResult.status === 'SAFE'
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : dynamicResult.status === 'WARNING'
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : 'bg-rose-50/80 border-rose-300 text-rose-950'
        }`}>
          
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-200/60 pb-3">
            <div>
              <span className={`inline-block text-xs font-black font-mono uppercase px-3 py-1 rounded-full border shadow-xs ${dynamicResult.badgeClass}`}>
                {dynamicResult.statusTitle}
              </span>
              <h4 className="text-lg font-black mt-2">
                Evaluación Inocuidad: <span className="underline">{calcFoodRecord.foodName}</span>
              </h4>
            </div>

            {/* Life Gauge Bar */}
            <div className="w-full sm:w-64 bg-stone-200/80 h-4 rounded-full overflow-hidden p-0.5 border border-stone-300 shrink-0">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  dynamicResult.status === 'SAFE'
                    ? 'bg-emerald-600'
                    : dynamicResult.status === 'WARNING'
                    ? 'bg-amber-500'
                    : 'bg-rose-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, dynamicResult.percentUsed))}%` }}
              />
              <span className="text-[10px] font-bold font-mono text-stone-600 block text-right mt-1">
                Límite usado: {dynamicResult.daysElapsed} de {dynamicResult.maxSafeDays} días ({dynamicResult.percentUsed}%)
              </span>
            </div>
          </div>

          {/* Actionable Recommendation */}
          <div className="bg-white/90 p-4 rounded-xl border border-stone-200/80 space-y-2 shadow-xs">
            <h5 className="text-xs font-extrabold uppercase font-mono text-stone-700 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Recomendación Directa de Acción:
            </h5>
            <p className="text-sm font-bold text-stone-900 leading-relaxed">
              {dynamicResult.actionableRecommendation}
            </p>
          </div>

          {/* Detailed Points & Microbial Risk */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* Left: Thermal Zone & Points */}
            <div className="bg-white/80 p-3.5 rounded-xl border border-stone-200 space-y-2">
              <span className="font-extrabold uppercase font-mono text-stone-700 text-[11px] block">
                🌡️ Clasificación Térmica:
              </span>
              <p className="font-bold text-stone-850">
                {dynamicResult.temperatureZone}
              </p>
              <p className="text-stone-600 text-[11px] leading-snug">
                {dynamicResult.zoneDescription}
              </p>

              <ul className="list-disc pl-4 space-y-1 text-stone-700 pt-1">
                {dynamicResult.detailedPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            {/* Right: Microbiology & Cooking */}
            <div className="bg-white/80 p-3.5 rounded-xl border border-stone-200 space-y-2">
              <span className="font-extrabold uppercase font-mono text-rose-800 text-[11px] block flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                Diagnóstico Microbiológico & Preocupación:
              </span>
              <p className="text-stone-800 font-medium leading-relaxed">
                {dynamicResult.microbialRiskInfo}
              </p>

              {dynamicResult.cookingInstructions && (
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2 space-y-1">
                  <span className="font-extrabold text-amber-900 font-mono text-[10px] uppercase block">
                    🔥 Instrucciones Mínimas de Cocción Segura
                  </span>
                  <p className="font-extrabold text-amber-950 text-xs">
                    Temperatura Interna Exigida: {dynamicResult.cookingInstructions.minTempC}°C ({dynamicResult.cookingInstructions.minTempF}°F)
                    {dynamicResult.cookingInstructions.restTimeMinutes ? ` (+ ${dynamicResult.cookingInstructions.restTimeMinutes} min reposo)` : ''}
                  </p>
                  {dynamicResult.cookingInstructions.indicator && (
                    <p className="text-[10px] text-stone-600">
                      <strong>Indicador:</strong> {dynamicResult.cookingInstructions.indicator}
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Quick AI Tutor Query Button */}
          {onAskTutor && (
            <div className="pt-2 flex justify-end">
              <button
                id="btn-ask-tutor-dynamic"
                onClick={() => onAskTutor(`Tengo un problema de inocuidad con ${calcFoodRecord.foodName}. Ingresó el ${calcDateStr} (${dynamicResult.daysElapsed} días), a ${calcStorageTemp}°C en estado ${calcState}. ¿Qué debo hacer?`)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
                Preguntar Asesoría Profunda al Tutor IA
              </button>
            </div>
          )}

        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white border border-[#E5EADF] rounded-[24px] p-5 shadow-xs space-y-4">
        
        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input
            id="input-food-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar alimento en el catálogo completo (ej: Pollo, Corvina, Huevos, Queso fresco, Leche, Sobras, Tocino, Arroz, Yuca...)"
            className="w-full pl-11 pr-4 py-3 bg-[#F8FAF7] border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 bg-stone-200 px-2 py-1 rounded-md"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Condition Category Buttons */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 font-mono">
            Filtrar por Condición / Escenario:
          </label>
          <div className="flex flex-wrap gap-2">
            {conditions.map((cond) => {
              const IconComp = cond.icon;
              const isSelected = selectedCondition === cond.id;
              return (
                <button
                  key={cond.id}
                  id={`btn-cond-${cond.id}`}
                  onClick={() => setSelectedCondition(cond.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <IconComp className="h-3.5 w-3.5" />
                  {cond.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Food Category Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 font-mono">
            Categoría de Alimento:
          </label>
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`btn-cat-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap transition-all font-medium cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                    : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK POWER OUTAGE SIMULATOR TOGGLE */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-[20px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white p-2.5 rounded-xl shadow-xs">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              ¿Tuviste un Corte de Luz / Apagón en Casa?
            </h4>
            <p className="text-xs text-amber-700">
              Evalúa al instante qué alimentos se conservan seguros y cuáles debes desechar según la norma del USDA.
            </p>
          </div>
        </div>

        <button
          id="btn-toggle-outage-sim"
          onClick={() => setShowOutageSim(!showOutageSim)}
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          {showOutageSim ? 'Ocultar Evaluador de Apagón' : '⚡ Abrir Evaluador de Apagón'}
        </button>
      </div>

      {/* POWER OUTAGE EVALUATOR PANEL */}
      {showOutageSim && (
        <div className="bg-stone-900 text-stone-100 rounded-[24px] p-6 shadow-xl space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-800 pb-4">
            <div>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                Protocolo de Emergencia por Corte Eléctrico
              </span>
              <h3 className="text-xl font-bold mt-1 text-white">
                Simulador de Riesgo por Temperatura en Apagón
              </h3>
            </div>

            {/* Hours Selector */}
            <div className="flex items-center gap-2 bg-stone-800 p-1.5 rounded-xl border border-stone-700">
              <span className="text-xs text-stone-400 font-medium pl-2">Duración del apagón:</span>
              <select
                id="select-outage-hours"
                value={outageHours}
                onChange={(e) => setOutageHours(Number(e.target.value))}
                className="bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value={1}>1 hora (Seguro en refri cerrado)</option>
                <option value={2}>2 horas (Límite crítico)</option>
                <option value={4}>4 horas (Límite máximo refri cerrado)</option>
                <option value={6}>6 horas (Falla refrigeración)</option>
                <option value={12}>12+ horas (Extremo)</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            {outageHours <= 4 ? (
              <span className="text-emerald-400 font-semibold">
                ✓ Un refrigerador cerrado mantendrá los alimentos fríos hasta por 4 horas. Evita abrir la puerta innecesariamente.
              </span>
            ) : (
              <span className="text-rose-400 font-semibold">
                ⚠️ Superadas las 4 horas de corte sin electricidad, la temperatura interna excede los 4°C. Alimentos perecederos crudos o cocidos deben DESECHARSE.
              </span>
            )}
          </p>

          {/* Table of Keep vs Discard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DISCARD COLUMN */}
            <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm border-b border-rose-900/40 pb-2">
                <XCircle className="h-5 w-5" />
                <span>DESECHAR Si se expone &gt;2 horas a &gt;4°C:</span>
              </div>
              <ul className="text-xs text-stone-300 space-y-1.5 list-disc pl-4">
                <li>Carne, pollo, pavo, pescado y mariscos (crudos o cocinados)</li>
                <li>Leche, yogur, nata, crema agria y fórmula de bebé</li>
                <li>Quesos blandos (Queso fresco, Mozzarella, Ricotta, Brie)</li>
                <li>Quesos rallados o bajos en grasa</li>
                <li>Huevos frescos, huevos duros y platos con huevo</li>
                <li>Sobras de comida, sopas, guisos, arroz y pasta cocida</li>
                <li>Ensaladas con mayonesa, vegetales cortados o prelavados</li>
                <li>Pasteles de crema, tarta de queso, salsas cremosas</li>
              </ul>
            </div>

            {/* KEEP COLUMN */}
            <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-emerald-900/40 pb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>MANTENER / CONSERVAR Seguros:</span>
              </div>
              <ul className="text-xs text-stone-300 space-y-1.5 list-disc pl-4">
                <li>Quesos duros (Cheddar, Parmesano, Suizo, Provolone)</li>
                <li>Mantequilla y margarina (bien tapadas)</li>
                <li>Queso parmesano/romano rallado seco en frasco</li>
                <li>Frutas y verduras enteras frescas sin cortar</li>
                <li>Panes, bollos, tortillas, galletas y tartas de fruta</li>
                <li>Mermeladas, kétchup, mostaza, salsa barbacoa, de soya</li>
                <li>Mantequilla de maní y vinagretas abiertas</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS GRID */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            Catálogo Oficial de Inocuidad ({filteredRecords.length} alimentos)
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            Fuente: Tablas de Inocuidad FoodSafety.gov
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-[20px] p-8 text-center space-y-3">
            <Search className="h-10 w-10 text-stone-300 mx-auto" />
            <h4 className="text-base font-bold text-stone-700">No se encontraron alimentos</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Intenta buscar términos generales como &apos;Pollo&apos;, &apos;Res&apos;, &apos;Pescado&apos;, &apos;Huevos&apos;, &apos;Queso&apos;, &apos;Arroz&apos;, &apos;Yuca&apos; o restablece los filtros.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedCondition('all');
              }}
              className="bg-emerald-50 text-emerald-700 font-bold text-xs px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((rec) => {
              // Determine action badge style
              const isDiscard = rec.powerOutageAction === 'DESECHAR';
              const isKeep = rec.powerOutageAction === 'MANTENER';

              return (
                <div
                  key={rec.id}
                  id={`card-rec-${rec.id}`}
                  className="bg-white border border-[#E5EADF] hover:border-emerald-300 rounded-[20px] p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md group"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold font-mono uppercase bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                          {rec.category.replace('_', ' ')}
                        </span>
                        <h4 className="text-base font-extrabold text-stone-850 mt-1 leading-snug group-hover:text-emerald-700 transition-colors">
                          {rec.foodName}
                        </h4>
                        {rec.subType && (
                          <p className="text-xs text-stone-500 font-medium">
                            {rec.subType}
                          </p>
                        )}
                      </div>

                      {/* Action Tag for Power Outages */}
                      {rec.powerOutageAction && (
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md shrink-0 flex items-center gap-1 ${
                          isDiscard
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isKeep
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {isDiscard && <XCircle className="h-3 w-3" />}
                          {isKeep && <CheckCircle2 className="h-3 w-3" />}
                          {rec.powerOutageAction}
                        </span>
                      )}
                    </div>

                    {/* KEY METRICS GRID */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      {/* Cooking Temp */}
                      {rec.minCookingTempC && (
                        <div className="bg-[#F8FAF7] border border-stone-200/80 p-2 rounded-xl">
                          <span className="text-[10px] font-bold text-stone-400 uppercase font-mono block">
                            Cocción Mínima
                          </span>
                          <span className="font-extrabold text-emerald-700 text-sm">
                            {rec.minCookingTempC}°C
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium ml-1">
                            ({rec.minCookingTempF}°F)
                          </span>
                          {rec.restTimeMinutes ? (
                            <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                              + Reposo: {rec.restTimeMinutes} min
                            </p>
                          ) : null}
                        </div>
                      )}

                      {/* Fridge Storage */}
                      {rec.fridgeDays && (
                        <div className="bg-[#F8FAF7] border border-stone-200/80 p-2 rounded-xl">
                          <span className="text-[10px] font-bold text-stone-400 uppercase font-mono block">
                            Nevera (&le;4°C)
                          </span>
                          <span className="font-bold text-stone-800 text-xs">
                            {rec.fridgeDays}
                          </span>
                        </div>
                      )}

                      {/* Freezer Storage */}
                      {rec.freezerMonths && (
                        <div className="bg-[#F8FAF7] border border-stone-200/80 p-2 rounded-xl col-span-2">
                          <span className="text-[10px] font-bold text-stone-400 uppercase font-mono block">
                            Congelador (-18°C)
                          </span>
                          <span className="font-semibold text-cyan-800 text-xs">
                            {rec.freezerMonths}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Recommendation summary text */}
                    <p className="text-xs text-stone-600 leading-relaxed bg-stone-50/70 p-2.5 rounded-xl border border-stone-100">
                      {rec.recommendationSummary}
                    </p>

                    {/* Microbiology / Warning if any */}
                    {rec.microbiologyWarning && (
                      <p className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-lg flex items-start gap-1.5 border border-amber-100 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{rec.microbiologyWarning}</span>
                      </p>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <button
                      id={`btn-analyze-item-${rec.id}`}
                      onClick={() => {
                        setSelectedFoodId(rec.id);
                        // Scroll to dynamic calculator
                        document.getElementById('dynamic-evaluator-panel')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      ⚡ Analizar Dinámicamente
                    </button>

                    <button
                      id={`btn-detail-${rec.id}`}
                      onClick={() => setActiveRecord(rec)}
                      className="text-stone-500 hover:text-stone-800 text-xs font-semibold cursor-pointer"
                    >
                      Ver Ficha
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* THAWING CHART SECTION */}
      <div className="bg-white border border-[#E5EADF] rounded-[24px] p-6 shadow-xs space-y-4">
        <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
          <div className="bg-cyan-100 text-cyan-800 p-2 rounded-xl">
            <Snowflake className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-850">
              Guía Oficial de Descongelación Segura de Alimentos
            </h3>
            <p className="text-xs text-stone-500">
              Nunca descongelar alimentos sobre el mostrador a temperatura ambiente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {THAWING_GUIDELINES.map((guide, idx) => (
            <div key={idx} className="bg-[#F8FAF7] border border-stone-200 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-mono">
                  {guide.badge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-stone-850">{guide.method}</h4>
              <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                ⏱️ {guide.ratio}
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                {guide.safetyNote}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL MODAL FOR A SELECTED RECORD */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-xl w-full p-6 space-y-5 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Ficha Oficial FoodSafety.gov
                </span>
                <h3 className="text-xl font-black text-stone-850 mt-1">
                  {activeRecord.foodName}
                </h3>
                {activeRecord.subType && (
                  <p className="text-xs text-stone-500 font-medium">{activeRecord.subType}</p>
                )}
              </div>
              <button
                onClick={() => setActiveRecord(null)}
                className="text-stone-400 hover:text-stone-800 p-1 rounded-lg text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Temp Box */}
              {activeRecord.minCookingTempC && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1">
                  <span className="font-bold text-amber-900 uppercase tracking-wider block font-mono">
                    🔥 Cocción Mínima Interna Recomendada
                  </span>
                  <div className="text-2xl font-black text-amber-900">
                    {activeRecord.minCookingTempC}°C <span className="text-sm font-normal text-amber-700">({activeRecord.minCookingTempF}°F)</span>
                  </div>
                  {activeRecord.restTimeMinutes ? (
                    <p className="text-amber-800 font-bold">
                      ⏱️ Tiempo de reposo obligatorio: {activeRecord.restTimeMinutes} minutos
                    </p>
                  ) : null}
                  {activeRecord.cookingVisualIndicator && (
                    <p className="text-stone-700 mt-1">
                      <strong>Indicador visual:</strong> {activeRecord.cookingVisualIndicator}
                    </p>
                  )}
                </div>
              )}

              {/* Storage */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl">
                  <span className="font-bold text-stone-500 uppercase text-[10px] block font-mono">
                    Refrigerador (4°C / 40°F)
                  </span>
                  <span className="font-bold text-stone-850 text-sm">{activeRecord.fridgeDays || 'N/A'}</span>
                </div>
                <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl">
                  <span className="font-bold text-stone-500 uppercase text-[10px] block font-mono">
                    Congelador (-18°C / 0°F)
                  </span>
                  <span className="font-bold text-cyan-800 text-sm">{activeRecord.freezerMonths || 'N/A'}</span>
                </div>
              </div>

              {/* Roasting */}
              {activeRecord.roastingTiming && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <span className="font-bold text-emerald-900 uppercase text-[10px] block font-mono">
                    🍗 Asado / Horneado
                  </span>
                  <p className="text-emerald-950 font-semibold">{activeRecord.roastingTiming}</p>
                </div>
              )}

              {/* Summary */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 leading-relaxed">
                <strong className="block text-stone-700 mb-1">Resumen de Inocuidad:</strong>
                {activeRecord.recommendationSummary}
              </div>

              {activeRecord.microbiologyWarning && (
                <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-xl">
                  <strong>Microbiología:</strong> {activeRecord.microbiologyWarning}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setActiveRecord(null)}
                className="bg-stone-200 text-stone-800 text-xs font-bold px-4 py-2 rounded-xl hover:bg-stone-300 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
