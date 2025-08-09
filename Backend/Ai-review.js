import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv'; // For ES Modules
dotenv.config();

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

export async function generateReview(question, code) {
  const prompt = "You are a tutor that want student to write and implement correct solution for given problem. if they have error explain them else if its good and solve problem then you can tell them way to optimize. and also please print time complexity if correct code for question: " + question + " with code: " + code + "but dont make it too long first write time complexity then dont write my code just give short review and optimization";
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text;
}
