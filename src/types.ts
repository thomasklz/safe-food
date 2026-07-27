/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FoodItem {
  id: string;
  name: string;
  category: 'meat' | 'fish' | 'vegetable' | 'dairy' | 'fruit' | 'leftovers' | 'grain' | 'other';
  storageDate: string; // YYYY-MM-DD
  expiryDate: string;  // YYYY-MM-DD
  storageLocation: 'fridge' | 'freezer' | 'pantry';
  quantity: string;
  notes?: string;
  isCustomExpiry?: boolean;
  perecidad?: number; // Days of durability / shelflife
}

export interface ActivityLog {
  id: string;
  name: string;
  action: 'recepcion' | 'consumo_aprovechado' | 'consumo_desperdiciado';
  date: string; // YYYY-MM-DD
  quantity: string;
  category: string;
  perecidad: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export interface Recipe {
  name: string;
  prepTime: string;
  ingredientsUsed: string[];
  otherIngredients: string[];
  steps: string[];
  safetyPrecautions: string[]; // specific food safety warnings, temperatures etc
  nutritionalBenefits: string;
}

export interface KitchenAuditItem {
  id: string;
  question: string;
  category: 'higiene' | 'temperatura' | 'almacenamiento' | 'descongelacion';
  options: {
    text: string;
    score: number; // 0 = bad, 1 = regular, 2 = excellent
    feedback: string;
  }[];
  selectedOption?: number;
}

export type SafetyConditionCategory = 'coccion' | 'almacenamiento' | 'corte_energia' | 'asado_horno' | 'descongelacion';

export interface FoodSafetyRecord {
  id: string;
  foodName: string;
  subType?: string;
  category: 'meat' | 'poultry' | 'fish_seafood' | 'dairy_cheese' | 'eggs' | 'leftovers' | 'produce' | 'grains_bakery' | 'sauces_other';
  
  // Cocción
  minCookingTempC?: number;
  minCookingTempF?: number;
  restTimeMinutes?: number;
  cookingVisualIndicator?: string;
  
  // Almacenamiento
  fridgeDays?: string; // e.g. "1 a 2 días"
  freezerMonths?: string; // e.g. "9 meses"
  
  // Corte de luz (Corte de energía > 2h a > 4°C)
  powerOutageAction?: 'DESECHAR' | 'MANTENER' | 'DESECHAR_SI_8H';
  powerOutageNote?: string;
  frozenOutageAction?: 'VOLVER_A_CONGELAR' | 'DESECHAR';
  
  // Asado / Horneado
  roastingOvenTempC?: number;
  roastingTiming?: string;
  
  // Observaciones & Recomendaciones generales
  microbiologyWarning?: string;
  recommendationSummary: string;
}
