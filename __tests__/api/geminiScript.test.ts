import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/geminiScript/route';

// Mock environment variables
vi.mock('@/app/lib/apiKeyCheck', () => ({
  apiKeyCheck: vi.fn(() => null) // Mock successful API key check
}));

// Mock Google GenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: 'This is a generated TikTok script about the topic.'
      })
    }
  }))
}));

describe('Gemini Script Generation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a script successfully', async () => {
    const requestBody = {
      topic: 'Why cats are amazing'
    };

    const request = new Request('http://localhost:3000/api/geminiScript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.script).toBeDefined();
    expect(data.topic).toBe(requestBody.topic);
    expect(data.model).toBe('gemini-2.5-flash');
    expect(data.cost).toBe('FREE');
  });

  it('should handle missing topic', async () => {
    const requestBody = {};

    const request = new Request('http://localhost:3000/api/geminiScript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it('should handle API errors gracefully', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    const mockGenerateContent = vi.fn().mockRejectedValue(new Error('API Error'));
    
    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    }));

    const requestBody = {
      topic: 'Test topic'
    };

    const request = new Request('http://localhost:3000/api/geminiScript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it('should validate API key before processing', async () => {
    const { apiKeyCheck } = await import('@/app/lib/apiKeyCheck');
    
    (apiKeyCheck as any).mockReturnValue({
      success: false,
      error: 'API key not configured',
      status: 500
    });

    const requestBody = {
      topic: 'Test topic'
    };

    const request = new Request('http://localhost:3000/api/geminiScript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe('API key not configured');
  });
});
