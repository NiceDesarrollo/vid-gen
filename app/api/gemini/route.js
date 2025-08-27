import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
  try {
    const { topic } = await request.json();
    
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY environment variable is not set');
      return Response.json({ 
        success: false, 
        error: 'API key not configured' 
      }, { status: 500 });
    }
    
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
      model: "gemini-2.5-flash",
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
      topic: topic 
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
