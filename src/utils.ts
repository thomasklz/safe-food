/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FoodItem, KitchenAuditItem } from './types';

// Preloaded mock items representing a typical Latin American household fridge/pantry (including Yuca, Corvina, Plátano Verde as pictured in slide 1).
export const getInitialFoodItems = (baseDateStr: string = '2026-05-26'): FoodItem[] => {
  const baseDate = new Date(baseDateStr);

  const getOffsetDateStr = (days: number): string => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'food_1',
      name: 'Pescado Fresco (Corvina)',
      category: 'fish',
      storageLocation: 'fridge',
      quantity: '2 filetes (~800g)',
      storageDate: getOffsetDateStr(-1), // Almacenado ayer
      expiryDate: getOffsetDateStr(0),  // Vence hoy (Consumo rápido necesario!)
      notes: 'Mantener en la parte más fría del refrigerador (estante inferior).',
    },
    {
      id: 'food_2',
      name: 'Pechuga de Pollo Cruda',
      category: 'meat',
      storageLocation: 'fridge',
      quantity: '1 kg',
      storageDate: getOffsetDateStr(-3), // Almacenado hace 3 días (¡Atención!)
      expiryDate: getOffsetDateStr(-1), // Venció ayer para refrigeración fresca cruda sin congelar
      notes: '¡Alerta! Lleva más de 2 días. Se recomienda cocinar inmediatamente a 74°C o desechar si presenta olor sospechoso.',
    },
    {
      id: 'food_3',
      name: 'Yuca Fresca (Nutrenes)',
      category: 'vegetable',
      storageLocation: 'pantry',
      quantity: '3 unidades medianas',
      storageDate: getOffsetDateStr(-2),
      expiryDate: getOffsetDateStr(8),
      notes: 'Excelente fuente de fibra, hierro y carbohidratos complejos.',
    },
    {
      id: 'food_4',
      name: 'Plátano Verde (Barraganete)',
      category: 'vegetable',
      storageLocation: 'pantry',
      quantity: '1 mano (5 unidades)',
      storageDate: getOffsetDateStr(-3),
      expiryDate: getOffsetDateStr(5),
      notes: 'No refrigerar si están verdes para que maduren correctamente.',
    },
    {
      id: 'food_5',
      name: 'Leche Pasteurizada',
      category: 'dairy',
      storageLocation: 'fridge',
      quantity: '1 litro (abierto)',
      storageDate: getOffsetDateStr(-4),
      expiryDate: getOffsetDateStr(-1), // Expirado hace un día
      notes: 'Revisar características organolépticas antes de usar.',
    },
    {
      id: 'food_6',
      name: 'Espinacas Frescas',
      category: 'vegetable',
      storageLocation: 'fridge',
      quantity: '1 atado grande',
      storageDate: getOffsetDateStr(-1),
      expiryDate: getOffsetDateStr(3),
      notes: 'Lavar antes de consumir con abundante agua segura y desinfectante de alimentos.',
    }
  ];
};

// Calculate food status dynamically
export interface FoodStatus {
  daysLeft: number;
  statusText: 'Excelente' | 'Consumir Pronto' | '¡Riesgo / Expirado!';
  statusColor: string; // Tailwind class
  statusIconBg: string; // Tailwind class
}

export const getFoodStatus = (expiryDateStr: string, currentDateStr: string = '2026-05-26'): FoodStatus => {
  const expiry = new Date(expiryDateStr);
  const current = new Date(currentDateStr);
  
  // Reset hours to compare dates cleanly
  expiry.setHours(0,0,0,0);
  current.setHours(0,0,0,0);

  const diffTime = expiry.getTime() - current.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      daysLeft,
      statusText: '¡Riesgo / Expirado!',
      statusColor: 'text-rose-600 font-semibold',
      statusIconBg: 'bg-rose-100 text-rose-700',
    };
  } else if (daysLeft <= 1) {
    return {
      daysLeft,
      statusText: 'Consumir Pronto',
      statusColor: 'text-amber-600 font-semibold',
      statusIconBg: 'bg-amber-100 text-amber-700',
    };
  } else {
    return {
      daysLeft,
      statusText: 'Excelente',
      statusColor: 'text-emerald-700',
      statusIconBg: 'bg-emerald-100 text-emerald-700',
    };
  }
};

// Optimal guidelines and kitchen tips
export const FOOD_SAFETY_GUIDELINES = {
  refrigeratorTemp: {
    recommended: '2°C a 4°C',
    alertThreshold: 5.0, // °C
    info: 'Temperaturas superiores a 4°C aceleran el crecimiento microbiano patógeno en alimentos de alto riesgo.'
  },
  freezerTemp: {
    recommended: '-18°C o inferior',
    info: 'Mantiene suspendido el crecimiento microbiano indefinidamente, conserva nutrientes por meses.'
  },
  safeTemperatures: [
    { item: 'Aves (Pollo, Pavo)', temp: '74 °C', desc: 'Cocción completa para eliminar Salmonella y Campylobacter.' },
    { item: 'Pescados y Mariscos', temp: '63 °C', desc: 'Evita parásitos y bacterias marinas nocivas.' },
    { item: 'Carne de Res / Cerda (Cortes)', temp: '63 °C', desc: 'Dejar reposar 3 minutos para asegurar la eliminación de patógenos.' },
    { item: 'Carne Molida', temp: '71 °C', desc: 'Requiere mayor cocción por la manipulación de molienda externa.' },
    { item: 'Sobras de Comida', temp: '74 °C', desc: 'Recalentar una sola vez de forma homogénea.' },
  ],
  hygieneRules: [
    'Lavarse las manos por al menos 20 segundos antes y después de manipular alimentos.',
    'Evitar la contaminación cruzada: use tablas de picar diferentes para carnes crudas y alimentos listos para consumir.',
    'Nunca descongelar alimentos a temperatura ambiente; use refrigerado progresivo, microondas o agua fría fluida.',
    'Mantener la comida cocinada fuera de la "Zona de Peligro" (5°C - 60°C) por no más de 2 horas (o 1 hora si hace calor).'
  ]
};

// Questions for Household Safety Audit
export const getKitchenAuditQuestions = (): KitchenAuditItem[] => [
  {
    id: 'audit_1',
    question: '¿Cómo descongelas las carnes (pollo, res, pescado) habitualmente?',
    category: 'descongelacion',
    options: [
      {
        text: 'Sobre el mostrador de la cocina a temperatura ambiente.',
        score: 0,
        feedback: '¡Peligro! Favorece la multiplicación rápida de bacterias patógenas en la superficie del alimento mientras el centro se descongela.'
      },
      {
        text: 'En un recipiente con agua tibia estática en el fregadero.',
        score: 1,
        feedback: 'No recomendado. La temperatura tibia estimula toxinas y bacterias velozmente.'
      },
      {
        text: 'En el estante inferior de la nevera (descongelación lenta) o microondas para cocinar de inmediato.',
        score: 2,
        feedback: '¡Excelente! Es el método más seguro puesto que mantiene el producto por debajo de la zona de riesgo (5°C).'
      }
    ]
  },
  {
    id: 'audit_2',
    question: '¿Qué herramientas utilizas al picar vegetales y carnes crudas en la misma comida?',
    category: 'higiene',
    options: [
      {
        text: 'La misma tabla y cuchillo sin lavar entre ingredientes.',
        score: 0,
        feedback: '¡Riesgo crítico de contaminación cruzada! Las bacterias de la carne cruda pasan directamente a los vegetales que consumirás frescos.'
      },
      {
        text: 'La misma tabla y cuchillo, dándoles una limpieza rápida solo con agua.',
        score: 1,
        feedback: 'Regular. El agua sola no elimina la capa grasa biológica; requiere jabón y desinfectante o cambio físico.'
      },
      {
        text: 'Tablas de picar distintas (por ejemplo, verde para vegetales, roja para carnes) y utensilios lavados con jabón y agua caliente.',
        score: 2,
        feedback: '¡Impecable! Elimina eficazmente la transferencia de microorganismos patógenos invisibles.'
      }
    ]
  },
  {
    id: 'audit_3',
    question: '¿Cómo controlas o conoces la temperatura real de tu refrigerador?',
    category: 'temperatura',
    options: [
      {
        text: 'No la controlo, asumo que está bien porque se siente fría.',
        score: 0,
        feedback: 'Riesgo. Los termostatos analógicos integrados suelen descalibrarse con facilidad.'
      },
      {
        text: 'La ajusto según las estaciones (invierno/verano) de forma intuitiva.',
        score: 1,
        feedback: 'Parcialmente útil, pero sigue propensa a picos de calor por la apertura frecuente de puertas.'
      },
      {
        text: 'Uso un termómetro interno calibrado vigilando que esté siempre entre 2°C y 4°C.',
        score: 2,
        feedback: '¡Sobresaliente! El control numérico evita el florecimiento silente de patógenos como Listeria.'
      }
    ]
  },
  {
    id: 'audit_4',
    question: '¿Dónde almacenas habitualmente las carnes crudas dentro del refrigerador?',
    category: 'almacenamiento',
    options: [
      {
        text: 'En el estante superior o donde haya espacio disponible, a veces sin tapa.',
        score: 0,
        feedback: '¡Altamente peligroso! Los jugos exudados por las carnes crudas pueden gotear sobre platos preparados o postres inferiores.'
      },
      {
        text: 'En estantes medios con un plato plástico debajo.',
        score: 1,
        feedback: 'Moderado, pero sigue existiendo riesgo por contacto aéreo o humedad acumulada.'
      },
      {
        text: 'En cajones específicos o en el estante inferior, dentro de envases herméticos bien sellados.',
        score: 2,
        feedback: '¡Perfecto! En la parte inferior, la temperatura es más fría y la hermeticidad evita goteos y contaminaciones cruzadas.'
      }
    ]
  },
  {
    id: 'audit_5',
    question: 'Si preparas una comida y no se consume toda, ¿cuánto tiempo pasa antes de guardarla en la nevera?',
    category: 'almacenamiento',
    options: [
      {
        text: 'La dejo en la olla hasta la cena del día siguiente o hasta que se enfríe del todo a la intemperie.',
        score: 0,
        feedback: 'Fomento microbiano. Dejar alimentos cocidos a temperatura ambiente por más de 2 horas estimula esporas altamente termorresistentes.'
      },
      {
        text: 'La guardo en la nevera apenas pasan 3 o 4 horas de reposo.',
        score: 1,
        feedback: 'Poco seguro. Supera el límite máximo seguro de 2 horas (especialmente peligrosa con el arroz cocido y bacilos).'
      },
      {
        text: 'La traspaso a un envase poco profundo y la refrigero antes de que pasen 2 horas de cocinada.',
        score: 2,
        feedback: '¡Extraordinario! Enfriar rápido detiene el ciclo de germinación de bacterias y toxinas.'
      }
    ]
  }
];
