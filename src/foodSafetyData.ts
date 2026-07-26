/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FoodSafetyRecord } from './types';

// Complete dataset based on FoodSafety.gov & USDA Official Guidelines
export const FOOD_SAFETY_RECORDS: FoodSafetyRecord[] = [
  // --- CARNES ROJAS (RES, CERDO, CORDERD, TERNERA, CABRA) ---
  {
    id: 'fs_beef_steaks',
    foodName: 'Carne de Res, Cerdo, Cordero y Ternera',
    subType: 'Filetes, Asados y Chuletas (Cortes enteros)',
    category: 'meat',
    minCookingTempC: 63,
    minCookingTempF: 145,
    restTimeMinutes: 3,
    cookingVisualIndicator: 'Carne opaca con jugos claros. Dejar reposar 3 min.',
    fridgeDays: '3 a 5 días',
    freezerMonths: '4 a 12 meses',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Desechar si estuvo expuesto a >4°C por más de 2 horas (o >4h en refri cerrado sin luz).',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    roastingOvenTempC: 163,
    roastingTiming: '23 a 33 min/lb a 163°C según el corte.',
    microbiologyWarning: 'Previene contaminación por E. coli y Salmonella en superficies externas.',
    recommendationSummary: 'Cocinar a 63°C (145°F) con 3 minutos de reposo obligatorio. Mantener en refrigerador de 3 a 5 días. En apagón >2 horas, desechar si está cruda o cocinada.'
  },
  {
    id: 'fs_ground_meat',
    foodName: 'Carne Picada / Molida y Salchichas Crudas',
    subType: 'Res, Pavo, Pollo, Cerdo, Ternera y Mezclas',
    category: 'meat',
    minCookingTempC: 71,
    minCookingTempF: 160,
    restTimeMinutes: 0,
    cookingVisualIndicator: 'Sin partes rosadas en el centro.',
    fridgeDays: '1 a 2 días',
    freezerMonths: '3 a 4 meses',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Alto riesgo por distribución interna de bacterias durante la molienda.',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    roastingOvenTempC: 177,
    roastingTiming: '20 min/lb.',
    microbiologyWarning: 'Bacterias externas se mezclan en toda la masa durante el molido.',
    recommendationSummary: 'Requiere 71°C (160°F) interno. Muy perecedera (solo 1-2 días en nevera). Desechar de inmediato tras cortes de luz prolongados.'
  },
  {
    id: 'fs_bacon_cured',
    foodName: 'Tocino y Embutidos Curados',
    subType: 'Tocino, Salchichas cocidas, Chorizo, Tocino ahumado',
    category: 'meat',
    minCookingTempC: 71,
    minCookingTempF: 160,
    cookingVisualIndicator: 'Bien dorado y crujiente.',
    fridgeDays: '1 semana (tocino/salchicha cocida)',
    freezerMonths: '1 a 2 meses',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Desechar si estuvo >2 horas a >4°C.',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    recommendationSummary: 'Se conserva 1 semana refrigerado. Tras un apagón de más de 2 horas sin frío, desechar por riesgo de enterotoxinas.'
  },
  {
    id: 'fs_ham_raw',
    foodName: 'Jamón Crudo (Fresco)',
    subType: 'Pierna entera, deshuesada o en trozos sin curar',
    category: 'meat',
    minCookingTempC: 63,
    minCookingTempF: 145,
    restTimeMinutes: 3,
    cookingVisualIndicator: 'Carne firme y jugos transparentes.',
    fridgeDays: '3 a 5 días',
    freezerMonths: '6 meses',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Desechar si se expone a temperatura ambiente.',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    roastingOvenTempC: 163,
    roastingTiming: '22 a 28 min/lb a 163°C.',
    recommendationSummary: 'Cocinar hasta 63°C (145°F) y reposar 3 minutos. En nevera dura 3-5 días crudo.'
  },
  {
    id: 'fs_ham_cooked',
    foodName: 'Jamón Precocido y Ahumado',
    subType: 'Para recalentar (envasado en plantas o artesanal)',
    category: 'meat',
    minCookingTempC: 74,
    minCookingTempF: 165,
    restTimeMinutes: 0,
    cookingVisualIndicator: 'Recalentar hasta estar bien caliente en el centro (60°C en plantas USDA / 74°C otros).',
    fridgeDays: '1 a 2 semanas (sin abrir) / 3-5 días (abierto)',
    freezerMonths: '1 a 2 meses',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Jamones enlatados con etiqueta "Mantener refrigerado" deben desecharse tras apagón.',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    recommendationSummary: 'Recalentar a 74°C (165°F). Si estuvo abierto en apagón >2 horas, desechar.'
  },

  // --- AVES DE CORRAL (POLLO, PAVO, PATO) ---
  {
    id: 'fs_poultry_whole_parts',
    foodName: 'Pollo y Pavo (Aves de Corral)',
    subType: 'Ave entera, Pechugas, Muslos, Alas, Carne molida y Menudillos',
    category: 'poultry',
    minCookingTempC: 74,
    minCookingTempF: 165,
    restTimeMinutes: 0,
    cookingVisualIndicator: 'Carne totalmente opaca sin tonos rosados, jugos transparentes.',
    fridgeDays: '1 a 2 días',
    freezerMonths: '9 meses (trozos) / 1 año (entero)',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: '¡Atención crítica! Salmonella y Campylobacter proliferan aceleradamente en aves crudas sin frío.',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    roastingOvenTempC: 177,
    roastingTiming: 'Pechuga deshuesada: 20-30 min; Pollo entero (3-4 lbs): 1¼ a 1½ horas.',
    microbiologyWarning: 'Nunca lavar el pollo crudo bajo el chorro de agua para evitar salpicaduras contaminantes.',
    recommendationSummary: 'Cocción estricta a 74°C (165°F) en el centro térmico. En nevera crudo solo dura 1 a 2 días. Desechar de inmediato si pasa 2 horas a más de 4°C.'
  },

  // --- PESCADOS Y MARISCOS ---
  {
    id: 'fs_fish_finfish',
    foodName: 'Pescado Fresco (Corvina, Salmón, Atún, Bagre, Tilapia)',
    subType: 'Filetes, rodajas y entero (Peces de aleta)',
    category: 'fish_seafood',
    minCookingTempC: 63,
    minCookingTempF: 145,
    restTimeMinutes: 0,
    cookingVisualIndicator: 'Carne opaca y se separa fácilmente con un tenedor.',
    fridgeDays: '1 a 3 días',
    freezerMonths: '2 a 3 meses (grasos) / 6 a 8 meses (magros)',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Alto riesgo de formación de histamina y alteración organoléptica.',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    microbiologyWarning: 'Conservar en el estante más frío de la nevera en recipiente sellado.',
    recommendationSummary: 'Cocinar a 63°C (145°F) hasta opacidad. En refrigeración dura de 1 a 3 días máximo. En apagón >2 horas, desechar.'
  },
  {
    id: 'fs_seafood_shellfish',
    foodName: 'Mariscos (Camarones, Langostas, Cangrejos y Vieiras)',
    subType: 'Crustáceos y Moluscos frescos o congelados',
    category: 'fish_seafood',
    minCookingTempC: 63,
    minCookingTempF: 145,
    cookingVisualIndicator: 'Carne nacarada, blanca u opaca. En almejas y mejillones, conchas abiertas.',
    fridgeDays: '2 a 4 días',
    freezerMonths: '6 a 18 meses',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Desechar si se expone a >4°C por más de 2 horas.',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    recommendationSummary: 'Cocinar hasta que la carne esté opaca/nacarada y las conchas se abran. Desechar moluscos que permanezcan cerrados tras cocer.'
  },

  // --- HUEVOS Y DERIVADOS ---
  {
    id: 'fs_eggs_fresh',
    foodName: 'Huevos Frescos con Cáscara',
    subType: 'Huevos enteros crudos en cartón',
    category: 'eggs',
    minCookingTempC: 71,
    minCookingTempF: 160,
    cookingVisualIndicator: 'Yema y clara firmes (no líquidas).',
    fridgeDays: '3 a 5 semanas',
    freezerMonths: 'No congelar con cáscara (Batir claras/yemas sin cáscara: 12 meses)',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Desechar si se exponen a >4°C por más de 2 horas.',
    frozenOutageAction: 'DESECHAR',
    microbiologyWarning: 'Riesgo de Salmonella enteritidis presente dentro o en la cáscara.',
    recommendationSummary: 'Cocinar hasta yema y clara firmes. En nevera duran 3 a 5 semanas. No congelar enteros con cáscara.'
  },
  {
    id: 'fs_eggs_dishes',
    foodName: 'Platos con Huevo y Huevos Duros',
    subType: 'Frittata, quiche, huevos duros con cáscara, guisos',
    category: 'eggs',
    minCookingTempC: 71,
    minCookingTempF: 160,
    cookingVisualIndicator: 'Consistencia sólida y centro caliente.',
    fridgeDays: '1 semana (duros) / 3-4 días (platos cocidos)',
    freezerMonths: 'No congelar huevos duros',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Desechar en apagón >2 horas.',
    frozenOutageAction: 'DESECHAR',
    recommendationSummary: 'Huevos duros duran 1 semana en refrigerador. Platos cocidos con huevo deben alcanzar 71°C.'
  },

  // --- LÁCTEOS Y QUESOS ---
  {
    id: 'fs_dairy_milk',
    foodName: 'Leche, Nata, Crema Agria y Yogur',
    subType: 'Lácteos fluidos y fermentados abiertos o cerrados',
    category: 'dairy_cheese',
    minCookingTempC: 74,
    fridgeDays: '1 a 2 semanas (según fecha caducidad)',
    freezerMonths: '1 a 2 meses (puede perder textura)',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Desechar si se expone a >4°C por más de 2 horas.',
    frozenOutageAction: 'DESECHAR',
    recommendationSummary: 'En corte de luz >2 horas a más de 4°C, desechar la leche, nata, crema agria y yogur por proliferación ácida y bacteriana.'
  },
  {
    id: 'fs_cheese_soft',
    foodName: 'Quesos Blandos y Rallados',
    subType: 'Queso fresco, Mozzarella, Ricotta, Brie, Cottage, Quesos rallados',
    category: 'dairy_cheese',
    fridgeDays: '1 a 2 semanas',
    freezerMonths: 'No se congelan bien (pierden estructura)',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Riesgo de crecimiento de Listeria monocytogenes.',
    frozenOutageAction: 'DESECHAR',
    recommendationSummary: 'Los quesos blandos y rallados deben DESECHARSE en cortes de energía mayores a 2 horas a más de 4°C.'
  },
  {
    id: 'fs_cheese_hard',
    foodName: 'Quesos Duros y Procesados',
    subType: 'Cheddar, Parmesano, Suizo, Provolone, Queso procesado en bloque',
    category: 'dairy_cheese',
    fridgeDays: '3 a 4 semanas (bloque cerrado)',
    freezerMonths: '6 meses',
    powerOutageAction: 'MANTENER',
    powerOutageNote: 'Baja actividad de agua tolera variaciones temporales de temperatura.',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    recommendationSummary: 'Quesos duros como Cheddar o Parmesano se pueden MANTENER de forma segura aun después de 2 horas sin electricidad.'
  },
  {
    id: 'fs_butter_margarine',
    foodName: 'Mantequilla y Margarina',
    subType: 'Mantequilla con o sin sal en barra',
    category: 'dairy_cheese',
    fridgeDays: '1 a 3 meses',
    freezerMonths: '6 a 9 meses',
    powerOutageAction: 'MANTENER',
    powerOutageNote: 'Es segura de conservar tras corte de energía si no presenta mal olor o rancio.',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    recommendationSummary: 'Se puede MANTENER durante un corte de luz. El contenido graso y baja humedad evitan descomposición rápida.'
  },

  // --- SOBRAS Y CAZUELAS ---
  {
    id: 'fs_leftovers_all',
    foodName: 'Sobras de Comida Cocinada y Guisos',
    subType: 'Carne o aves cocidas, sopas, guisos, arroz cocido, pizza, nuggets',
    category: 'leftovers',
    minCookingTempC: 74,
    minCookingTempF: 165,
    cookingVisualIndicator: 'Hervir o recalentar homogéneamente echando humo caliente.',
    fridgeDays: '3 a 4 días',
    freezerMonths: '2 a 6 meses',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Nunca probar las sobras para ver si están buenas. Ante la duda, desechar.',
    frozenOutageAction: 'DESECHAR',
    recommendationSummary: 'Recalentar sobras siempre a 74°C (165°F). Guardar en nevera antes de 2 horas de cocinadas. En apagón >2h, desechar.'
  },

  // --- FRUTAS Y VERDURAS ---
  {
    id: 'fs_produce_fresh_cut',
    foodName: 'Verduras y Frutas Frescas Cortadas / Prelavadas',
    subType: 'Ensaladas preparadas, frutas troceadas, verduras precortadas, tofu, papas asadas',
    category: 'produce',
    fridgeDays: '3 a 5 días',
    freezerMonths: 'No recomendable en ensaladas',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'El corte rompe los tejidos celulares permitiendo penetración bacteriana.',
    frozenOutageAction: 'DESECHAR',
    recommendationSummary: 'Frutas y verduras cortadas o prelavadas deben DESECHARSE tras más de 2 horas sin refrigeración (<4°C).'
  },
  {
    id: 'fs_produce_uncut',
    foodName: 'Frutas y Verduras Enteras Sin Cortar',
    subType: 'Manzanas, cítricos, yuca entera, plátano verde, champiñones, hierbas frescas',
    category: 'produce',
    fridgeDays: '1 a 3 semanas',
    freezerMonths: 'No aplica en fresco',
    powerOutageAction: 'MANTENER',
    powerOutageNote: 'La cáscara intacta ofrece protección natural.',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    recommendationSummary: 'Se pueden MANTENER durante y después de un corte de luz. Lavar e higienizar antes de consumir o pelar.'
  },

  // --- PANES, PASTA Y SALSAS ---
  {
    id: 'fs_bakery_breads',
    foodName: 'Panes, Galletas, Tortillas y Tartas de Fruta',
    subType: 'Pan de molde, bollos, tortillas de maíz/trigo, waffles, tartas de frutas',
    category: 'grains_bakery',
    fridgeDays: '1 a 2 semanas',
    freezerMonths: '3 meses',
    powerOutageAction: 'MANTENER',
    powerOutageNote: 'Bajo riesgo microbiano por baja humedad.',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    recommendationSummary: 'Se pueden MANTENER en apagones. Desechar si muestran evidencias de humedad o moho.'
  },
  {
    id: 'fs_bakery_cream_pies',
    foodName: 'Pasteles y Tartas con Crema, Queso o Huevo',
    subType: 'Tarta de queso, quiche, pasteles con crema pastelera o bizcocho húmedo',
    category: 'grains_bakery',
    minCookingTempC: 71,
    fridgeDays: '3 a 4 días',
    freezerMonths: 'No se recomiendan congelar',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Humedad y proteínas lácteas/huevo son caldo de cultivo.',
    frozenOutageAction: 'DESECHAR',
    recommendationSummary: 'DESECHAR pasteles de crema o tarta de queso si pasan más de 2 horas sin frío constante.'
  },
  {
    id: 'fs_sauces_condiments',
    foodName: 'Aderezos, Mermeladas, Mostaza, Kétchup y Mantequilla de Maní',
    subType: 'Salsas a base de vinagre, soya, Worcestershire, barbacoa, mermeladas',
    category: 'sauces_other',
    fridgeDays: '3 a 12 meses',
    freezerMonths: 'No requiere',
    powerOutageAction: 'MANTENER',
    powerOutageNote: 'Su acidez o concentración de azúcar previene patógenos.',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    recommendationSummary: 'Se pueden MANTENER de forma segura en cortes de energía. Excepción: Mayonesa abierta o salsas cremosas (desechar si superan 10°C por >8h).'
  },

  // --- ALIMENTOS ADICIONALES (ARROZ, YUCA, PLATANO, SOPAS, CONSERVAS) ---
  {
    id: 'fs_cooked_rice_pasta',
    foodName: 'Arroz Cocido y Pasta Cocida',
    subType: 'Arroz blanco, arroz frito, fideos, pasta hervida con o sin salsa',
    category: 'leftovers',
    minCookingTempC: 74,
    minCookingTempF: 165,
    cookingVisualIndicator: 'Recalentar echando humo muy caliente en todo el plato.',
    fridgeDays: '3 a 4 días',
    freezerMonths: '1 a 2 meses',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Bacillus cereus produce toxinas resistentes al calor en el arroz a temperatura ambiente.',
    frozenOutageAction: 'DESECHAR',
    microbiologyWarning: 'Atención: El arroz cocido dejado a temperatura ambiente por más de 2 horas puede causar intoxicación severa por emético de B. cereus.',
    recommendationSummary: 'Refrigerar antes de 1 hora tras cocer. Recalentar a 74°C. Consumir máximo en 3-4 días. Desechar si estuvo en apagón o a temperatura ambiente.'
  },
  {
    id: 'fs_tubers_yuca_plantain',
    foodName: 'Yuca, Plátano Verde y Papas (Crudos y Cocidos)',
    subType: 'Yuca fresca/cocida, Plátanos, Papas asadas/cocidas',
    category: 'produce',
    minCookingTempC: 74,
    fridgeDays: '10 a 14 días (fresca entera) / 3-4 días (cocida)',
    freezerMonths: '10 a 12 meses (yuca/plátano troceado o blanqueado)',
    powerOutageAction: 'MANTENER',
    powerOutageNote: 'Si están enteros y crudos se MANTIENEN. Si están cocinados, DESECHAR tras 2h >4°C.',
    frozenOutageAction: 'VOLVER_A_CONGELAR',
    recommendationSummary: 'La yuca y plátano enteros frescos se conservan semanas. Si están cocinados o pelados en agua, refrigerar e ingerir antes de 4 días.'
  },
  {
    id: 'fs_soups_stews',
    foodName: 'Sopas, Caldos y Crema de Vegetales',
    subType: 'Sopa de pollo, caldo de res, crema de verduras, sancocho',
    category: 'leftovers',
    minCookingTempC: 74,
    minCookingTempF: 165,
    cookingVisualIndicator: 'Hervir burbujeante durante al menos 1 minuto.',
    fridgeDays: '3 a 4 días',
    freezerMonths: '2 a 3 meses',
    powerOutageAction: 'DESECHAR',
    powerOutageNote: 'Desechar si la sopa pasó más de 2 horas a más de 4°C.',
    frozenOutageAction: 'DESECHAR',
    microbiologyWarning: 'Las esporas de Clostridium perfringens sobreviven a la cocción ligera si el caldo se enfría lentamente a temperatura ambiente.',
    recommendationSummary: 'Enfriar rápido dividiendo en recipientes poco profundos antes de refrigerar. Recalentar hasta hervir (74°C).'
  }
];

// Interface for Dynamic Evaluation Results
export interface DynamicAnalysisResult {
  daysElapsed: number;
  maxSafeDays: number;
  percentUsed: number;
  status: 'SAFE' | 'WARNING' | 'DANGER';
  statusTitle: string;
  badgeClass: string;
  temperatureZone: string;
  zoneDescription: string;
  actionableRecommendation: string;
  detailedPoints: string[];
  microbialRiskInfo: string;
  cookingInstructions?: {
    minTempC: number;
    minTempF: number;
    restTimeMinutes?: number;
    indicator?: string;
  };
}

/**
 * Dynamic Food Safety Evaluator Engine
 * Calculates safety status based on food type, reception/entry date, storage temperature, condition, and state.
 */
export function evaluateDynamicFoodSafety(
  foodRecord: FoodSafetyRecord,
  entryDateStr: string,
  storageTempC: number,
  condition: 'refrigerated' | 'frozen' | 'power_outage' | 'room_temp' | 'hot_hold',
  state: 'crudo' | 'cocinado' | 'abierto'
): DynamicAnalysisResult {
  // 1. Compute Days Elapsed from Entry Date to Today
  const entryDate = new Date(entryDateStr);
  const today = new Date();
  // Strip time part for accuracy
  entryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - entryDate.getTime();
  const daysElapsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  // 2. Parse Max Safe Days based on Condition & Food Record
  let maxSafeDays = 4; // default fallback

  if (condition === 'frozen' || storageTempC <= -10) {
    // Freezer storage logic (Months -> Days approx)
    if (foodRecord.freezerMonths) {
      const match = foodRecord.freezerMonths.match(/(\d+)\s*a\s*(\d+)/);
      if (match) {
        maxSafeDays = parseInt(match[2], 10) * 30;
      } else {
        const singleMatch = foodRecord.freezerMonths.match(/(\d+)/);
        maxSafeDays = singleMatch ? parseInt(singleMatch[1], 10) * 30 : 180;
      }
    } else {
      maxSafeDays = 180; // 6 months default
    }
  } else if (condition === 'power_outage' || condition === 'room_temp') {
    // Perishable foods at room temp or power outage without cooling
    const isHighPerishable = ['poultry', 'meat', 'fish_seafood', 'dairy_cheese', 'eggs', 'leftovers'].includes(foodRecord.category);
    if (isHighPerishable || state === 'cocinado' || state === 'abierto') {
      maxSafeDays = 0.08; // 2 hours limit (~0.08 days)
    } else {
      maxSafeDays = 3; // e.g. uncut fruits, bread, sauces
    }
  } else {
    // Normal Refrigeration (≤ 4°C)
    if (state === 'cocinado') {
      maxSafeDays = 4; // Cooked leftovers standard = 3 to 4 days max
    } else if (foodRecord.fridgeDays) {
      if (foodRecord.fridgeDays.includes('semanas') || foodRecord.fridgeDays.includes('semana')) {
        const match = foodRecord.fridgeDays.match(/(\d+)\s*a\s*(\d+)/);
        if (match) {
          maxSafeDays = parseInt(match[2], 10) * 7;
        } else {
          const single = foodRecord.fridgeDays.match(/(\d+)/);
          maxSafeDays = single ? parseInt(single[1], 10) * 7 : 7;
        }
      } else {
        // Days
        const match = foodRecord.fridgeDays.match(/(\d+)\s*a\s*(\d+)/);
        if (match) {
          maxSafeDays = parseInt(match[2], 10);
        } else {
          const single = foodRecord.fridgeDays.match(/(\d+)/);
          maxSafeDays = single ? parseInt(single[1], 10) : 4;
        }
      }

      if (state === 'abierto') {
        maxSafeDays = Math.max(1, Math.floor(maxSafeDays * 0.6));
      }
    }
  }

  const percentUsed = Math.min(100, Math.round((daysElapsed / maxSafeDays) * 100));

  // 3. Temperature Zone Classification
  let temperatureZone = '';
  let zoneDescription = '';

  if (storageTempC <= -12) {
    temperatureZone = '❄️ Zona de Congelación Criógena (≤ -12°C)';
    zoneDescription = 'El desarrollo bacteriano se encuentra suspendido. La calidad nutricional y sensorial se preserva.';
  } else if (storageTempC >= -11 && storageTempC <= 4.0) {
    temperatureZone = '🟢 Zona de Refrigeración Óptima (0°C a 4°C)';
    zoneDescription = 'Rango recomendado por la FAO/USDA. Mantiene ralentizado el crecimiento microbiano.';
  } else if (storageTempC > 4.0 && storageTempC <= 60.0) {
    temperatureZone = '⚠️ ZONA DE PELIGRO MICROBIANO (4°C a 60°C)';
    zoneDescription = '¡Crítico! Rango donde bacterias patógenas duplican su población cada 20 minutos.';
  } else {
    temperatureZone = '🔥 Zona de Mantenimiento Caliente / Cocción (>60°C)';
    zoneDescription = 'Inactiva el crecimiento microbiano activo.';
  }

  // 4. Determine Safety Status (SAFE, WARNING, DANGER)
  let status: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';
  let statusTitle = '';
  let badgeClass = '';
  let actionableRecommendation = '';
  const detailedPoints: string[] = [];
  let microbialRiskInfo = '';

  const isDangerZone = storageTempC > 4.0 && storageTempC <= 60.0;
  const isHighRiskCategory = ['poultry', 'meat', 'fish_seafood', 'dairy_cheese', 'eggs', 'leftovers'].includes(foodRecord.category);

  // EVALUATION LOGIC
  if (condition === 'power_outage' && isDangerZone && isHighRiskCategory) {
    status = 'DANGER';
    statusTitle = '🔴 DESECHAR DE INMEDIATO (Corte de Luz >2h)';
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
    actionableRecommendation = 'Desechar sin probar ni oler. La temperatura superó los 4°C por más de 2 horas sin refrigeración constante.';
    microbialRiskInfo = 'Alto riesgo de proliferación masiva de Salmonella spp., Listeria monocytogenes y toxinas estafilocócicas que no se destruyen con el calor.';
    detailedPoints.push('El refrigerador cerrado solo mantiene frío seguro hasta por 4 horas.');
    detailedPoints.push('Nunca pruebes un alimento sospechoso para evaluar su seguridad.');
    detailedPoints.push('Las bacterias patógenas no suelen alterar el olor ni el sabor en fases iniciales.');
  } else if (condition === 'room_temp' && isHighRiskCategory && daysElapsed >= 0.08) {
    status = 'DANGER';
    statusTitle = '🔴 DESECHAR DE INMEDIATO (Exposición Ambiente >2h)';
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
    actionableRecommendation = 'Desechar inmediatamente. Alimentos perecederos crudos o cocidos no deben permanecer más de 2 horas entre 4°C y 60°C.';
    microbialRiskInfo = 'Multiplicación exponencial de bacterias. Formación potencial de enterotoxinas термоestables (Staphylococcus aureus, B. cereus).';
    detailedPoints.push('Regla de oro FAO: Si el ambiente supera los 30°C, el límite se reduce a solo 1 hora.');
  } else if (daysElapsed > maxSafeDays) {
    status = 'DANGER';
    statusTitle = `🔴 VENCIDO (Superó los ${maxSafeDays} días máx)`;
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
    actionableRecommendation = `Se han cumplido ${daysElapsed} días desde el ingreso. Ha superado el límite seguro de almacenamiento (${maxSafeDays} días). No consumir.`;
    microbialRiskInfo = foodRecord.microbiologyWarning || 'Crecimiento de patógenos psicrófilos (que crecen lentamente en frío) como Listeria monocytogenes.';
    detailedPoints.push(`Límite recomendado para ${foodRecord.foodName}: ${maxSafeDays} días.`);
    detailedPoints.push('Incluso con aspecto visual normal, la carga microbiana supera los umbrales de inocuidad.');
  } else if (daysElapsed >= Math.floor(maxSafeDays * 0.75) || (isDangerZone && storageTempC <= 8.0)) {
    status = 'WARNING';
    statusTitle = '🟡 CONSUMIR HOY MISMO / PRECAUCIÓN';
    badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    actionableRecommendation = `El alimento lleva ${daysElapsed} de ${maxSafeDays} días permitidos. Cocinar o consumir hoy mismo tras una verificación sensorial cuidadosa.`;
    microbialRiskInfo = 'Proceso inicial de proliferación microbiana o leve falla en la cadena de frío.';
    detailedPoints.push('Cocinar inmediatamente alcanzando la temperatura interna mínima recomendada.');
    detailedPoints.push('Si no se va a consumir hoy, congelar a -18°C si aún se conserva en buen estado.');
  } else {
    status = 'SAFE';
    statusTitle = '🟢 APTO Y SEGURO PARA CONSUMO';
    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    actionableRecommendation = `El alimento se encuentra en periodo óptimo (${daysElapsed} días transcurridos de ${maxSafeDays} días máximos). Mantener refrigerado a ≤4°C.`;
    microbialRiskInfo = 'Carga microbiana dentro de límites seguros de calidad e inocuidad alimentaria.';
    detailedPoints.push(`Almacenamiento seguro restante estimación: ~${Math.max(0, Math.round(maxSafeDays - daysElapsed))} días.`);
    detailedPoints.push('Mantener en recipiente limpio sellado para evitar contaminación cruzada por goteo.');
  }

  // Cooking instructions compilation
  let cookingInstructions;
  if (foodRecord.minCookingTempC) {
    cookingInstructions = {
      minTempC: foodRecord.minCookingTempC,
      minTempF: foodRecord.minCookingTempF || Math.round(foodRecord.minCookingTempC * 1.8 + 32),
      restTimeMinutes: foodRecord.restTimeMinutes,
      indicator: foodRecord.cookingVisualIndicator
    };
  }

  return {
    daysElapsed,
    maxSafeDays,
    percentUsed,
    status,
    statusTitle,
    badgeClass,
    temperatureZone,
    zoneDescription,
    actionableRecommendation,
    detailedPoints,
    microbialRiskInfo,
    cookingInstructions
  };
}

// Helper search function
export const queryFoodSafetyData = (
  searchTerm: string,
  categoryFilter?: string,
  conditionCategory?: string
) => {
  return FOOD_SAFETY_RECORDS.filter((rec) => {
    // Category match
    if (categoryFilter && categoryFilter !== 'all' && rec.category !== categoryFilter) {
      return false;
    }

    // Condition specific filtering
    if (conditionCategory === 'coccion' && !rec.minCookingTempC) {
      return false;
    }
    if (conditionCategory === 'corte_energia' && !rec.powerOutageAction) {
      return false;
    }
    if (conditionCategory === 'asado_horno' && !rec.roastingTiming && !rec.roastingOvenTempC) {
      return false;
    }

    // Text Search Match
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const matchName = rec.foodName.toLowerCase().includes(term);
    const matchSub = rec.subType?.toLowerCase().includes(term);
    const matchSummary = rec.recommendationSummary.toLowerCase().includes(term);
    const matchMicro = rec.microbiologyWarning?.toLowerCase().includes(term);

    return matchName || matchSub || matchSummary || matchMicro;
  });
};

// Guidelines for Thawing Methods (From FoodSafety.gov PDF 4)
export const THAWING_GUIDELINES = [
  {
    method: 'Descongelación en Refrigerador (Lenta e Higiénica)',
    ratio: 'Aproximadamente 24 horas por cada 2.0 a 2.5 kg (4-5 lbs).',
    safetyNote: 'Mantiene el alimento a <4°C durante todo el proceso. Una vez descongelado, la carne puede permanecer 1-2 días adicionales en refrigeración antes de cocinar.',
    badge: 'MÉTODO MÁS SEGURO'
  },
  {
    method: 'Descongelación en Agua Fría (Rápida)',
    ratio: 'Aproximadamente 30 minutos por cada 450 g (1 lb).',
    safetyNote: 'Sumergir el paquete hermético en agua fría. Cambiar el agua cada 30 minutos. Debe cocinarse inmediatamente tras la descongelación.',
    badge: 'Urgente / Seguro'
  },
  {
    method: 'Descongelación en Horno Microondas',
    ratio: 'Según peso y potencia del equipo.',
    safetyNote: 'Partes del alimento pueden comenzar a calentarse durante la descongelación. Debe cocinarse de inmediato sin pausa.',
    badge: 'Inmediato'
  }
];

