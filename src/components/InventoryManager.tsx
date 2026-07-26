/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FoodItem, ActivityLog } from '../types';
import { getFoodStatus, FOOD_SAFETY_GUIDELINES } from '../utils';
import {
  Plus, Calendar, Trash2, CheckCircle2, AlertTriangle, Snowflake,
  Smile, ShieldAlert, BadgeInfo, HelpCircle, Flame, Sparkles, ServerCrash,
  ClipboardList, History, ArrowDownToLine, ArrowUpFromLine
} from 'lucide-react';

interface InventoryManagerProps {
  items: FoodItem[];
  setItems: React.Dispatch<React.SetStateAction<FoodItem[]>>;
  fridgeTemp: number;
  setFridgeTemp: (temp: number) => void;
  onLogWaste: (item: FoodItem) => void;
  activityLogs: ActivityLog[];
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
}

export default function InventoryManager({
  items,
  setItems,
  fridgeTemp,
  setFridgeTemp,
  onLogWaste,
  activityLogs,
  setActivityLogs
}: InventoryManagerProps) {
  // Food adding states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodItem['category']>('vegetable');
  const [location, setLocation] = useState<FoodItem['storageLocation']>('fridge');
  const [quantity, setQuantity] = useState('');
  const [storageDate, setStorageDate] = useState(new Date().toISOString().split('T')[0]);
  const [perecidad, setPerecidad] = useState<number>(5); // Default shelf-life in days
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  // AI analysis state
  const [aiAnalysis, setAiAnalysis] = useState<{
    summary: string;
    mainRiskItem: string;
    mainRiskExplanation: string;
    recommendations: string[];
  } | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // Auto-estimate expiration based on category
  const handleCategoryChange = (cat: FoodItem['category']) => {
    setCategory(cat);
    let offsetDays = 5; // Default

    switch (cat) {
      case 'fish':
        offsetDays = 2;
        break;
      case 'meat':
        offsetDays = 2;
        break;
      case 'dairy':
        offsetDays = 5;
        break;
      case 'leftovers':
        offsetDays = 3;
        break;
      case 'vegetable':
      case 'fruit':
        offsetDays = 7;
        break;
      case 'grain':
      case 'other':
        offsetDays = 14;
        break;
    }

    setPerecidad(offsetDays);
    try {
      const today = new Date(storageDate);
      today.setDate(today.getDate() + offsetDays);
      setExpiryDate(today.toISOString().split('T')[0]);
    } catch (e) {
      console.error(e);
    }
  };

  // Bidirectional calculations
  const handleStorageDateChange = (dateVal: string) => {
    setStorageDate(dateVal);
    try {
      const base = new Date(dateVal);
      base.setDate(base.getDate() + perecidad);
      setExpiryDate(base.toISOString().split('T')[0]);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePerecidadChange = (daysVal: number) => {
    setPerecidad(daysVal);
    try {
      const base = new Date(storageDate);
      base.setDate(base.getDate() + daysVal);
      setExpiryDate(base.toISOString().split('T')[0]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExpiryDateChange = (expiryVal: string) => {
    setExpiryDate(expiryVal);
    try {
      const sDate = new Date(storageDate);
      const eDate = new Date(expiryVal);
      const diffTime = eDate.getTime() - sDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setPerecidad(diffDays > 0 ? diffDays : 1);
    } catch (e) {
      console.error(e);
    }
  };

  // Set initial expiration date when form opens
  const openForm = () => {
    setShowAddForm(true);
    handleCategoryChange('vegetable');
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !expiryDate) return;

    const newItem: FoodItem = {
      id: `food_${Date.now()}`,
      name: name.trim(),
      category,
      storageLocation: location,
      quantity: quantity.trim() || '1 unidad',
      storageDate: storageDate || new Date().toISOString().split('T')[0],
      expiryDate,
      notes: notes.trim(),
      perecidad: perecidad
    };

    setItems((prev) => [newItem, ...prev]);

    // Track as a reception event
    setActivityLogs((prev) => [
      {
        id: `activity_${Date.now()}`,
        name: name.trim(),
        action: 'recepcion',
        date: storageDate || new Date().toISOString().split('T')[0],
        quantity: quantity.trim() || '1 unidad',
        category,
        perecidad
      },
      ...prev
    ]);

    // Reset form
    setName('');
    setQuantity('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string, isWaste: boolean) => {
    const itemToDelete = items.find((itm) => itm.id === id);
    if (!itemToDelete) return;

    if (isWaste) {
      onLogWaste(itemToDelete);
    }
    setItems((prev) => prev.filter((itm) => itm.id !== id));

    const itemPerecidad = itemToDelete.perecidad || 5;

    // Track as a consumption event (either utilized or wasted)
    setActivityLogs((prev) => [
      {
        id: `activity_${Date.now()}`,
        name: itemToDelete.name,
        action: isWaste ? 'consumo_desperdiciado' : 'consumo_aprovechado',
        date: new Date().toISOString().split('T')[0],
        quantity: itemToDelete.quantity,
        category: itemToDelete.category,
        perecidad: itemPerecidad
      },
      ...prev
    ]);
  };

  // Send whole inventory to Gemini to perform full safety assessment
  const triggerFridgeSafetyScan = async () => {
    setLoadingAnalysis(true);
    setAnalysisError('');
    setAiAnalysis(null);

    try {
      const res = await fetch('/api/fridge-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        throw new Error('No se pudo procesar la solicitud con el servidor.');
      }

      const data = await res.json();
      setAiAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(
        'El análisis de IA falló. El servidor podría estar en modo demostración. Puedes seguir vigilando las caducidades manualmente mediante las etiquetas de alerta.'
      );
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Get thermometer visual class
  const getThermometerColor = () => {
    if (fridgeTemp < 0) return 'text-sky-500 bg-sky-50 border-sky-200';
    if (fridgeTemp <= 4) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (fridgeTemp <= 6) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse';
  };

  return (
    <div className="space-y-8" id="inventory-manager-view">
      {/* 1. SECTION: COLD LINK SIMULATOR & THERMOMETER */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <Snowflake className="h-5 w-5 text-cyan-600 animate-spin-slow" />
              Simulador Inteligente de Temperatura (SafeFood IA)
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              La temperatura interna ideal del refrigerador es de{' '}
              <strong className="text-emerald-700">2°C a 4°C</strong>. Modifica el termostato a continuación
              para simular cortes de luz o refrigeración deficiente y conoce el impacto en tus alimentos.
            </p>

            {/* Slide control */}
            <div className="flex items-center gap-4 py-3">
              <span className="text-xs font-semibold font-mono text-stone-500">-2°C</span>
              <input
                id="temp-slider"
                type="range"
                min="-2"
                max="12"
                value={fridgeTemp}
                onChange={(e) => setFridgeTemp(parseInt(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-xs font-semibold font-mono text-stone-500">12°C</span>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className={`p-4 rounded-xl border flex flex-col items-center text-center justify-center transition-all duration-300 ${getThermometerColor()}`}>
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                Temperatura de Cabina
              </span>
              <span className="text-3xl font-extrabold font-mono tracking-tight" id="display-temp">
                {fridgeTemp}°C
              </span>

              {fridgeTemp > 4 ? (
                <div className="mt-2 text-xs flex items-center gap-1.5 font-medium text-rose-700">
                  <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                  <span>¡Zona de Peligro! Las bacterias se multiplican de forma acelerada.</span>
                </div>
              ) : fridgeTemp < 0 ? (
                <div className="mt-2 text-xs flex items-center gap-1.5 font-medium text-sky-800">
                  <Flame className="h-4.5 w-4.5 shrink-0 text-cyan-500 rotate-180" />
                  <span>Frío extremo: Riesgo de congelamiento y daño tisular en vegetales.</span>
                </div>
              ) : (
                <div className="mt-2 text-xs flex items-center gap-1.5 font-medium text-emerald-800">
                  <Smile className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
                  <span>Inocuidad garantizada: Rango de mantenimiento óptimo.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION: FOOD CONTROLLER & ADDING FORM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Inventario de Alimentos en Casa</h2>
          <p className="text-sm text-stone-500">
            Controla y monitorea de manera preventiva el estado de frescura y la caducidad de tus ingredientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-scan-fridge"
            onClick={triggerFridgeSafetyScan}
            disabled={loadingAnalysis || items.length === 0}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-100 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            {loadingAnalysis ? 'Escaneando con IA...' : 'Análisis Inocuidad IA'}
          </button>

          <button
            id="btn-show-add"
            onClick={showAddForm ? () => setShowAddForm(false) : openForm}
            className="flex items-center gap-1 bg-stone-900 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            {showAddForm ? 'Cerrar Registro' : 'Registrar Alimento'}
          </button>
        </div>
      </div>

      {/* ADD FORM MODAL-LIKE DRAWER */}
      {showAddForm && (
        <form
          onSubmit={handleAddItem}
          id="add-food-form"
          className="bg-white border border-stone-200 rounded-2xl p-6 shadow-md space-y-4 animate-fadeIn"
        >
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-bold text-lg text-stone-800">Nuevo Alimento</h3>
            <p className="text-xs text-stone-500">Completa el formulario; la IA estimará los días recomendables de conservación.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block text-left">Nombre del Alimento</label>
              <input
                type="text"
                placeholder="Ej. Pechuga de Pollo, Corvina, Brócoli"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-sm px-3.5 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block text-left">Categoría</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as FoodItem['category'])}
                className="w-full text-sm px-3.5 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="vegetable">Vegetales / Hortalizas</option>
                <option value="meat">Carnes Crudas (Pollo, Res, Cerdo)</option>
                <option value="fish">Pescados y Mariscos frescos</option>
                <option value="dairy">Lácteos y Derivados</option>
                <option value="fruit">Frutas frescas</option>
                <option value="leftovers">Comida Cocinada / Sobras</option>
                <option value="grain">Granos y Cereales</option>
                <option value="other">Otros / Condimentos</option>
              </select>
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block text-left">Cantidad / Peso</label>
              <input
                type="text"
                placeholder="Ej. 1 kg, 3 unidades"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-sm px-3.5 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Storage Location */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block text-left">Ubicación</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as FoodItem['storageLocation'])}
                className="w-full text-sm px-3.5 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="fridge">Refrigerador (Nevera)</option>
                <option value="freezer">Congelador</option>
                <option value="pantry">Alacena o Despensa</option>
              </select>
            </div>

            {/* Storage date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block text-left">Fecha de Almacenamiento (Recepción)</label>
              <input
                type="date"
                value={storageDate}
                onChange={(e) => handleStorageDateChange(e.target.value)}
                className="w-full text-sm px-3.5 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>

            {/* Perecidad (Vida útil en días) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-stone-700 block text-left">Días de Perecidad (Vida Útil)</label>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {perecidad} {perecidad === 1 ? 'día' : 'días'}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={perecidad}
                  onChange={(e) => handlePerecidadChange(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={perecidad}
                  onChange={(e) => handlePerecidadChange(parseInt(e.target.value) || 1)}
                  className="w-16 text-xs text-center font-mono py-1 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>
              <p className="text-[10px] text-stone-400 italic">
                {perecidad <= 2 ? '⚠️ Perecedero rápido (Carnes/Pescado)' : perecidad <= 5 ? '🕒 Durabilidad media (Sobras/Lácteos)' : '🌱 Durabilidad alta (Verduras/Granos)'}
              </p>
            </div>

            {/* Expiry date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block text-left">Fecha Estimada de Caducidad</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => handleExpiryDateChange(e.target.value)}
                required
                className="w-full text-sm px-3.5 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Optional notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 block text-left">Notas / Advertencias Nutricionales</label>
            <input
              type="text"
              placeholder="Ej. Guardar alejado de manzanas para que no madure aceleradamente."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm px-3.5 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-stone-600 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-emerald-600 text-white font-semibold hover:bg-emerald-700 px-5 py-2 rounded-lg text-sm transition-colors shadow-sm"
            >
              Confirmar Registro
            </button>
          </div>
        </form>
      )}

      {/* 3. GEMINI SCAN DETAILED ANALYSIS PANEL */}
      {loadingAnalysis && (
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-pulse">
          <Sparkles className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
          <h3 className="font-bold text-stone-800">Analizando con SafeFood IA...</h3>
          <p className="text-xs text-stone-500 max-w-sm">
            Nuestra IA está recalculando el inventario hogareño, evaluando riesgos de proliferación bacteriana y formulando alertas para tu familia.
          </p>
        </div>
      )}

      {analysisError && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
          <ServerCrash className="h-6 w-6 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-bold text-amber-800 text-sm">Modo Demostración Activo</h4>
            <p className="text-xs text-amber-700 leading-relaxed mt-1">
              {analysisError} El monitoreo digital preventivo local sigue activo calculando los tiempos de caducidad en tiempo real.
            </p>
          </div>
        </div>
      )}

      {aiAnalysis && !loadingAnalysis && (
        <div className="bg-gradient-to-br from-emerald-950 to-stone-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-emerald-800/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
            <h3 className="text-lg font-bold tracking-tight">Veredicto e Informe de Inocuidad IA</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest font-mono">
                  Resumen de Estado
                </span>
                <p className="text-sm text-stone-200 block-tight leading-relaxed mt-1">
                  {aiAnalysis.summary}
                </p>
              </div>

              <div className="bg-rose-950/40 border border-rose-800/40 p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-rose-300 font-bold uppercase tracking-widest font-mono flex items-center gap-1">
                  <ShieldAlert className="h-4 w-4" /> Alimento Crítico de Riesgo:
                </span>
                <h4 className="text-base font-bold text-rose-200">{aiAnalysis.mainRiskItem}</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {aiAnalysis.mainRiskExplanation}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest font-mono block">
                Acciones Sanitarias Inmediatas
              </span>
              <ul className="space-y-2 text-sm text-stone-200">
                {aiAnalysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 items-start shrink-0">
                    <span className="bg-emerald-800/50 text-emerald-300 text-xs w-5 h-5 font-bold font-mono rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-2 border-t border-emerald-800/30">
                <p className="text-[11px] text-yellow-300/80 italic">
                  *Advertencia médica: La inocuidad óptima del pollo y pescado cocinado se alcanza a 74°C y 63°C respectivamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN INVENTORY LIST & CARDS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-stone-800 flex items-center gap-1.5">
          <BadgeInfo className="h-5 w-5 text-emerald-600" />
          Ingredientes Almacenados ({items.length})
        </h3>

        {items.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-stone-300 rounded-2xl bg-stone-50/50">
            <HelpCircle className="h-10 w-10 text-stone-400 mx-auto mb-2" />
            <h4 className="font-semibold text-stone-700">No hay alimentos registrados</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Utiliza el botón superior para registrar alimentos de tu nevera. La IA te aconsejará cómo conservarlos mejor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const status = getFoodStatus(item.expiryDate);
              const isColdWarning = fridgeTemp > 4 && item.storageLocation === 'fridge';

              return (
                <div
                  key={item.id}
                  id={`item-card-${item.id}`}
                  className={`bg-white rounded-2xl border transition-all duration-250 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    status.daysLeft < 0
                      ? 'border-rose-200 ring-1 ring-rose-100/50'
                      : status.daysLeft <= 1
                      ? 'border-amber-200'
                      : 'border-stone-200'
                  }`}
                >
                  {/* Card head details */}
                  <div className="p-5 space-y-3 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          item.category === 'meat' ? 'bg-rose-50 text-rose-700' :
                          item.category === 'fish' ? 'bg-cyan-50 text-cyan-700' :
                          item.category === 'vegetable' ? 'bg-emerald-50 text-emerald-700' :
                          item.category === 'dairy' ? 'bg-blue-50 text-blue-700' :
                          'bg-stone-50 text-stone-700'
                        }`}>
                          {item.category === 'meat' ? 'Carne' :
                           item.category === 'fish' ? 'Pescado/Corvina' :
                           item.category === 'vegetable' ? 'Vegetal/Yuca' :
                           item.category === 'dairy' ? 'Lácteo' :
                           item.category === 'fruit' ? 'Fruta' :
                           item.category === 'leftovers' ? 'Sobras' :
                           item.category === 'grain' ? 'Granos' : 'Otro'}
                        </span>
                        <h4 className="text-base font-bold text-stone-800 mt-1">{item.name}</h4>
                      </div>

                      <div className={`p-1.5 rounded-lg text-xs font-semibold ${status.statusIconBg}`}>
                        {status.daysLeft < 0 ? (
                          <AlertTriangle className="h-4.5 w-4.5" />
                        ) : (
                          <span className="font-mono">
                            {status.daysLeft} d{status.daysLeft === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                        <span>Vence en: <strong className={status.statusColor}>{item.expiryDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-stone-400 font-bold shrink-0">Cant:</span>
                        <span className="font-medium text-stone-700">{item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-stone-400 font-bold shrink-0">Ubicación:</span>
                        <span className="font-mono text-stone-700 uppercase tracking-tight text-[11px]">{item.storageLocation === 'fridge' ? 'Nevera' : item.storageLocation === 'freezer' ? 'Congelador' : 'Alacena'}</span>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-xs bg-stone-50 border border-stone-100 p-2.5 rounded-lg text-stone-600 italic block-tight mt-1 leading-relaxed">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}

                    {/* Cold Chain Warning overlay for individual card */}
                    {isColdWarning && (
                      <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-rose-700 text-[11px] flex items-start gap-1.5 leading-normal mt-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                        <span>
                          <strong>Cadena rota:</strong> Se guardaba en la nevera pero la temperatura está por encima de 4°C. Riesgo bacteriológico latente.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex border-t border-stone-100 bg-stone-50/50 p-3 justify-between items-center gap-2">
                    <button
                      id={`btn-consume-${item.id}`}
                      onClick={() => handleDeleteItem(item.id, false)}
                      className="flex items-center gap-1 text-emerald-700 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 px-3 py-1.5 rounded-lg text-xs font-semibold select-none cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Consumido
                    </button>

                    <button
                      id={`btn-waste-${item.id}`}
                      onClick={() => handleDeleteItem(item.id, true)}
                      className="flex items-center gap-1 text-stone-500 hover:text-rose-700 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 px-3 py-1.5 rounded-lg text-xs font-semibold select-none cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Desperdiciado
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. HISTORICAL SYSTEM ACTIVITY LOGS (RECEPCIÓN Y CONSUMO) */}
      <div className="bg-white border border-[#E5EADF] rounded-[24px] p-6 shadow-xs hover:border-[#A5D6A7] transition-all space-y-4 mt-8" id="historial-operaciones">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-[#2E7D32] flex items-center gap-2 font-sans">
              <History className="h-5 w-5 text-[#2E7D32]" />
              Bitácora de Operaciones: Recepción y Consumo
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Historial sistemático para auditar el flujo de alimentos, previniendo focos de contaminación y desperdicios excesivos en casa.
            </p>
          </div>
          <div className="flex gap-2 text-xs font-mono font-bold shrink-0">
            <span className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
              📥 Recepciones: {activityLogs.filter(l => l.action === 'recepcion').length}
            </span>
            <span className="bg-stone-50 text-stone-800 px-3 py-1.5 rounded-xl border border-stone-250 flex items-center gap-1.5">
              🍽️ Consumos: {activityLogs.filter(l => l.action !== 'recepcion').length}
            </span>
          </div>
        </div>

        {activityLogs.length === 0 ? (
          <p className="text-xs text-stone-400 italic text-center py-6">
            Aún no hay recepciones ni consumos registrados. Agrega o consume un alimento para iniciar la auditoría.
          </p>
        ) : (
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left text-xs text-stone-600 font-normal border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 pb-2 text-left">Fecha</th>
                  <th className="py-2.5 pb-2 text-left">Operación</th>
                  <th className="py-2.5 pb-2 text-left">Alimento</th>
                  <th className="py-2.5 pb-2 text-left">Cantidad</th>
                  <th className="py-2.5 pb-2 text-center">Días Perecidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 font-mono text-stone-500 font-medium">{log.date}</td>
                    <td className="py-3 pr-2">
                      {log.action === 'recepcion' ? (
                        <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 text-[10px] border border-blue-100">
                          <ArrowDownToLine className="h-3 w-3 shrink-0" /> Recepción (Ingreso)
                        </span>
                      ) : log.action === 'consumo_aprovechado' ? (
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 text-[10px] border border-emerald-100">
                          <CheckCircle2 className="h-3 w-3 shrink-0" /> Consumo (Aprovechado)
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 text-[10px] border border-rose-100">
                          <ArrowUpFromLine className="h-3 w-3 shrink-0" /> Desperdiciado (Merma)
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-bold text-stone-800">{log.name}</td>
                    <td className="py-3 text-stone-650 font-medium">{log.quantity}</td>
                    <td className="py-3 text-center">
                      <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        log.perecidad <= 2
                          ? 'bg-rose-100 text-rose-800 font-black'
                          : log.perecidad <= 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {log.perecidad} {log.perecidad === 1 ? 'd' : 'ds'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
