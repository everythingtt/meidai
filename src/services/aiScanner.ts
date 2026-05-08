import axios from 'axios';
import { AIAnalysis } from '../types';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'tencent/hy3-preview:free';
const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/69fdedc8adc21f119a701bbf';

interface JSONBinResponse {
  record: {
    OpenRouter: string;
  };
  metadata: {
    id: string;
    private: boolean;
    createdAt: string;
  };
}

export class AIScannerService {
  private apiKey: string | null = null;
  private model: string;
  private keyFetchPromise: Promise<string> | null = null;

  constructor() {
    this.model = MODEL;
  }

  private async fetchApiKey(): Promise<string> {
    if (this.apiKey) {
      return this.apiKey;
    }

    if (this.keyFetchPromise) {
      return this.keyFetchPromise;
    }

    this.keyFetchPromise = (async () => {
      try {
        const response = await axios.get<JSONBinResponse>(JSONBIN_URL, {
          timeout: 10000
        });
        
        const key = response.data?.record?.OpenRouter;
        if (!key) {
          throw new Error('API key not found in JSONBin response');
        }
        
        this.apiKey = key;
        return key;
      } catch (error) {
        this.keyFetchPromise = null;
        console.error('Failed to fetch API key from JSONBin:', error);
        throw new Error('Failed to retrieve API key. Please check your internet connection.');
      }
    })();

    return this.keyFetchPromise;
  }

  async analyzeFrame(base64Image: string): Promise<AIAnalysis> {
    try {
      const apiKey = await this.fetchApiKey();
      
      const response = await axios.post(
        `${OPENROUTER_BASE_URL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this video frame. Provide: 1) A brief summary of the scene, 2) List of detected objects with confidence scores (0-1), 3) Scene type (indoor/outdoor/action/etc), 4) Resolution and aspect ratio if visible. Return as JSON with keys: summary, objects (array of {name, confidence}), scene, metadata (resolution, aspectRatio).'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'CDN Video Player'
          },
          timeout: 30000
        }
      );

      const content = response.data.choices[0].message.content;
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      
      return {
        summary: parsed.summary || 'No summary available',
        objects: parsed.objects || [],
        scene: parsed.scene || 'unknown',
        metadata: {
          resolution: parsed.metadata?.resolution || 'unknown',
          aspectRatio: parsed.metadata?.aspectRatio || 'unknown'
        }
      };
    } catch (error) {
      console.error('AI Scanner Error:', error);
      throw new Error('Failed to analyze frame. Please check your API key and try again.');
    }
  }

  captureVideoFrame(videoElement: HTMLVideoElement): string {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    return base64.split(',')[1];
  }
}

export const aiScanner = new AIScannerService();
