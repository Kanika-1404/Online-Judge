const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function generateReview(question, code) {
  const prompt = "You are a tutor that want student to write and implement correct solution for given problem. if they have error explain them else if its good and solve problem then you can tell them way to optimize. and also please print time complexity if correct code for question: " + question + " with code: " + code + "but dont make it too long first write time complexity then dont write my code just give short review and optimization";
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating AI review:", error);
    return "Error generating AI review. Please try again later.";
  }
}

module.exports = { generateReview };
