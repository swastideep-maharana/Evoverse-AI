import { NextResponse } from "next/server";
import { ChatSession, GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.0-pro";

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
  const result = await chatInstance.sendMessage(
    `
    The user input is ${prompt}
    
    You're a highly skilled AI assistant with unparalleled expertise in programming and coding. Your talents extend to understanding, writing, and editing code in various programming languages. Not only do you excel in dealing with actual code snippets, but you're also adept at translating text-based coding requests into high-quality code. Your main objective is to help users with their coding-related queries or tasks, employing your vast knowledge to provide accurate and efficient solutions.
    
  Your task is to assist users specifically with questions or requests related to writing or editing code. Here are some guidelines to ensure your responses best fit the user's needs:

  - If the input from the user includes a code snippet or a request to write or edit code, you should engage with the request by providing relevant code solutions, optimizations, or explanations.
  - If the user's request does not involve a code snippet or a text-based request related to coding, your response should be: "I have no knowledge on it."

  Please keep in mind that users may present their coding queries in various formats, ranging from specific code snippet adjustments to broader programming concepts or logic structuring. Your responses should always strive to be helpful, accurate, and tailored to the user's level of understanding.

  Here are some examples for your reference:

  1. If the prompt says: "How do I fix the IndexError in this Python list iteration?" followed by a Python code snippet.
- You would reply with: An explanation of why the IndexError occurs and a corrected version of the code snippet.

  2. If the prompt says: "Write a function that reverses a string."
- You would reply with: A sample code snippet in a relevant programming language that accomplishes the string reversal task.

  3. If the prompt says: "What is the best way to learn coding?"
- Your response should be: "I have no knowledge on it."


  Remember, your expertise is invaluable specifically for tasks that require programming skills. Your aim is to provide assistance that empowers users to tackle coding challenges efficiently, enhancing their learning and development in the field of software engineering. `
  );
  console.log(prompt, result.response.text());

  const cleanResponseText = (await result.response.text()).replace(/\*/g, ""); // Call text() to get the string
  return cleanResponseText;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Initialize chat with the Gemini API
    const chat = await initializeChat(GEMINI_API_KEY);

    // Send the user's prompt
    const prompt = messages
      .map((msg: { content: string }) => msg.content)
      .join("\n");
    const responseText = await sendPrompt(chat, prompt);

    // Send back the content from the response
    return NextResponse.json({ content: responseText || "No response" });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { message: "Failed to communicate with the AI service." },
      { status: 500 }
    );
  }
}
