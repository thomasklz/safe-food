const GEMINI_MODELS = [
  ...(process.env.GEMINI_MODEL || '').split(','),
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
]
  .map((model) => model.trim())
  .filter((model) => model && !model.startsWith('gemini-1.5') && !model.startsWith('gemini-2.'))
  .filter((model, index, models) => models.indexOf(model) === index);

function getGeminiText(data: any) {
  return data?.candidates?.[0]?.content?.parts
    ?.map((part: any) => part.text || '')
    .join('')
    .trim();
}

async function generateJsonWithGemini(apiKey: string, prompt: string) {
  let lastError = '';

  for (const model of GEMINI_MODELS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8500);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              maxOutputTokens: 900,
            },
          }),
          signal: controller.signal,
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        lastError = data?.error?.message || `Gemini respondió HTTP ${response.status}`;
        continue;
      }

      const text = getGeminiText(data);
      if (!text) {
        lastError = 'Gemini no devolvió contenido para el análisis.';
        continue;
      }

      return JSON.parse(text);
    } catch (error: any) {
      lastError = error?.name === 'AbortError'
        ? `Tiempo agotado consultando ${model}`
        : error?.message || 'Error desconocido consultando Gemini';
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(
    `No se pudo completar el análisis IA. Modelos intentados: ${GEMINI_MODELS.join(', ')}. Detalle: ${lastError}`
  );
}

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
    const itemsDescription = items.map((item: any) => 
      `- ${item.name} (${item.category}): Almacenado el ${item.storageDate}, vence el ${item.expiryDate}. Ubicado en ${item.storageLocation}. Notas: ${item.notes || 'Ninguna'}`
    ).join('\n');

    const prompt = `Analiza el estado de inocuidad y riesgos biológicos del siguiente inventario de un refrigerador/cocina hogareña:
${itemsDescription}

Devuelve únicamente JSON válido con esta forma exacta:
{
  "summary": "Breve resumen general de 2 a 3 oraciones del estado de inocuidad de esta cocina.",
  "mainRiskItem": "Nombre exacto del alimento con mayor peligro o urgencia de consumo.",
  "mainRiskExplanation": "Explicación entendible del riesgo biológico: bacterias asociadas, contaminación cruzada, tiempo o temperatura.",
  "recommendations": ["Recomendación inmediata 1", "Recomendación inmediata 2", "Recomendación inmediata 3"]
}`;

    const analysisData = await generateJsonWithGemini(apiKey, prompt);
    return res.status(200).json(analysisData);
  } catch (error: any) {
    console.error('Error en /api/fridge-analyze:', error);
    return res.status(500).json({ error: error.message || 'Error al analizar almacenamiento de alimentos.' });
  }
}
