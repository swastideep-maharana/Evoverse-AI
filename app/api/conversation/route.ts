import { NextResponse } from "next/server";
import { ChatSession, GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ensure your .env file contains this key
const MODEL_NAME = "gemini-1.0-pro"; // Specify your model name

async function initializeChat(apiKey: string | undefined) {
  if (!apiKey) {
    throw new Error("API key is missing.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = await genAI.getGenerativeModel({ model: MODEL_NAME });
  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  return model.startChat({
    generationConfig,
    history: [],
  });
}

async function sendPrompt(chatInstance: ChatSession, prompt: any) {
    const result = await chatInstance.sendMessage(prompt);
    // Call the text() function to get the string response, then remove stars
    const cleanResponseText = (await result.response.text()).replace(/\*/g, ''); // Call text() to get the string
    return cleanResponseText;
  }
  
  

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Initialize chat with the Gemini API
    const chat = await initializeChat(GEMINI_API_KEY);
    
    // Send the user's prompt
    const prompt = messages.map((msg: { content: string }) => msg.content).join("\n");
    const responseText = await sendPrompt(chat, prompt);

    // Send back the content from the response
    return NextResponse.json({ content: responseText || "No response" });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json({ message: "Failed to communicate with the AI service." }, { status: 500 });
  }
}
