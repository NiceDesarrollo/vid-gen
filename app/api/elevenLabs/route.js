import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { apiKeyCheck } from "@/app/lib/apiKeyCheck";

export async function POST(request) {
  try {
    const { script } = await request.json();

    apiKeyCheck(process.env.ELEVENLABS_API_KEY);

    // Initialize ElevenLabs client
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    // Convert text to speech using stream method with voice settings
    const audioStream = await elevenlabs.textToSpeech.stream('JBFqnCBsd6RMkjVDRZzb', {
      modelId: 'eleven_multilingual_v2',
      text: script,
      outputFormat: 'mp3_44100_128',
      // Optional voice settings that allow you to customize the output
      voiceSettings: {
        stability: 0,
        similarityBoost: 1.0,
        useSpeakerBoost: true,
        speed: 1.0,
      },
    });

    // Collect all chunks into a Buffer
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);
    const base64Audio = audioBuffer.toString('base64');

    return Response.json({ 
      success: true, 
      audio: base64Audio,
      script: script,
      format: 'mp3_44100_128'
    });

  } catch (error) {
    console.error('ElevenLabs API Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
