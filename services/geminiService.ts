
import { GoogleGenAI, Type } from "@google/genai";
import { FilmAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeFilmFrames(
  frames: { data: string; timestamp: number }[],
  fileName: string
): Promise<FilmAnalysis> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    You are a world-class cinematographer and film theorist. 
    Analyze the provided video frames from the film titled "${fileName}".
    
    Tasks:
    1. Identify individual shots based on visual changes across these frames.
    2. Estimate shot durations and calculate the Average Shot Length (ASL).
    3. Extract dominant hex color codes for each shot and the overall film.
    4. Describe camera movement and composition for each shot.
    5. Based on the visual cues, infer the musical mood and audio dynamics.
    
    Output must be a valid JSON object matching this schema:
    {
      "title": "string",
      "asl": number,
      "totalShots": number,
      "dominantColors": ["string"],
      "shots": [
        {
          "id": number,
          "startTime": number,
          "endTime": number,
          "duration": number,
          "description": "string",
          "colors": ["string"],
          "cameraMovement": "string",
          "composition": "string"
        }
      ],
      "audio": {
        "mood": "string",
        "musicDescription": "string",
        "dynamicRange": "string",
        "keyEvents": ["string"]
      },
      "visualSummary": "string"
    }
  `;

  const imageParts = frames.map(frame => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: frame.data
    }
  }));

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        ...imageParts,
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          asl: { type: Type.NUMBER },
          totalShots: { type: Type.NUMBER },
          dominantColors: { type: Type.ARRAY, items: { type: Type.STRING } },
          shots: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                startTime: { type: Type.NUMBER },
                endTime: { type: Type.NUMBER },
                duration: { type: Type.NUMBER },
                description: { type: Type.STRING },
                colors: { type: Type.ARRAY, items: { type: Type.STRING } },
                cameraMovement: { type: Type.STRING },
                composition: { type: Type.STRING }
              }
            }
          },
          audio: {
            type: Type.OBJECT,
            properties: {
              mood: { type: Type.STRING },
              musicDescription: { type: Type.STRING },
              dynamicRange: { type: Type.STRING },
              keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          visualSummary: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI");
  
  return JSON.parse(text) as FilmAnalysis;
}
