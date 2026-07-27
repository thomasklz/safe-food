import { GoogleGenAI } from '@google/genai';
import { createGeminiClient, generateWithFallback } from './gemini';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Clave API de Gemini ausente.' });
  }

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Falta el historial de mensajes o formato incorrecto.' });
  }

  try {
    const ai = createGeminiClient(apiKey) as GoogleGenAI;
    const formattedContents = messages.map((msg: any) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const response = await generateWithFallback(ai, {
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

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    return res.status(500).json({ error: error.message || 'Error al procesar la respuesta con Gemini IA.' });
  }
}
