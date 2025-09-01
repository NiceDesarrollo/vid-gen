import { GoogleGenAI } from "@google/genai";
import { apiKeyCheck } from "@/app/lib/apiKeyCheck";

export async function POST(request) {
  try {
    const { topic } = await request.json();
    
    apiKeyCheck(process.env.GEMINI_API_KEY);
    
    // Initialize Gemini with the new SDK
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    // Create a simple prompt for TikTok video script
    const prompt = `Create a short, engaging TikTok video script about "${topic}". 
    The script should be:
    - 30-60 seconds when spoken
    - Engaging and hook the viewer in the first 3 seconds
    - Include a clear call-to-action
    - Be suitable for TikTok audience
    - Have a conversational, casual tone
    
    Format the response as a simple text script.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // FREE tier for text generation
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking for faster response
        },
      }
    });

    return Response.json({ 
      success: true, 
      script: response.text,
      topic: topic,
      model: "gemini-2.5-flash",
      cost: "FREE" // Highlight that this is free!
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
