
import { GoogleGenAI, Modality, Type } from "@google/genai";

// 1. Search Grounding (gemini-3-flash-preview)
export const getMarketInsights = async (query: string) => {
  try {
    // Create a new GoogleGenAI instance right before making an API call for up-to-date key usage
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: { tools: [{ googleSearch: {} }] },
    });
    return {
      text: response.text, // Accessing .text property directly
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    return { text: "Error consultando información de mercado.", sources: [] };
  }
};

// 2. Audio Transcription (gemini-3-flash-preview)
export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
  try {
    // Create a new GoogleGenAI instance right before making an API call for up-to-date key usage
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Audio } },
          { text: 'Transcribe exactamente lo que se dice en este audio de campo agrícola. Identifica si mencionan nombres de clientes, productos o cantidades.' }
        ]
      }
    });
    return response.text || "No se detectó voz en el audio."; // Accessing .text property
  } catch (error) {
    console.error("Transcription Error:", error);
    return "Error al procesar la transcripción del audio.";
  }
};

// 3. Analyze Image (gemini-3-pro-preview)
export const analyzeInventoryPhoto = async (base64Image: string) => {
  try {
    // Create a new GoogleGenAI instance right before making an API call for up-to-date key usage
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: 'Analiza esta foto de estantería agrícola. Identifica qué productos están presentes, cuáles faltan y estima el nivel de stock (Bajo, Medio, Alto).' }
        ]
      }
    });
    return response.text; // Accessing .text property
  } catch (error) {
    console.error("Vision Error:", error);
    return "No se pudo analizar la imagen.";
  }
};

// 4. CRM Insights (gemini-3-flash-preview)
export const getCRMInsights = async (data: { 
  numClients: number, 
  numProspects: number, 
  totalPipeValue: number, 
  samples: number 
}) => {
  try {
    // Create a new GoogleGenAI instance right before making an API call for up-to-date key usage
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiza estos indicadores del CRM Agrícola y proporciona un resumen ejecutivo estratégico con 3 recomendaciones clave:
      - Clientes Activos: ${data.numClients}
      - Prospectos en Embudo: ${data.numProspects}
      - Valor del Pipeline: $${data.totalPipeValue.toLocaleString()}
      - Muestras Técnicas Entregadas: ${data.samples}
      
      Responde de forma concisa y profesional.`,
    });
    return response.text || "No se pudieron generar insights estratégicos."; // Accessing .text property
  } catch (error) {
    console.error("CRM Insights Error:", error);
    return "Error al analizar indicadores del negocio.";
  }
};

// 5. Sales Wizard (gemini-3-pro-preview)
export const getSalesWizardSuggestion = async (client: any, history: any[]) => {
  try {
    // Create a new GoogleGenAI instance right before making an API call for up-to-date key usage
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Actúa como un experto en ventas agrícolas para el cliente ${client.name}.
      Analiza su historial reciente de compras: ${JSON.stringify(history)}.
      Sugiere un pedido óptimo para la próxima visita comercial.
      
      IMPORTANTE: Tu respuesta DEBE ser un objeto JSON válido con este formato:
      {
        "sugeridos": [{"producto": "Nombre del Producto", "cantidad": 10}],
        "justificacion": "Explicación breve de la estrategia sugerida."
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return response.text; // Accessing .text property
  } catch (error) {
    console.error("Sales Wizard Error:", error);
    return null;
  }
};
