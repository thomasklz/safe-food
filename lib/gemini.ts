import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

export const GEMINI_MODELS = (process.env.GEMINI_MODEL || 'gemini-2.5-flash,gemini-2.0-flash')
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);

export function createGeminiClient(apiKey = process.env.GEMINI_API_KEY) {
  if (!apiKey) return null;

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function generateWithFallback(ai: GoogleGenAI, config: any) {
  let lastErr: any = null;

  for (const model of GEMINI_MODELS) {
    try {
      return await ai.models.generateContent({ ...config, model });
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying next fallback:`, err.message || err);
      lastErr = err;
    }
  }

  const models = GEMINI_MODELS.join(', ');
  const details = lastErr?.message || 'No hubo detalle del proveedor.';
  throw new Error(
    `No se pudo generar contenido con Gemini. Modelos intentados: ${models}. ` +
      `Si tu cuenta no tiene acceso, define GEMINI_MODEL con un modelo listado por ModelService.ListModels. Detalle: ${details}`
  );
}
