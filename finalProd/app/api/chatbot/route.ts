"use server";

import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const fitnessSystemPrompt = `You are FitBot, a fitness assistant for the FitLink platform. 
You provide personalized workout recommendations, nutritional advice, and motivation. 
Always be encouraging and focus on helping users achieve their health goals.`;

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();
    
    if (!userId || !message) {
      return NextResponse.json({ error: "Missing userId or message" }, { status: 400 });
    }
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          { 
            role: "user", 
            parts: [{ text: fitnessSystemPrompt }] 
          },
          { 
            role: "user", 
            parts: [{ text: message }] 
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "Error from Gemini API");
    }
    
    const botResponse = data.candidates[0].content.parts[0].text;
    
    return NextResponse.json({ response: botResponse });
  } catch (error) {
    console.error("Error processing chat request:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" }, 
      { status: 500 }
    );
  }
}
