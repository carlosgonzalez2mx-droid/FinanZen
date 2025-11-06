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

export async function analyzeBudgetPDF(base64Pdf: string, userSubcategories?: string[]): Promise<Array<{ subcategory: string; amount: number }>> {
  // Usar gemini-2.0-flash-exp - Modelo gratuito, rápido y compatible con PDFs
  const model = 'gemini-2.0-flash-exp';

  // Usar las subcategorías personalizadas del usuario si están disponibles, si no usar las iniciales
  const allSubcategories = userSubcategories && userSubcategories.length > 0
    ? userSubcategories
    : INITIAL_BUDGET_CATEGORIES.flatMap(c => c.subcategories);

  console.log(`📋 Usando ${allSubcategories.length} subcategorías para el análisis:`);
  console.log('Primeras 20 subcategorías:', allSubcategories.slice(0, 20));

  // Verificar si UBER está en la lista
  const hasUber = allSubcategories.some(s => s.toLowerCase().includes('uber'));
  console.log(`¿Contiene "UBER"?: ${hasUber}`);

  if (!ai) {
    throw new Error("GoogleGenAI no está inicializado. Por favor, configura VITE_API_KEY en tu archivo .env");
  }

  // PASO 1: Extraer todas las transacciones con descripción del comercio
  const extractionPrompt = `Analiza este documento PDF que contiene un estado de cuenta o lista de transacciones.

INSTRUCCIONES:
1. Identifica TODAS las transacciones con montos de dinero
2. Ignora: créditos, abonos, pagos recibidos, intereses a favor
3. Incluye SOLO: gastos, compras, cargos, débitos
4. Para cada transacción, extrae:
   - description: el nombre del comercio o descripción del gasto (texto completo como aparece)
   - amount: el monto (número positivo sin símbolos)

FORMATO DE RESPUESTA (JSON válido):
[
  {"description": "OXXO PLAZA CENTRO", "amount": 150.50},
  {"description": "WALMART SUPERCENTER", "amount": 200.00},
  {"description": "UBER TRIP", "amount": 85.00}
]

IMPORTANTE:
- Devuelve SOLO el JSON, sin explicaciones
- Incluye TODOS los gastos que encuentres
- Mantén la descripción exacta como aparece en el documento
- Los montos deben ser números positivos sin símbolos de moneda`;

  try {
    console.log('📄 Paso 1: Extrayendo transacciones del PDF...');

    const extractionResponse = await ai.models.generateContent({
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
            { text: extractionPrompt }
          ]
        }
      ]
    });

    let extractedJson = extractionResponse.text?.trim() || extractionResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!extractedJson) {
      throw new Error("No se recibió respuesta del modelo de Gemini");
    }

    // Limpiar markdown code blocks
    extractedJson = extractedJson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const extractedTransactions = JSON.parse(extractedJson) as Array<{ description: string; amount: number }>;

    console.log(`✅ Extraídas ${extractedTransactions.length} transacciones`);

    // PASO 2: Emparejar transacciones con subcategorías usando coincidencia de texto
    console.log('🔍 Paso 2: Emparejando transacciones con subcategorías...');

    const matched: Array<{ subcategory: string; amount: number }> = [];
    const unmatched: Array<{ description: string; amount: number }> = [];

    for (const transaction of extractedTransactions) {
      const desc = transaction.description.toLowerCase();
      let foundMatch = false;

      // Buscar coincidencia exacta o parcial con subcategorías
      for (const subcategory of allSubcategories) {
        const subLower = subcategory.toLowerCase();

        // Coincidencia si la subcategoría está en la descripción o viceversa
        if (desc.includes(subLower) || subLower.includes(desc)) {
          console.log(`   ✓ Match: "${transaction.description}" → "${subcategory}" ($${transaction.amount})`);
          matched.push({ subcategory, amount: transaction.amount });
          foundMatch = true;
          break;
        }
      }

      if (!foundMatch) {
        console.log(`   ✗ No match: "${transaction.description}" ($${transaction.amount})`);
        unmatched.push(transaction);
      }
    }

    console.log(`✅ Emparejadas automáticamente: ${matched.length} transacciones`);
    console.log(`❓ Pendientes de clasificar con IA: ${unmatched.length} transacciones`);

    // PASO 3: Usar IA solo para transacciones no emparejadas
    if (unmatched.length > 0) {
      console.log('🤖 Paso 3: Clasificando transacciones restantes con IA...');

      const classificationPrompt = `Clasifica estas transacciones en las subcategorías más apropiadas.

TRANSACCIONES A CLASIFICAR:
${JSON.stringify(unmatched, null, 2)}

SUBCATEGORÍAS DISPONIBLES:
${JSON.stringify(allSubcategories, null, 2)}

REGLAS DE CATEGORIZACIÓN:
- Restaurantes/comida fuera → "Restaurantes"
- Supermercados/tiendas de comida → "Despensa"
- Gasolina/combustible → "Gasolina y fluidos"
- Transporte público/Uber/taxis → "Transporte público"
- Vuelos/avión → "Vuelos"
- Estacionamiento/casetas/peaje → "Estacionamiento y casetas"
- Amazon/compras online → "Otros gastos personales"
- Netflix/Disney/streaming video → "Suscripciones de video"
- Spotify/Apple Music/streaming audio → "Suscripciones de audio"
- Rappi/Uber Eats/apps de comida → "Restaurantes"
- Apps/software/tecnología → "Artículos de tecnología"
- Hoteles/hospedaje → "Hospedaje"
- Viajes/paquetes turísticos → "Paquetes de viajes"
- Ropa → "Ropa adultos"
- Zapatos → "Zapatos adultos"
- Electricidad/luz/CFE → "Electricidad"
- Gas → "Gas"
- Agua → "Agua"
- Celular/teléfono/Telcel → "Celular"
- Internet/Izzi/Telmex → "Internet"
- Cable/TV → "Televisión por cable"
- Medicinas/farmacias → "Medicamentos"
- Doctor/consultas médicas → "Doctores"
- Dentista → "Dentistas"
- Pagos de tarjetas → "Tarjetas de crédito"
- Regalos → "Regalos"
- Mascotas/veterinario → "Suministros para mascotas"
- Si no estás seguro → "Otros gastos personales"

FORMATO DE RESPUESTA (JSON válido):
[
  {"subcategory": "Restaurantes", "amount": 150.50},
  {"subcategory": "Despensa", "amount": 200.00}
]

IMPORTANTE:
- USA EXACTAMENTE los nombres de subcategorías de la lista
- Devuelve SOLO el JSON, sin explicaciones`;

      const classificationResponse = await ai.models.generateContent({
        model: model,
        contents: [
          {
            role: 'user',
            parts: [{ text: classificationPrompt }]
          }
        ]
      });

      let classifiedJson = classificationResponse.text?.trim() || classificationResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      if (classifiedJson) {
        classifiedJson = classifiedJson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const classifiedTransactions = JSON.parse(classifiedJson) as Array<{ subcategory: string; amount: number }>;

        // Validar y agregar solo las clasificaciones válidas
        const validSubcategorySet = new Set<string>(allSubcategories);
        const validClassified = classifiedTransactions.filter(item => {
          const isValid = validSubcategorySet.has(item.subcategory);
          if (!isValid) {
            console.warn(`❌ Subcategoría inválida descartada: "${item.subcategory}" (monto: ${item.amount})`);
          }
          return isValid;
        });

        matched.push(...validClassified);
        console.log(`✅ IA clasificó: ${validClassified.length} transacciones`);
      }
    }

    console.log(`\n📊 RESUMEN FINAL:`);
    console.log(`   Total extraído: ${extractedTransactions.length}`);
    console.log(`   Total clasificado: ${matched.length}`);
    console.log(`   Tasa de éxito: ${((matched.length / extractedTransactions.length) * 100).toFixed(1)}%`);

    return matched;

  } catch (error: any) {
    console.error("Error analyzing budget PDF with Gemini:", error);
    const errorMessage = error?.message || error?.toString() || "Error desconocido";
    throw new Error(`Error al procesar el documento PDF: ${errorMessage}`);
  }
}