/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import InventoryManager from './components/InventoryManager';
import FoodSafetyLookup from './components/FoodSafetyLookup';
import { FoodItem, ActivityLog, ChatMessage, Recipe } from './types';
import { getInitialFoodItems, getFoodStatus, FOOD_SAFETY_GUIDELINES, getKitchenAuditQuestions } from './utils';
import {
  Sparkles, ShieldAlert, Droplet, Check, RefreshCw, Send, BrainCircuit,
  Award, HelpCircle, User, ArrowRight, BookOpen, AlertCircle, ThermometerSun, CheckCircle2
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('inventory');

  // Shared Inventory State
  const [items, setItems] = useState<FoodItem[]>(() => getInitialFoodItems());
  const [fridgeTemp, setFridgeTemp] = useState<number>(3.5);

  // Activity Logging (Recepción & Consumo)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: 'activity_init_1',
      name: 'Pescado Fresco (Corvina)',
      action: 'recepcion',
      date: '2026-05-25',
      quantity: '2 filetes (~800g)',
      category: 'fish',
      perecidad: 2
    },
    {
      id: 'activity_init_2',
      name: 'Leche Pasteurizada',
      action: 'recepcion',
      date: '2026-05-24',
      quantity: '1 litro (abierto)',
      category: 'dairy',
      perecidad: 5
    },
    {
      id: 'activity_init_3',
      name: 'Yuca Fresca (Nutrenes)',
      action: 'recepcion',
      date: '2026-05-24',
      quantity: '3 unidades medianas',
      category: 'vegetable',
      perecidad: 10
    },
    {
      id: 'activity_init_4',
      name: 'Pechuga de Pollo Cruda',
      action: 'recepcion',
      date: '2026-05-23',
      quantity: '1 kg',
      category: 'meat',
      perecidad: 2
    },
    {
      id: 'activity_init_5',
      name: 'Zanahorias',
      action: 'consumo_aprovechado',
      date: '2026-05-25',
      quantity: '5 unidades',
      category: 'vegetable',
      perecidad: 7
    },
    {
      id: 'activity_init_6',
      name: 'Sopa de Vegetales',
      action: 'consumo_aprovechado',
      date: '2026-05-26',
      quantity: '1 porción',
      category: 'leftovers',
      perecidad: 3
    },
    {
      id: 'activity_init_7',
      name: 'Cilantro fresco',
      action: 'consumo_desperdiciado',
      date: '2026-05-26',
      quantity: '1 manojo',
      category: 'vegetable',
      perecidad: 3
    }
  ]);

  // Live Stats States
  const [hydration, setHydration] = useState<number>(2.1);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [statsWastedCount, setStatsWastedCount] = useState<number>(1);
  const [statsWastedWeight, setStatsWastedWeight] = useState<number>(150); // in grams
  const [statsConsumedCount, setStatsConsumedCount] = useState<number>(4); // initial baseline

  // Tutor Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '¡Hola! Soy tu **Tutor de Inocuidad SafeFood IA**. Estoy entrenado con criterios de la FAO y microbiología de alimentos para ayudarte a prevenir intoxicaciones en el hogar. Puedes preguntarme sobre temperaturas de cocción, desinfección de la Yuca, refrigeración del Pescado o cómo evitar la contaminación cruzada. ¿En qué puedo orientarte hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        '¿A qué temperatura se cocina el Pollo?',
        '¿Cómo evito la contaminación cruzada?',
        '¿Es seguro refrigerar la Yuca cocida?',
        '¿Qué bacterias crecen a temperatura ambiente?'
      ]
    }
  ]);
  const [userInput, setUserInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Recipe Suggestion States
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [pantryAdditions, setPantryAdditions] = useState<string>('Cebolla, Tomate, Limón, Cilantro, Ajo');
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [recipeLoading, setRecipeLoading] = useState<boolean>(false);
  const [recipeError, setRecipeError] = useState<string>('');

  // Household Audit States
  const [auditQuestions, setAuditQuestions] = useState(() => getKitchenAuditQuestions());
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  // Check API Key Availability
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch((err) => console.warn('No se pudo verificar configuración API:', err));
  }, []);

  // Determine if general Cold Chain is OK (<= 4°C is optimal)
  const isColdChainOk = fridgeTemp <= 4.0;

  // Handle food items logged as waste
  const handleWasteLog = (item: FoodItem) => {
    setStatsWastedCount((prev) => prev + 1);
    // Rough estimate weight mapping
    let grams = 500;
    if (item.quantity.includes('kg')) grams = 1000;
    else if (item.quantity.includes('g')) {
      const parsed = parseInt(item.quantity.replace(/\D/g, ''));
      if (!isNaN(parsed)) grams = parsed;
    }
    setStatsWastedWeight((prev) => prev + grams);
  };

  // Chat message submit
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setUserInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map((m) => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Servidor fuera de línea o sin Clave API.');
      }

      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: 'model',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      // Offline/Demo Mode Smart Fallback Response to maintain premium interactive feeling
      setTimeout(() => {
        let fallbackText = '';
        const lowercaseText = textToSend.toLowerCase();

        if (lowercaseText.includes('pollo') || lowercaseText.includes('ave')) {
          fallbackText = '### 🍗 Tip Científico de Inocuidad: Temperatura del Pollo\n\nEl pollo y todas las aves de corral deben alcanzar una **temperatura interna de cocción mínima de 74°C (165°F)** para destruir patógenos letales como *Salmonella enterica* y *Campylobacter jejuni*.\n\n* **Consejo de Oro:** Usa un termómetro digital de alimentos insertado en la parte más gruesa del muslo (sin tocar el hueso). Nunca laves el pollo crudo bajo el chorro de agua, ya que las gotas de agua salpican bacterias hasta a un metro de distancia, provocando contaminación cruzada en platos listos de tu cocina.';
        } else if (lowercaseText.includes('pescado') || lowercaseText.includes('corvina')) {
          fallbackText = '### 🐟 Tip de Inocuidad: Mariscos y Pescados\n\nEl pescado fresco (como la Corvina en nuestros hogares) debe cocinarse a una **temperatura interna mínima de 63°C (145°F)** o hasta que su carne sea opaca y se desmorone fácilmente con un tenedor.\n\n* **Riesgo Biológico:** Almacena siempre los filetes en el estante inferior de la nevera en un recipiente hermético para evitar que gotee su agua exudativa sobre las verduras de consumo directo inferior.';
        } else if (lowercaseText.includes('cruzada')) {
          fallbackText = '### ♻️ Cómo Prevenir la Contaminación Cruzada\n\nLa contaminación cruzada ocurre cuando patógenos de carnes crudas migran a ensaladas o alimentos listos.\n\n1. **Usa Tablas Diferenciadas:** Una separada exclusiva para carnes rojas y pollo, y otra para verduras limpias.\n2. **Lavado Químico:** Lava tus manos durante 20 segundos con agua templada y jabón sanitizante antes y después de tocar cualquier producto crudo.\n3. **Ubicación Estratégica:** Alimentos listos arriba; carnes crudas bien cerradas en cajones inferiores.';
        } else {
          fallbackText = '### 🛡️ Recomendaciones de Inocuidad General\n\n¡Excelente pregunta! Recuerda siempre aplicar las cuatro reglas clave de la inocuidad hogareña:\n\n1. **Limpiar:** Higiene estricta de utensilios, manos y superficies.\n2. **Separar:** No juntar crudos con cocinados.\n3. **Cocinar:** Asegurar temperaturas de seguridad (>63°C para pescado, >74°C para aves).\n4. **Enfriar:** Almacenar sobras en el refrigerador en frascos chatos antes de las 2 horas de preparadas para impedir que las esporas latentes se multipliquen.';
        }

        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            role: 'model',
            text: fallbackText + '\n\n*(Nota: Operando bajo modo demostración offline local activa)*',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 700);
    } finally {
      setChatLoading(false);
    }
  };

  // Recipe AI Generative process
  const handleGenerateRecipe = async () => {
    if (selectedIngredients.length === 0) {
      setRecipeError('Por favor selecciona al menos un ingrediente de la nevera para aprovechar.');
      return;
    }

    setRecipeLoading(true);
    setRecipeError('');
    setGeneratedRecipe(null);

    const pantryList = pantryAdditions.split(',').map((x) => x.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          pantryItems: pantryList
        })
      });

      if (!res.ok) throw new Error('Falló el llamado al servidor.');

      const data = await res.json();
      setGeneratedRecipe(data);
      // Log as consumed state
      setStatsConsumedCount((prev) => prev + selectedIngredients.length);
    } catch (err) {
      // Offline Demo Recipe Fallback to maintain pristine feel
      setTimeout(() => {
        const ingredientsJoined = selectedIngredients.join(' con ');
        const mockRecipe: Recipe = {
          name: `Sudado Familiar de ${selectedIngredients.includes('Pescado Fresco (Corvina)') ? 'Corvina' : selectedIngredients[0]} Nutritivo`,
          prepTime: '20 minutos',
          ingredientsUsed: [...selectedIngredients],
          otherIngredients: pantryList.slice(0, 4),
          steps: [
            'Lavar e higienizar todos los vegetales sugeridos con abundante agua segura.',
            'Preparar un refrito con la cebolla, ajo picado finamente y condimentos en una sartén grande.',
            `Incorporar el ingrediente principal (${selectedIngredients.join(', ')}) cortado uniformemente para facilitar su cocción homogénea.`,
            'Añadir un cuarto de taza de caldo de vegetales y tapar la olla para concentrar el vapor térmico.',
            'Dejar hervir a fuego medio-alto controlando que el calor se distribuya correctamente en todas las piezas.'
          ],
          safetyPrecautions: [
            'VERIFICACIÓN DE COCCIÓN: Asegura que el centro térmico supere los 63°C para pescado o 74°C para aves.',
            'CONTAMINACIÓN CRUZADA: Retira la tabla de cortar usada de inmediato para lavar con cloro.',
            'REFRIGERACIÓN POSTERIOR: Guarda inmediatamente cualquier porción restante antes de 2 horas.'
          ],
          nutritionalBenefits: `Excelente aporte de minerales esenciales y proteínas de altísimo valor biológico. El consumo de vegetales frescos y de estación refuerza el sistema inmunitario de toda la familia.`
        };

        setGeneratedRecipe(mockRecipe);
        setStatsConsumedCount((prev) => prev + selectedIngredients.length);
      }, 900);
    } finally {
      setRecipeLoading(false);
    }
  };

  // Toggle ingredient selections
  const toggleIngredientSelection = (name: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  // Kitchen Safety Household audit score logic
  const handleSelectAuditOption = (questionId: string, optionIndex: number) => {
    setAuditQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return { ...q, selectedOption: optionIndex };
        }
        return q;
      })
    );
  };

  const calculateAuditScore = () => {
    const answered = auditQuestions.filter((q) => q.selectedOption !== undefined);
    if (answered.length === 0) return 0;
    
    // Max score is 2 points per question
    const totalSelectedScore = answered.reduce((acc, current) => {
      const option = current.options[current.selectedOption!];
      return acc + option.score;
    }, 0);

    const maxPossible = answered.length * 2;
    return Math.round((totalSelectedScore / maxPossible) * 100);
  };

  // AI Advice based on fridge state
  const getAiTipText = () => {
    const hasRawMeat = items.some((item) => item.category === 'meat' || item.category === 'fish');
    if (!isColdChainOk) {
      return '¡Alerta de Cadena de Frío! Tu nevera está por encima del límite seguro (4°C). Cocina las carnes y la corvina hoy mismo.';
    }
    if (hasRawMeat) {
      return 'Mantén la corvinda cruda y pechugas aisladas en recipientes herméticos en la base para evitar goteos contaminantes.';
    }
    return 'Excelente nivel de almacenamiento. Agrega agua fresca e hidrata a tu familia hoy con vegetales saludables.';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF7] text-stone-900 selection:bg-emerald-100 font-sans" id="app-viewport">
      {/* BRAND HEADER & NAVBAR COMPONENT */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isColdChainOk={isColdChainOk}
        hasApiKey={hasApiKey}
      />

      {/* DETAILED BENTO GRID WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* TOP INTERACTIVE WELCOME ROW (BENTO TITLE) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 bg-white border border-[#E5EADF] rounded-[24px] p-6 flex flex-col justify-between hover:border-[#A5D6A7] transition-all shadow-xs" id="welcome-bento-card">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs uppercase px-2.5 py-0.5 rounded-full font-bold font-mono tracking-wider">
                  Model: Gemini 2.0 Flash
                </span>
                <span className="bg-cyan-100 text-cyan-800 text-[10px] uppercase px-2 py-0.5 rounded-full font-mono font-bold">
                  Ecuador / ALC
                </span>
              </div>
              <h2 className="text-2xl font-black text-stone-850 tracking-tight">
                Plataforma Científica de Inocuidad & Nutrición
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
                Combate el desperdicio alimentario, asegura la cadena de frío de tus proteínas y planea un menú nutricional saludable con soporte de IA.
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-[#EDF2EB] flex flex-wrap items-center gap-4 text-xs">
              <span className="text-stone-500 font-medium">Urgencias del día:</span>
              {items.filter(i => getFoodStatus(i.expiryDate).daysLeft <= 0).length > 0 ? (
                <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-1 rounded-md font-semibold font-mono animate-pulse">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {items.filter(i => getFoodStatus(i.expiryDate).daysLeft <= 0).length} alimentos caducados o en riesgo crítico
                </span>
              ) : (
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold font-mono">
                  ✓ Proteínas en estado seguro hoy
                </span>
              )}
            </div>
          </div>

          {/* DYNAMIC HYDRATION BENTO CARD */}
          <div className="md:col-span-4 bg-emerald-600 text-white rounded-[24px] p-5 flex flex-col justify-between shadow-md relative overflow-hidden group hover:shadow-lg transition-all" id="hydration-bento-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-xl opacity-60 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest font-mono">
                  Consumo de Líquidos
                </p>
                <h3 className="text-3xl font-black mt-2 tracking-tight">
                  {hydration.toFixed(1)}L <span className="text-sm opacity-70 font-normal">/ 3L</span>
                </h3>
              </div>
              <span className="text-2xl animate-bounce-slow">💧</span>
            </div>

            <div className="relative z-10 space-y-3 mt-4">
              <p className="text-xs text-emerald-100 leading-tight">
                El agua limpia y hervida hidrata las membranas mucosas, ideal para el desarrollo cognitivo.
              </p>
              
              <div className="h-2 bg-emerald-800 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-white rounded-lg transition-all duration-300" 
                  style={{ width: `${Math.min((hydration / 3) * 100, 100)}%` }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  id="btn-add-hydration-glass"
                  onClick={() => setHydration((prev) => Math.min(prev + 0.250, 4.0))}
                  className="flex-1 bg-white select-none text-emerald-800 text-xs font-extrabold py-2 rounded-xl text-center shadow-xs hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  + Un Vaso (250 ml)
                </button>
                <button
                  id="btn-reset-hydration"
                  onClick={() => setHydration(0)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white p-2 rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                  title="Reiniciar contador de agua"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION - TAB CONTENT & PERSISTENT PREVENTIVE SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 8 COLUMNS: MAIN TAB SWITCH */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TAB 1: NEVERA INTELIGENTE */}
            {activeTab === 'inventory' && (
              <div className="bg-white border border-[#E5EADF] rounded-[24px] p-6 hover:border-[#A5D6A7] transition-all shadow-xs" id="nevera-tab-container">
                <InventoryManager
                  items={items}
                  setItems={setItems}
                  fridgeTemp={fridgeTemp}
                  setFridgeTemp={setFridgeTemp}
                  onLogWaste={handleWasteLog}
                  activityLogs={activityLogs}
                  setActivityLogs={setActivityLogs}
                />
              </div>
            )}

            {/* TAB: CONSULTA POR ALIMENTO, CONDICIÓN Y RECOMENDACIÓN */}
            {activeTab === 'safety_lookup' && (
              <div className="animate-fadeIn" id="consulta-alimentos-tab-container">
                <FoodSafetyLookup
                  onAskTutor={(question) => {
                    setActiveTab('tutor');
                    handleSendMessage(question);
                  }}
                />
              </div>
            )}

            {/* TAB 2: RECETAS DE APROVECHAMIENTO */}
            {activeTab === 'recipes' && (
              <div className="bg-white border border-[#E5EADF] rounded-[24px] p-6 shadow-xs hover:border-[#A5D6A7] transition-all space-y-6" id="recetas-tab-container">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-2xl font-extrabold text-stone-850 tracking-tight flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg flex items-center justify-center">🍳</span>
                    Generador de Recetas Inteligentes & Seguras
                  </h2>
                  <p className="text-sm text-stone-500 leading-relaxed mt-1">
                    Selecciona los ingredientes que están por caducar en tu nevera y la IA estructurará un plan nutricional seguro libre de contaminación cruzada.
                  </p>
                </div>

                {/* Checklist from inventory */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-stone-700">
                    Paso 1: Selecciona ingredientes de tu inventario para la base:
                  </h4>
                  {items.length === 0 ? (
                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl text-stone-500 text-xs">
                      No hay ingredientes registrados en tu inventario. Agrega alimentos en la pestaña &apos;Nevera Inteligente&apos; para habilitar el generador.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {items.map((item) => {
                        const isSel = selectedIngredients.includes(item.name);
                        const status = getFoodStatus(item.expiryDate);

                        return (
                          <div
                            key={item.id}
                            id={`check-ing-${item.id}`}
                            onClick={() => toggleIngredientSelection(item.name)}
                            className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer select-none transition-all ${
                              isSel 
                                ? 'bg-[#E8F5E9] border-emerald-500' 
                                : 'bg-white border-stone-200 hover:border-emerald-200'
                            }`}
                          >
                            <div className="flex gap-2.5 items-center">
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center text-white ${
                                isSel ? 'bg-emerald-600 border-emerald-600' : 'border-stone-300'
                              }`}>
                                {isSel && <Check className="h-3.5 w-3.5" />}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-stone-800">{item.name}</p>
                                <p className="text-[10px] text-stone-500 font-medium">Cant: {item.quantity}</p>
                              </div>
                            </div>

                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${status.statusIconBg}`}>
                              {status.daysLeft < 0 ? 'Expirado' : `${status.daysLeft} d`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Additional pantry items text input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block text-left">
                    Paso 2: Ingredientes adicionales disponibles en tu despensa / cocina (Alacena):
                  </label>
                  <input
                    type="text"
                    value={pantryAdditions}
                    onChange={(e) => setPantryAdditions(e.target.value)}
                    placeholder="Ej. Cebolla, Tomate, Ajo, Sal, Cilantro"
                    className="w-full text-xs px-3.5 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-2">
                  <button
                    id="btn-gen-recipe"
                    onClick={handleGenerateRecipe}
                    disabled={recipeLoading || selectedIngredients.length === 0}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl hover:shadow-lg disabled:opacity-40 select-none cursor-pointer hover:shadow-emerald-100 transition-all"
                  >
                    <Sparkles className="h-4.5 w-4.5" />
                    {recipeLoading ? 'Generando receta segura con IA...' : '¡Generar Receta Segura con IA!'}
                  </button>
                </div>

                {recipeError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
                    {recipeError}
                  </div>
                )}

                {/* GENERATED RECIPE OUTPUT PANEL */}
                {generatedRecipe && (
                  <div className="bg-[#F8FAF7] border-2 border-emerald-100 rounded-[20px] overflow-hidden shadow-xs animate-fadeIn" id="recipe-output-panel">
                    <div className="bg-emerald-600 text-white p-5">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="text-[10px] tracking-widest uppercase font-mono font-bold text-emerald-200">
                            Propuesta Saludable de Nutrición Familiar
                          </p>
                          <h3 className="text-xl font-extrabold mt-1 tracking-tight">
                            {generatedRecipe.name}
                          </h3>
                        </div>
                        <span className="bg-emerald-700 text-white font-mono px-3 py-1 rounded-lg text-xs font-bold">
                          ⏱ {generatedRecipe.prepTime}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-5">
                      {/* Grid Ingredients used */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-stone-200">
                          <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                            Ingredientes Aprovechados de la Nevera
                          </h5>
                          <ul className="space-y-1">
                            {generatedRecipe.ingredientsUsed.map((ing, k) => (
                              <li key={k} className="text-xs text-stone-700 flex items-center gap-2">
                                <span className="text-emerald-500 font-bold">✓</span> {ing}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-stone-200">
                          <h5 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                            Ingredientes Básicos de Apoyo necesarios
                          </h5>
                          <ul className="space-y-1">
                            {generatedRecipe.otherIngredients.map((ing, k) => (
                              <li key={k} className="text-xs text-stone-700 flex items-center gap-2">
                                <span className="text-stone-400 font-bold">•</span> {ing}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Step by step recipe */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-stone-850">Procedimiento Paso a Paso:</h4>
                        <ol className="space-y-2">
                          {generatedRecipe.steps.map((step, idx) => (
                            <li key={idx} className="bg-white p-3 rounded-xl border border-stone-150 text-xs text-stone-700 flex gap-3 leading-relaxed">
                              <span className="bg-emerald-100 text-emerald-700 w-5 h-5 font-bold font-mono rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* BENTO HIGHLIGHT: CRITICAL SANITARY MEASURES */}
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-2">
                        <h4 className="text-xs font-bold text-rose-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <ShieldAlert className="h-4.5 w-4.5" /> MEDIDAS ESTRICTAS DE INOCUIDAD (FOOD SAFETY CODES)
                        </h4>
                        <ul className="space-y-1.5">
                          {generatedRecipe.safetyPrecautions.map((prec, i) => (
                            <li key={i} className="text-xs text-rose-700 flex items-start gap-2 leading-relaxed">
                              <span className="text-rose-500 shrink-0 mt-1">•</span>
                              <span>{prec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Nutritional info */}
                      <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-cyan-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <BrainCircuit className="h-4.5 w-4.5 text-cyan-600" /> VALOR NUTRICIONAL PARA EL HOGAR
                        </h4>
                        <p className="text-xs text-cyan-700 leading-relaxed mt-1">
                          {generatedRecipe.nutritionalBenefits}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TUTOR DE INOCUIDAD IA (CHATBOT) */}
            {activeTab === 'tutor' && (
              <div className="bg-white border border-[#E5EADF] rounded-[24px] p-6 shadow-xs hover:border-[#A5D6A7] transition-all space-y-4" id="tutor-tab-container">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-stone-850 tracking-tight flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg flex items-center justify-center">💬</span>
                      Tutor Educativo e Interactivo IA
                    </h2>
                    <p className="text-sm text-stone-500 mt-1 leading-normal">
                      Consúltale cualquier duda científica sobre manipulación higiénica, Listeria, Salmonella o cómo enfriar platos calientes.
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 hidden sm:inline-block">
                    ONLINE: FAO CODES
                  </span>
                </div>

                {/* Chat window viewport */}
                <div className="bg-[#F8FAF7] border border-[#E5EADF] rounded-2xl h-[420px] overflow-y-auto p-4 space-y-4 shadow-inner" id="chat-messages-viewport">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${
                        msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-[11px] ${
                        msg.role === 'user' ? 'bg-stone-900 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        {msg.role === 'user' ? <User className="h-4.5 w-4.5" /> : 'SF'}
                      </div>

                      {/* Msg bubble */}
                      <div className="space-y-1.5">
                        <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-stone-900 text-white rounded-tr-none'
                            : 'bg-white text-stone-800 border border-stone-200 shadow-xs rounded-tl-none markdown-box'
                        }`}>
                          {/* Basic inline renderer for Markdown elements used heavily by Gemini */}
                          <div className="space-y-2">
                            {msg.text.split('\n\n').map((para, pIdx) => {
                              if (para.startsWith('###')) {
                                return (
                                  <h4 key={pIdx} className="font-bold text-emerald-800 mt-2 text-sm sm:text-base border-b border-stone-100 pb-1">
                                    {para.replace('###', '').trim()}
                                  </h4>
                                );
                              }
                              if (para.startsWith('1.') || para.startsWith('-')) {
                                return (
                                  <ul key={pIdx} className="list-disc pl-5 space-y-1">
                                    {para.split('\n').map((li, lIdx) => (
                                      <li key={lIdx} className="text-xs sm:text-sm leading-relaxed">
                                        {li.replace(/^(\d+\.|-)\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
                                      </li>
                                    ))}
                                  </ul>
                                );
                              }
                              // Basic clean of bold markdowns
                              const cleanPara = para.replace(/\*\*(.*?)\*\*/g, '$1');
                              return <p key={pIdx} className="leading-relaxed">{cleanPara}</p>;
                            })}
                          </div>
                        </div>
                        <span className="text-[9px] text-stone-400 font-mono block text-right mt-0.5">
                          {msg.timestamp}
                        </span>

                        {/* Quick suggestive chips */}
                        {msg.suggestions && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {msg.suggestions.map((sug, sI) => (
                              <button
                                key={sI}
                                onClick={() => handleSendMessage(sug)}
                                className="bg-[#E8F5E9] hover:bg-emerald-100 select-none text-emerald-800 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-emerald-100 transition-colors text-left cursor-pointer"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex gap-3 max-w-[80%] mr-auto">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 animate-bounce">
                        ...
                      </div>
                      <div className="bg-white text-stone-500 border border-stone-200 text-xs px-4 py-3 rounded-2xl animate-pulse">
                        SafeFood IA está formulando la respuesta de inocuidad...
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Input footer */}
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(userInput)}
                    placeholder="Escribe tu consulta sobre lavado, Listeria, cocción del pollo..."
                    className="flex-1 text-xs sm:text-sm px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    id="btn-send-message"
                    onClick={() => handleSendMessage(userInput)}
                    disabled={chatLoading || !userInput.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: AUDITORÍA E IMPACTO */}
            {activeTab === 'audit' && (
              <div className="bg-white border border-[#E5EADF] rounded-[24px] p-6 shadow-xs hover:border-[#A5D6A7] transition-all space-y-6" id="auditoria-tab-container">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-2xl font-extrabold text-stone-850 tracking-tight flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg flex items-center justify-center">📊</span>
                    Autoevaluación Hogareña de Riesgos Sanitarios
                  </h2>
                  <p className="text-sm text-stone-500 mt-1">
                    Contesta el test desarrollado por ingenieros de alimentos para medir la inocuidad real de tu cocina y desbloquea el reporte de impacto.
                  </p>
                </div>

                {/* Checklist implementation */}
                <div className="space-y-5">
                  {auditQuestions.map((q, qIndex) => (
                    <div key={q.id} className="p-4 bg-[#F8FAF7] border border-[#E5EADF] rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest font-mono">
                        Pregunta {qIndex + 1} de {auditQuestions.length} — Criterio: {q.category === 'higiene' ? 'Higiene de Manos' : q.category === 'temperatura' ? 'Alineación de Frío' : q.category === 'almacenamiento' ? 'Distribución' : 'Descongelamiento'}
                      </h4>
                      <p className="text-sm font-bold text-stone-800">{q.question}</p>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSel = q.selectedOption === optIdx;
                          return (
                            <div
                              key={optIdx}
                              id={`audit-q-${q.id}-opt-${optIdx}`}
                              onClick={() => handleSelectAuditOption(q.id, optIdx)}
                              className={`p-3.5 rounded-xl border text-xs text-left transition-all cursor-pointer select-none ${
                                isSel
                                  ? 'bg-stone-900 text-white border-stone-950 font-medium'
                                  : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-300'
                              }`}
                            >
                              {opt.text}
                            </div>
                          );
                        })}
                      </div>

                      {q.selectedOption !== undefined && (
                        <div className={`p-3 rounded-xl text-xs leading-normal font-medium ${
                          q.options[q.selectedOption].score === 2
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                            : q.options[q.selectedOption].score === 1
                            ? 'bg-amber-50 text-amber-800 border border-amber-100'
                            : 'bg-rose-50 text-rose-800 border border-rose-100'
                        }`}>
                          <strong>Recomendación:</ strong> {q.options[q.selectedOption].feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Score bar block */}
                <div className="bg-[#EDF2EB] p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest font-mono">
                      Índice de Confianza de Tu Hogar
                    </span>
                    <h3 className="text-3xl font-black text-stone-850">
                      {calculateAuditScore()}% <span className="text-sm font-normal text-stone-500">sobre 100% científico</span>
                    </h3>
                    <p className="text-xs text-stone-600 max-w-sm">
                      Un puntaje superior al 80% califica a tu hogar como una zona protegida contra gastroenteritis transmitida por bacterias.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      id="btn-view-cert"
                      onClick={() => setShowCertificate(true)}
                      disabled={auditQuestions.some((q) => q.selectedOption === undefined)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer shadow-xl shadow-emerald-100 disabled:opacity-40"
                    >
                      Descargar Certificado Local
                    </button>
                    <button
                      id="btn-reset-audit"
                      onClick={() => {
                        setAuditQuestions(getKitchenAuditQuestions());
                        setShowCertificate(false);
                      }}
                      className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 p-3 rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                      title="Reiniciar cuestionario"
                    >
                      <RefreshCw className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                {/* CERTIFICATE LIGHTBOX SHOWCASE */}
                {showCertificate && (
                  <div className="border border-emerald-200 rounded-3xl p-6 bg-emerald-50/50 relative overflow-hidden text-center space-y-4 animate-scaleUp">
                    <Award className="h-12 w-12 text-emerald-600 mx-auto animate-bounce-slow" />
                    <div>
                      <h4 className="text-xl font-extrabold text-[#2E7D32]">Certificación de Inocuidad Familiar</h4>
                      <p className="text-[11px] font-mono uppercase tracking-widest text-[#2E7D32]/80 mt-1">
                        Otorgado por SafeFood IA
                      </p>
                    </div>

                    <div className="max-w-md mx-auto bg-white p-5 rounded-2xl border border-dashed border-emerald-300 text-xs text-stone-600 leading-relaxed text-left">
                      <p className="indent-4 mb-2">
                        La <strong>Residencia del Usuario</strong> ha completado los protocolos de seguridad sanitaria escolar e higiénica. Logrando un índice de aprobación del{' '}
                        <strong>{calculateAuditScore()}%</strong> bajo los criterios analíticos de prevención de ETAs.
                      </p>
                      <p className="italic text-stone-500">
                        *Este certificado promueve la cultura preventiva del lavado frecuente de tablas y control preciso del termómetro digital.
                      </p>
                    </div>

                    <button
                      id="btn-dismiss-cert"
                      onClick={() => setShowCertificate(false)}
                      className="bg-[#2E7D32] hover:bg-emerald-800 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg select-none cursor-pointer"
                    >
                      Entendido
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: CASO DE ESTUDIO */}
            {activeTab === 'study' && (
              <div className="bg-white border border-[#E5EADF] rounded-[24px] p-6 shadow-xs hover:border-[#A5D6A7] transition-all space-y-6" id="caso-estudio-tab-container">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-2xl font-extrabold text-[#2E7D32] tracking-tight flex items-center gap-2 font-sans">
                    <span className="bg-emerald-100 text-[#2E7D32] p-1.5 rounded-lg flex items-center justify-center">📖</span>
                    Caso de Estudio: Gestión Inteligente en el Hogar
                  </h2>
                  <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                    Análisis científico y propuesta práctica sobre la Inteligencia Artificial aplicada a la Inocuidad Alimentaria y Planificación Nutricional Doméstica.
                  </p>
                </div>

                {/* 1. INTRODUCCIÓN Y OBJETIVOS BENTO CARD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-2">
                    <h3 className="text-sm font-bold text-stone-850 flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-mono">
                      <span>📌 Introducción Científica</span>
                    </h3>
                    <p className="text-xs text-[#555a4f] leading-relaxed">
                      El manejo inadecuado de alimentos en el ámbito familiar es una de las principales causas de Enfermedades Transmitidas por Alimentos (ETAs) y de pérdidas económicas por desperdicio. La incorporación de la Inteligencia Artificial en la organización doméstica optimiza el almacenamiento, la conservación, la preparación y el consumo seguro, elevando considerablemente el bienestar familiar.
                    </p>
                  </div>

                  <div className="bg-[#EDF2EB] border border-[#C8E6C9] p-5 rounded-2xl space-y-3">
                    <h3 className="text-sm font-bold text-[#2E7D32] flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-mono">
                      <span>🎯 Objetivos del Proyecto</span>
                    </h3>
                    <div className="space-y-1.5 text-xs text-stone-700">
                      <p><strong>Objetivo General:</strong> Analizar el aporte de la Inteligencia Artificial en el fortalecimiento de la inocuidad alimentaria y la planificación nutricional de compras y almacenamiento de los alimentos en el hogar.</p>
                      <div className="border-t border-dashed border-[#A5D6A7] pt-1.5 mt-1.5 space-y-1">
                        <p><strong>Objetivos Específicos:</strong></p>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-stone-600">
                          <li>Detectar riesgos y dar recomendaciones de inocuidad escolar e higiénica.</li>
                          <li>Analizar la contribución de la IA en la prevención, control y descarte seguro.</li>
                          <li>Evaluar indicadores y proponer estrategias eficientes contra el desperdicio biológico.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. PILLARS OF WORK (APLICACIONES) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-mono">
                    Áreas de Aplicación e Inocuidad
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Alerta de Vencimiento */}
                    <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-2 hover:shadow-xs transition-shadow">
                      <div className="bg-rose-50 text-rose-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                        🚨
                      </div>
                      <h4 className="text-sm font-bold text-stone-800">1. Alertas de Inocuidad & Frío</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        El sistema detecta riesgos de ruptura de cadena de frío y emite avisos de caducidad. Por ejemplo: <em>&ldquo;La pechuga de pollo almacenada presenta 4 días de refrigeración. Consumir dentro de las próximas 12 horas para evitar riesgo microbiológico.&rdquo;</em>
                      </p>
                    </div>

                    {/* Monitoreo inteligente */}
                    <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-2 hover:shadow-xs transition-shadow">
                      <div className="bg-cyan-50 text-cyan-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                        ❄️
                      </div>
                      <h4 className="text-sm font-bold text-stone-800">2. Monitoreo Inteligente</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Controla variables clave del refrigerador: temperatura interna, tiempo promedio de almacenamiento de carnes y pescados crudos, y estado de conservación para prevenir proliferación bacteriana silente.
                      </p>
                    </div>

                    {/* Planificacion */}
                    <div className="p-4 bg-white border border-[#E5EADF] rounded-2xl space-y-2 hover:shadow-xs transition-shadow">
                      <div className="bg-amber-50 text-amber-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                        🍎
                      </div>
                      <h4 className="text-sm font-bold text-stone-800">3. Planificación Nutricional</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Diseño automático de menús semanales de aprovechamiento basados en alimentos disponibles, priorizando aquellos con menores días de perecidad y previniendo la contaminación cruzada en platos listos.
                      </p>
                    </div>

                    {/* Tutor */}
                    <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-2 hover:shadow-xs transition-shadow">
                      <div className="bg-emerald-50 text-emerald-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                        🎓
                      </div>
                      <h4 className="text-sm font-bold text-stone-800">4. Educación Científica Interactiva</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Instrucción en tiempo real sobre higiene y sanitización de alimentos andinos (como Yuca y Plátanos verdes), manipulación segura e índices microbiológicos recomendados según los estándares de la FAO.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. CASO DE ESTUDIO PRÁCTICO: SAFEFOOD IA (COMPARATIVA ANTES VS DESPUÉS) */}
                <div className="bg-stone-900 text-stone-100 rounded-[24px] p-6 space-y-5 relative overflow-hidden">
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#A5D6A7] font-mono font-bold uppercase tracking-widest leading-none">
                      Caso de Aplicación Práctica
                    </span>
                    <h3 className="text-lg font-bold text-white font-sans">SafeFood IA: Estudio de Caso en Familia de 5 Integrantes</h3>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Mapeo analítico de la reducción de mermas y aumento del índice nutricional de un hogar antes y después de usar tecnología de inteligencia artificial.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Indicador 1 */}
                    <div className="bg-stone-800 p-4 rounded-xl border border-stone-700/60 flex flex-col justify-between">
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">Desperdicio</span>
                      <div className="my-2 text-center text-xs space-y-1">
                        <span className="line-through text-rose-450 block text-sm font-bold">Antes: 18%</span>
                        <span className="text-[#A5D6A7] text-2xl font-black block">Después: 6%</span>
                      </div>
                      <div className="text-[9px] text-stone-400 border-t border-stone-700/50 pt-1 text-center font-semibold">
                        Optimización de compras
                      </div>
                    </div>

                    {/* Indicador 2 */}
                    <div className="bg-stone-800 p-4 rounded-xl border border-stone-700/60 flex flex-col justify-between">
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">Incidentes Sanitarios</span>
                      <div className="my-2 text-center text-xs space-y-1">
                        <span className="line-through text-rose-450 block text-sm font-bold">Antes: 5 al mes</span>
                        <span className="text-[#A5D6A7] text-2xl font-black block">Después: 1 al mes</span>
                      </div>
                      <div className="text-[9px] text-stone-400 border-t border-stone-700/50 pt-1 text-center font-semibold">
                        Control de temperatura
                      </div>
                    </div>

                    {/* Indicador 3 */}
                    <div className="bg-stone-800 p-4 rounded-xl border border-stone-700/60 flex flex-col justify-between">
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">Cumplimiento Nutricional</span>
                      <div className="my-2 text-center text-xs space-y-1">
                        <span className="line-through text-stone-400 block text-sm font-bold">Antes: 60%</span>
                        <span className="text-[#A5D6A7] text-2xl font-black block">Después: 88%</span>
                      </div>
                      <div className="text-[9px] text-stone-400 border-t border-stone-700/50 pt-1 text-center font-semibold">
                        Menús balanceados
                      </div>
                    </div>

                    {/* Indicator 4 */}
                    <div className="bg-stone-800 p-4 rounded-xl border border-stone-700/60 flex flex-col justify-between">
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">Ahorro Económico</span>
                      <div className="my-2 text-center text-xs space-y-1">
                        <span className="text-stone-400 block text-sm font-bold">Antes: 0%</span>
                        <span className="text-[#A5D6A7] text-2xl font-black block">Después: 20%</span>
                      </div>
                      <div className="text-[9px] text-stone-400 border-t border-stone-700/50 pt-1 text-center font-semibold">
                        Reducción de mermas
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE COMPONENT LINKING REAL OPERATION WITH THE CASE STUDY */}
                  <div className="bg-stone-800 border border-[#A5D6A7]/20 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-[#A5D6A7] uppercase tracking-wider font-mono">
                      📊 Tu Hogar frente al Caso de Estudio (Operación Real en Vivo)
                    </h4>
                    <p className="text-xs text-stone-300">
                      Utilizando la bitácora de recepciones y mermas de tu applet, calculamos las estadísticas empíricas actuales para tu hogar en tiempo real:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* Real Waste Ratio */}
                      <div className="bg-stone-900/60 p-3 rounded-lg border border-stone-700">
                        <span className="text-[9px] text-stone-400 block uppercase font-mono">Tu Tasa de Merma</span>
                        <span className="text-lg font-mono font-black text-rose-400 block mt-0.5 animate-fadeIn">
                          {activityLogs.filter(l => l.action.startsWith('consumo')).length > 0
                            ? Math.round((activityLogs.filter(l => l.action === 'consumo_desperdiciado').length / activityLogs.filter(l => l.action.startsWith('consumo')).length) * 100)
                            : 0}%
                        </span>
                        <span className="text-[8px] text-stone-500 block">Metas: Estudio = 6%, Antes = 18%</span>
                      </div>

                      {/* Real Logs count */}
                      <div className="bg-stone-900/60 p-3 rounded-lg border border-stone-700">
                        <span className="text-[9px] text-stone-400 block uppercase font-mono">Alimentos Recibidos</span>
                        <span className="text-lg font-mono font-black text-[#A5D6A7] block mt-0.5 animate-fadeIn">
                          {activityLogs.filter(l => l.action === 'recepcion').length} ingredientes
                        </span>
                        <span className="text-[8px] text-stone-500 block">Rastreados en Bitácora</span>
                      </div>

                      {/* Performance */}
                      <div className="bg-stone-900/60 p-3 rounded-lg border border-stone-700">
                        <span className="text-[9px] text-stone-400 block uppercase font-mono">Días Perecidad Promedio</span>
                        <span className="text-lg font-mono font-black text-cyan-400 block mt-0.5 animate-fadeIn">
                          {activityLogs.length > 0
                            ? (activityLogs.reduce((acc, c) => acc + c.perecidad, 0) / activityLogs.length).toFixed(1)
                            : '0'} días
                        </span>
                        <span className="text-[8px] text-stone-500 block">Vida útil estimada de stock</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. CONCLUSIONES */}
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2 text-left">
                  <h4 className="text-sm font-bold text-emerald-900">🎓 Conclusiones del Estudio</h4>
                  <ul className="list-disc pl-5 text-xs text-stone-700 space-y-1.5 leading-relaxed">
                    <li>La Inteligencia Artificial representa una herramienta tecnológica sumamente valiosa para fortalecer las prácticas de inocuidad en el hogar, previniendo intoxicaciones por Listeria o Salmonella.</li>
                    <li>Sistemas interactivos bidireccionales de cálculo y visualización que enlazan <strong>Fechas de Recepción</strong> con <strong>Días de Perecidad</strong> educan a las familias y facilitan un descarte verdaderamente preventivo.</li>
                    <li>La planificación automatizada basada en mermas acumuladas e ingredientes próximos a caducar reduce el desecho familiar de un promedio histórico del 18% a menos del 6%, generando sostenibilidad y ahorro económico notable.</li>
                  </ul>
                  <div className="italic text-center text-[11px] text-[#2E7D32] pt-2 border-t border-emerald-200 mt-2 font-medium font-mono">
                    &ldquo;La inocuidad alimentaria del futuro dependerá no solo de qué alimentos consumimos, sino también de cómo la tecnología nos ayuda a conservarlos, gestionarlos y consumirlos de manera segura.&rdquo;
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 4 COLUMNS: THE COMPLEMENTARY BENTO BAR IN REAL-TIME */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* CARD A: DYNAMIC CADUCITY NOTIFIER */}
            <div className="bg-white border border-[#E5EADF] rounded-[24px] p-5 shadow-xs hover:border-[#A5D6A7] transition-all space-y-4">
              <h4 className="text-sm font-bold text-stone-800 tracking-tight flex items-center justify-between">
                <span>Alertas de Caducidad</span>
                <span className="bg-stone-100 text-stone-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  Nevera
                </span>
              </h4>

              <div className="space-y-2.5">
                {items.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No hay alimentos en riesgo de descomposición.</p>
                ) : (
                  items.slice(0, 4).map((item) => {
                    const status = getFoodStatus(item.expiryDate);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                          status.daysLeft < 0
                            ? 'bg-[#FFEBEE] border-l-4 border-l-rose-500'
                            : status.daysLeft <= 1
                            ? 'bg-[#FFF3E0] border-l-4 border-l-amber-500'
                            : 'bg-stone-50 border-l-4 border-l-stone-300'
                        }`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-sm shrink-0">
                          {item.category === 'meat' ? '🍗' :
                           item.category === 'fish' ? '🐟' :
                           item.category === 'vegetable' ? '🥬' :
                           item.category === 'dairy' ? '🥛' :
                           item.category === 'fruit' ? '🍎' :
                           item.category === 'leftovers' ? '🥡' : '🍽️'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-stone-800 truncate">{item.name}</p>
                          <p className={`text-[10px] font-bold uppercase ${status.statusColor}`}>
                            {status.daysLeft < 0 ? 'Expirado' : status.daysLeft === 0 ? 'Hoy' : status.daysLeft === 1 ? 'Mañana' : `En ${status.daysLeft} días`}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* CARD B: HOME SMART MONITOR SENSORS (SLIDE 2 DETAILED VALUES) */}
            <div className="bg-white border border-[#E5EADF] rounded-[24px] p-5 shadow-xs hover:border-[#A5D6A7] transition-all space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-stone-800 tracking-tight">
                  Dispositivos & Sensores IoT
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[9px] text-emerald-700 font-bold uppercase font-mono tracking-wider">
                    Activo
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Fridge */}
                <div className="flex flex-col justify-center items-center p-3 border border-stone-100 rounded-2xl bg-[#F8FAF7]">
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight text-center">Refri Principal</p>
                  <p className="text-xl font-mono font-black text-stone-800 mt-1">{fridgeTemp.toFixed(1)}°C</p>
                  <span className={`text-[9px] font-bold mt-0.5 ${isColdChainOk ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isColdChainOk ? 'Estable' : 'Riesgo Crítico'}
                  </span>
                </div>

                {/* Freezer */}
                <div className="flex flex-col justify-center items-center p-3 border border-stone-100 rounded-2xl bg-[#F8FAF7]">
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight text-center">Congelador</p>
                  <p className="text-xl font-mono font-black text-stone-800 mt-1">-18.0°C</p>
                  <span className="text-[9px] text-emerald-600 font-bold mt-0.5">Operativo</span>
                </div>

                {/* Pantry Humidity */}
                <div className="flex flex-col justify-center items-center p-3 border border-stone-100 rounded-2xl bg-[#F8FAF7]">
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight text-center">Humedad Alacena</p>
                  <p className="text-xl font-mono font-black text-stone-800 mt-1">42%</p>
                  <span className="text-[9px] text-amber-600 font-bold mt-0.5">Excelente</span>
                </div>

                {/* Air Quality */}
                <div className="flex flex-col justify-center items-center p-3 border border-stone-100 rounded-2xl bg-[#F8FAF7]">
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight text-center">Calidad del Aire</p>
                  <p className="text-xl font-mono font-black text-stone-800 mt-1">AQI 12</p>
                  <span className="text-[9px] text-emerald-600 font-bold mt-0.5">Óptimo</span>
                </div>
              </div>

              {/* Dynamic educational suggestion below sensor blocks */}
              <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                  Guía Preventiva
                </p>
                <p className="text-[11px] text-stone-600 italic leading-snug mt-1">
                  &ldquo;{getAiTipText()}&rdquo;
                </p>
              </div>
            </div>

            {/* CARD C: DAILY DIET BALANCE PROFILES */}
            <div className="bg-white border border-[#E5EADF] rounded-[24px] p-5 shadow-xs hover:border-[#A5D6A7] transition-all space-y-4">
              <h4 className="text-sm font-bold text-stone-800 tracking-tight">
                Balance Nutricional Diario
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Nivel estimado de nutrición familiar en base a alimentos consumidos hoy ({statsConsumedCount} porciones registradas).
              </p>

              <div className="space-y-3.5">
                {/* Proteins */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-600 font-medium">
                    <span>Proteínas (Garantía de tejido)</span>
                    <span className="font-mono font-bold">82g / 120g (68%)</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-lg overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-lg" style={{ width: '68%' }} />
                  </div>
                </div>

                {/* Carbs */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-600 font-medium">
                    <span>Carbohidratos complejos (Yuca/Plátano)</span>
                    <span className="font-mono font-bold">140g / 200g (70%)</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-lg overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-lg" style={{ width: '70%' }} />
                  </div>
                </div>

                {/* Fats */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-600 font-medium">
                    <span>Grasas esenciales</span>
                    <span className="font-mono font-bold">45g / 65g (69%)</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-lg overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-lg" style={{ width: '69%' }} />
                  </div>
                </div>
              </div>

              {/* Suggestions banner */}
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-[11px] leading-snug">
                <strong>Sugerencia IA de Balance:</strong> Te recomendamos cocinar la <strong>Corvina hoy</strong> para obtener ácidos grasos omega-3 y reducir el riesgo de descomposición.
              </div>
            </div>

            {/* CARD D: HOUSEHOLD ENVIRONMENTAL IMPACT (Desperdicio) */}
            <div className="bg-stone-900 text-stone-100 border-none rounded-[24px] p-5 shadow-md space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-mono">
                  Informe de Desperdicios
                </h4>
                <p className="text-xs text-stone-400 leading-normal mt-0.5">
                  Mapeo del impacto ambiental de las mermas orgánicas acumuladas en casa.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-stone-800 p-3 rounded-xl border border-stone-800">
                  <p className="text-[10px] text-stone-400 uppercase font-mono tracking-widest">Alimentos Descartados</p>
                  <p className="text-lg font-mono font-black text-rose-450 mt-1">{statsWastedCount} unid.</p>
                </div>

                <div className="bg-stone-800 p-3 rounded-xl border border-stone-800">
                  <p className="text-[10px] text-stone-400 uppercase font-mono tracking-widest">Peso Acumulado</p>
                  <p className="text-lg font-mono font-black text-rose-450 mt-1">{(statsWastedWeight / 1000).toFixed(2)} kg</p>
                </div>
              </div>

              <div className="text-[10px] text-stone-400 leading-relaxed italic">
                *Cada kg de alimento evitado previene la emisión de 2.5 kg de CO₂ equivalente a la atmósfera. ¡Compre de manera responsable!
              </div>
            </div>

          </div>
        </div>

        {/* SCIENTIFIC METRIC GRAPHS BENTO SECTION (SLIDE 6 / 11 DATA) */}
        <div className="bg-white border border-[#E5EADF] rounded-[24px] p-6 shadow-xs hover:border-[#A5D6A7] transition-all grid grid-cols-1 md:grid-cols-2 gap-6" id="bento-scientific-metrics">
          <div>
            <h4 className="text-base font-bold text-stone-800 tracking-tight flex items-center gap-1">
              <span>Eficacia de la Inteligencia Artificial en la Gestión Alimentaria</span>
            </h4>
            <p className="text-xs text-stone-500 mb-4 leading-normal">
              Puntuación empírica calculada sobre la reducción real de incidentes de contaminación en hogares piloto (%).
            </p>
            
            <div className="space-y-3">
              {[
                { label: 'Monitoreo Inteligente de Frescura', val: 92, col: 'bg-emerald-600' },
                { label: 'Control Autónomo de Caducidad', val: 88, col: 'bg-emerald-600' },
                { label: 'Planificación Nutricional Segura', val: 85, col: 'bg-emerald-600' },
                { label: 'Asistentes Educativos Integrados', val: 80, col: 'bg-emerald-600' },
                { label: 'Prevención Proactiva de Intoxicaciones', val: 95, col: 'bg-emerald-600' }
              ].map((row, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-stone-600">
                    <span>{row.label}</span>
                    <span className="font-bold font-mono text-stone-800">{row.val}%</span>
                  </div>
                  <div className="h-2.5 bg-stone-100 rounded-lg overflow-hidden">
                    <div className={`h-full ${row.col} rounded-lg`} style={{ width: `${row.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-base font-bold text-stone-800 tracking-tight flex items-center gap-1">
                <span>Estrategias Clave de IA en Inocuidad y Nutrición</span>
              </h4>
              <p className="text-xs text-stone-500 mb-4 leading-normal">
                Puntajes de efectividad medidos en la reducción de residuos orgánicos domésticos y mitigación de huella hídrica.
              </p>

              <div className="space-y-3">
                {[
                  { label: 'Planificación Personalizada Familiar', val: 95, col: 'bg-stone-900' },
                  { label: 'Detección Rápida de Riesgos Biológicos', val: 90, col: 'bg-stone-900' },
                  { label: 'Asistentes Guiados de Preparación', val: 85, col: 'bg-stone-900' },
                  { label: 'Monitoreo de Sensores en Refrigeración', val: 92, col: 'bg-stone-900' }
                ].map((row, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-stone-600">
                      <span>{row.label}</span>
                      <span className="font-bold font-mono text-stone-800">{row.val}%</span>
                    </div>
                    <div className="h-2.5 bg-stone-100 rounded-lg overflow-hidden">
                      <div className={`h-full ${row.col} rounded-lg`} style={{ width: `${row.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#EDF2EB] p-3 rounded-2xl flex items-center gap-3">
              <span className="text-2xl shrink-0">📈</span>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                <strong>Conclusión Científica:</strong> La combinación de algoritmos predictivos y control remoto reduce el desperdicio de alimentos del <strong>18% al 6%</strong> y los incidentes por mala manipulación doméstica a tan solo <strong>1 al mes</strong>.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* DETAILED FOOTER PANEL */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">
            SafeFood IA — Ciencia en la Cocina
          </p>
          <p className="text-xs text-stone-400">
            Desarrollado en cumplimiento con las especificaciones científicas de inocuidad alimentaria familiar y nutrición doméstica.
          </p>
        </div>
      </footer>
    </div>
  );
}
