import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Clave API de Gemini ausente.' });
  }

  const { items } = req.body || {};
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Formato de inventario incorrecto.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const itemsDescription = items.map((item: any) => 
      `- ${item.name} (${item.category}): Almacenado el ${item.storageDate}, vence el ${item.expiryDate}. Ubicado en ${item.storageLocation}. Notas: ${item.notes || 'Ninguna'}`
    ).join('\n');

    const prompt = `Analiza el estado de inocuidad y riesgos biológicos del siguiente inventario de un refrigerador/cocina hogareña:
${itemsDescription}

Brinda un veredicto de inocuidad en formato JSON estricto. Determina cuál es el alimento con mayor prioridad de consumo o riesgo inminente de contaminación/enfermedad transmitida por alimentos (como Salmonella, Listeria monocytogenes, o toxinas fúngicas), explica de manera científica pero entendible el riesgo biológico asociado, y provee 3 recomendaciones inmediatas para el hogar.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'Breve resumen general (2 a 3 oraciones) del estado de inocuidad de esta cocina' },
            mainRiskItem: { type: Type.STRING, description: 'Nombre exacto del alimento detectado con mayor peligro o urgencia de consumo' },
            mainRiskExplanation: { type: Type.STRING, description: 'Explicación del riesgo biológico preciso (bacterias asociadas, contaminación cruzada, tiempo o temperatura)' },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Tres recomendaciones de acción concretas e inmediatas en materia de manipulación o disposición'
            }
          },
          required: ['summary', 'mainRiskItem', 'mainRiskExplanation', 'recommendations']
        }
      }
    });

    const analysisData = JSON.parse(response.text || '{}');
    return res.status(200).json(analysisData);
  } catch (error: any) {
    console.error('Error en /api/fridge-analyze:', error);
    return res.status(500).json({ error: error.message || 'Error al analizar almacenamiento de alimentos.' });
  }
}
