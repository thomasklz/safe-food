/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client to prevent startup failures if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('Advertencia: GEMINI_API_KEY no se encuentra definida en las variables de entorno.');
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ---------------- API ENDPOINTS -----------------

const apiRouter = express.Router();

// 1. Health & Config endpoint
apiRouter.get('/config', (req, res) => {
  const isKeyAvailable = !!process.env.GEMINI_API_KEY;
  res.json({
    hasApiKey: isKeyAvailable,
    appName: 'SafeFood IA',
    currentTime: new Date().toISOString()
  });
});

// 2. Interactive Tutor Chat - Educational advice on food safety and household nutrition
apiRouter.post('/chat', async (req, res) => {
  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      error: 'Clave API de Gemini ausente. Por favor, añádela en la barra de Ajustes (Secrets).'
    });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Falta el historial de mensajes o el formato es incorrecto.' });
  }

  try {
    const formattedContents = messages.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: formattedContents,
      config: {
        systemInstruction: `Eres "SafeFood IA", un tutor y asistente científico interactivo de primer nivel experto en Inocuidad Alimentaria (Food Safety) y Nutrición Familiar Doméstica.
Tu misión es educar y orientar de manera muy detallada, científica pero accesible, sobre:
1. Buenas prácticas de higiene y manipulación (lavado de manos, evitar contaminación cruzada, desinfección).
2. Prevención de ETS (Enfermedades Transmitidas por Alimentos): temperaturas de cocción seguras (ej. pollo a 74°C, pescado a 63°C), la "Zona de Peligro de Temperatura" (5°C - 60°C).
3. Conservación óptima en el refrigerador por estantes y reducción del desperdicio alimentario.
4. Nutrición saludable basada en ingredientes disponibles del hogar, valorando la cocina tradicional andina y latinoamericana (como el plátano verde, la corvina, la yuca).

Estilo de Respuesta:
- Habla en español ecuatoriano/latinoamericano neutral, con un tono pedagógico, cordial, estimulante, serio en lo científico pero amigable para una madre o padre de familia.
- Emplea formato Markdown rico: listas numeradas, negritas para puntos críticos de seguridad, y tablas si explicas temperaturas o tiempos de conservación.
- No uses terminología técnica excesivamente densa sin antes explicarla sencillamente (por ejemplo, explica qué es una bacteria esporulada o la contaminación cruzada).
- Añade siempre una sección breve de "Tip de Inocuidad" o "Dato Curioso de Nutrición" al final de tus respuestas.`
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    res.status(500).json({ error: error.message || 'Error al procesar la respuesta con Gemini IA.' });
  }
});

// 3. Smart Safe Recipe Generator - Suggests menus leveraging items about to expire with active hygiene steps
apiRouter.post('/recipe', async (req, res) => {
  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      error: 'Clave API de Gemini ausente. Añade la variable GEMINI_API_KEY para habilitar esta IA.'
    });
  }

  const { ingredients, quantity, pantryItems } = req.body;

  try {
    const prompt = `Imagina que eres un chef experto certificado en inocuidad alimentaria. El usuario quiere preparar un menú nutritivo y seguro utilizando prioritariamente estos ingredientes próximos a vencer: ${ingredients.join(', ')}.
Además tiene disponible en su despensa: ${pantryItems ? pantryItems.join(', ') : 'ingredientes básicos de cocina'}.

Por favor, genera una receta segura, balanceada y deliciosa estructurada en formato JSON estricto basada en el esquema solicitado.
En la sección "safetyPrecautions", incluye al menos 3 medidas de inocuidad específicas relacionadas con estos ingredientes (por ejemplo, temperaturas internas de cocción, desinfección previa o riesgos de contaminación cruzada según el tipo de alimento como carne, pescado, lácteos, etc.).
En "nutritionalBenefits", detalla qué nutrientes aporta la receta al cuerpo de forma clara.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
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
    res.json(recipeData);
  } catch (error: any) {
    console.error('Error en /api/recipe:', error);
    res.status(500).json({ error: error.message || 'Error al generar la receta inteligente.' });
  }
});

// 4. Fridge Spoilage and Risk Analysis - Analyzes whole inventory for hygiene warnings
apiRouter.post('/fridge-analyze', async (req, res) => {
  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({ error: 'Clave API de Gemini ausente.' });
  }

  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Formato de inventario incorrecto.' });
  }

  try {
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
    res.json(analysisData);
  } catch (error: any) {
    console.error('Error en /api/fridge-analyze:', error);
    res.status(500).json({ error: error.message || 'Error al analizar almacenamiento de alimentos.' });
  }
});

// Mount API router under both /api and / so all Vercel function routing matches seamlessly
app.use('/api', apiRouter);
app.use('/', apiRouter);


// ---------------- HOST SERVING WORKFLOW -----------------

async function startServer() {
  // Vite integration middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SafeFood IA FullStack] Servidor de desarrollo corriendo en http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
