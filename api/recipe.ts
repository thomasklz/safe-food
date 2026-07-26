import { GoogleGenAI, Type } from '@google/genai';

async function generateWithFallback(ai: GoogleGenAI, config: any) {
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];
  let lastErr: any = null;
  for (const model of models) {
    try {
      return await ai.models.generateContent({ ...config, model });
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying next fallback:`, err.message || err);
      lastErr = err;
    }
  }
  throw lastErr;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Clave API de Gemini ausente.' });
  }

  const { ingredients, pantryItems } = req.body || {};
  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'Falta la lista de ingredientes.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Imagina que eres un chef experto certificado en inocuidad alimentaria. El usuario quiere preparar un menú nutritivo y seguro utilizando prioritariamente estos ingredientes próximos a vencer: ${ingredients.join(', ')}.
Además tiene disponible en su despensa: ${pantryItems ? pantryItems.join(', ') : 'ingredientes básicos de cocina'}.

Por favor, genera una receta segura, balanceada y deliciosa estructurada en formato JSON estricto basada en el esquema solicitado.
En la sección "safetyPrecautions", incluye al menos 3 medidas de inocuidad específicas relacionadas con estos ingredientes (por ejemplo, temperaturas internas de cocción, desinfección previa o riesgos de contaminación cruzada según el tipo de alimento como carne, pescado, lácteos, etc.).
En "nutritionalBenefits", detalla qué nutrientes aporta la receta al cuerpo de forma clara.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Nombre llamativo de la receta' },
            prepTime: { type: Type.STRING, description: 'Tiempo estimado de preparación, ej. 25 minutos' },
            ingredientsUsed: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Ingredientes de la nevera o despensa que utiliza la receta'
            },
            otherIngredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Ingredientes adicionales muy básicos sugeridos'
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Pasos cronológicos detallados de preparación'
            },
            safetyPrecautions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Precauciones sanitarias estrictas durante la preparación de este plato (temperatura interna, utensilios, desinfección, etc.)'
            },
            nutritionalBenefits: {
              type: Type.STRING,
              description: 'Beneficios nutricionales detallados de consumir este plato en el hogar'
            }
          },
          required: ['name', 'prepTime', 'ingredientsUsed', 'otherIngredients', 'steps', 'safetyPrecautions', 'nutritionalBenefits']
        }
      }
    });

    const recipeData = JSON.parse(response.text || '{}');
    return res.status(200).json(recipeData);
  } catch (error: any) {
    console.error('Error en /api/recipe:', error);
    return res.status(500).json({ error: error.message || 'Error al generar la receta inteligente.' });
  }
}
