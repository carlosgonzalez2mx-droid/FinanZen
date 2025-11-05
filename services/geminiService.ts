import { GoogleGenAI } from "@google/genai";
import type { MainCategory, ReceiptData } from '../types';
import { INITIAL_BUDGET_CATEGORIES } from '../constants';

const API_KEY = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Please set VITE_API_KEY in your .env file.");
}

// Solo inicializar si hay API_KEY, de lo contrario será null
let ai: GoogleGenAI | null = null;
if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Error initializing GoogleGenAI:", error);
  }
}

const categoryStructure = INITIAL_BUDGET_CATEGORIES.reduce((acc, cat) => {
  acc[cat.name] = cat.subcategories;
  return acc;
}, {} as Record<MainCategory, readonly string[]>);

export async function analyzeReceipt(base64Image: string): Promise<ReceiptData> {
  // Usar gemini-2.0-flash-exp - Modelo gratuito, rápido y compatible con imágenes
  const model = 'gemini-2.0-flash-exp';

  if (!ai) {
    throw new Error("GoogleGenAI no está inicializado. Por favor, configura VITE_API_KEY en tu archivo .env");
  }

  const prompt = `Analiza esta imagen de un recibo. Extrae el nombre del comercio, la cantidad total y la fecha de la transacción. Basado en el comercio, sugiere una categoría principal y una subcategoría de la siguiente estructura JSON: ${JSON.stringify(categoryStructure)}. La subcategoría debe pertenecer a la categoría principal sugerida. Formatea la fecha como YYYY-MM-DD.

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura:
{
  "merchant": "nombre del comercio",
  "amount": número (sin símbolos de moneda),
  "date": "YYYY-MM-DD",
  "category": "una de las categorías principales de la lista",
  "subcategory": "una subcategoría válida para esa categoría"
}`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
            { text: prompt }
          ]
        }
      ]
    });
    
    let jsonString = response.text?.trim() || response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!jsonString) {
      throw new Error("No se recibió respuesta del modelo de Gemini");
    }

    // Limpiar markdown code blocks si existen
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsedData = JSON.parse(jsonString) as ReceiptData;

    // Validate that the returned category and subcategory are valid
    const validMainCategories = Object.keys(categoryStructure) as MainCategory[];
    if (!validMainCategories.includes(parsedData.category)) {
        parsedData.category = 'GASTOS PERSONALES';
        parsedData.subcategory = 'Otros gastos personales';
        return parsedData;
    }

    const validSubcategories = categoryStructure[parsedData.category];
    if (!validSubcategories.includes(parsedData.subcategory)) {
        parsedData.subcategory = validSubcategories[0] || 'Otros gastos personales';
    }

    return parsedData;

  } catch (error: any) {
    console.error("Error analyzing receipt with Gemini:", error);
    const errorMessage = error?.message || error?.toString() || "Error desconocido";
    throw new Error(`Error al procesar la imagen del recibo: ${errorMessage}`);
  }
}

export async function analyzeBudgetPDF(base64Pdf: string): Promise<Array<{ subcategory: string; amount: number }>> {
  // Usar gemini-2.0-flash-exp - Modelo gratuito, rápido y compatible con PDFs
  const model = 'gemini-2.0-flash-exp';

  const allSubcategories = INITIAL_BUDGET_CATEGORIES.flatMap(c => c.subcategories);

  if (!ai) {
    throw new Error("GoogleGenAI no está inicializado. Por favor, configura VITE_API_KEY en tu archivo .env");
  }

  const prompt = `Analiza este documento PDF que contiene un presupuesto. Extrae cada línea de gasto con su monto presupuestado. Para cada línea, encuentra la subcategoría más apropiada de la siguiente lista de subcategorías válidas: ${JSON.stringify(allSubcategories)}.

Devuelve ÚNICAMENTE un array de objetos JSON válido con esta estructura:
[
  {
    "subcategory": "nombre exacto de la subcategoría de la lista",
    "amount": número (sin símbolos de moneda)
  }
]

Asegúrate de que el valor de 'subcategory' sea SIEMPRE uno de la lista proporcionada.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Pdf,
              },
            },
            { text: prompt }
          ]
        }
      ]
    });

    let jsonString = response.text?.trim() || response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!jsonString) {
      throw new Error("No se recibió respuesta del modelo de Gemini");
    }

    // Limpiar markdown code blocks si existen
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsedData = JSON.parse(jsonString) as Array<{ subcategory: string; amount: number }>;

    // Post-process validation to ensure data integrity
    // Fix: Widen the type of the Set to `Set<string>` to allow checking against a generic string from the parsed JSON.
    const validSubcategorySet = new Set<string>(allSubcategories);
    const validatedData = parsedData.filter(item => validSubcategorySet.has(item.subcategory));

    return validatedData;

  } catch (error: any) {
    console.error("Error analyzing budget PDF with Gemini:", error);
    const errorMessage = error?.message || error?.toString() || "Error desconocido";
    throw new Error(`Error al procesar el documento PDF: ${errorMessage}`);
  }
}