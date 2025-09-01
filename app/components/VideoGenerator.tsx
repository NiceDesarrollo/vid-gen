"use client";
import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { VideoGenerationRequest, VideoGenerationResponse } from '@/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { ProgressBar } from './ui/ProgressBar';
import { VideoPreview } from './VideoPreview';
import { AudioPlayer } from './AudioPlayer';
import { ImageGallery } from './ImageGallery';

interface VideoGeneratorProps {
  onVideoComplete?: (video: VideoGenerationResponse) => void;
}

export default function VideoGenerator({ onVideoComplete }: VideoGeneratorProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<'input' | 'generating' | 'preview' | 'complete'>('input');
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Generated content state
  const [script, setScript] = useState('');
  const [audio, setAudio] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [finalVideo, setFinalVideo] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState<VideoGenerationRequest>({
    topic: '',
    numberOfImages: 4,
    aspectRatio: '9:16',
    voice: 'JBFqnCBsd6RMkjVDRZzb',
    format: 'short'
  });

  // Step 1: Generate Script
  const generateScript = useCallback(async () => {
    setCurrentTask('Generating script...');
    setProgress(10);
    
    try {
      const response = await fetch('/api/geminiScript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: formData.topic })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setScript(data.script);
        setProgress(25);
        return data.script;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(`Script generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }, [formData.topic]);

  // Step 2: Generate Voice
  const generateVoice = useCallback(async (scriptText: string) => {
    setCurrentTask('Generating voice...');
    setProgress(35);
    
    try {
      const response = await fetch('/api/elevenLabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          script: scriptText,
          voice: formData.voice 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAudio(data.audio);
        setProgress(50);
        return data.audio;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(`Voice generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }, [formData.voice]);

  // Step 3: Generate/Search Images
  const generateImages = useCallback(async () => {
    setCurrentTask('Finding images...');
    setProgress(65);
    
    try {
      const response = await fetch('/api/unsplash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: formData.topic,
          count: formData.numberOfImages,
          orientation: formData.aspectRatio === '9:16' ? 'portrait' : 'landscape'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const imageUrls = data.images.map((img: any) => img.url);
        setImages(imageUrls);
        setProgress(80);
        return imageUrls;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(`Image search failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }, [formData.topic, formData.numberOfImages, formData.aspectRatio]);

  // Step 4: Generate Final Video
  const generateVideo = useCallback(async (scriptText: string, audioData: string, imageUrls: string[]) => {
    setCurrentTask('Rendering video...');
    setProgress(90);
    
    try {
      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: scriptText,
          audio: audioData,
          images: imageUrls,
          aspectRatio: formData.aspectRatio,
          format: formData.format
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFinalVideo(data.videoUrl);
        setProgress(100);
        setCurrentStep('complete');
        onVideoComplete?.(data);
        return data.videoUrl;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(`Video rendering failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }, [formData.aspectRatio, formData.format, onVideoComplete]);

  // Main generation workflow
  const handleGenerateVideo = useCallback(async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setError(null);
    setCurrentStep('generating');
    setProgress(0);

    try {
      // Step 1: Generate script
      const scriptText = await generateScript();
      
      // Step 2: Generate voice
      const audioData = await generateVoice(scriptText);
      
      // Step 3: Get images
      const imageUrls = await generateImages();
      
      // Step 4: Generate final video
      await generateVideo(scriptText, audioData, imageUrls);
      
    } catch (err) {
      setCurrentStep('input');
      console.error('Video generation failed:', err);
    }
  }, [formData, generateScript, generateVoice, generateImages, generateVideo]);

  const handleInputChange = (field: keyof VideoGenerationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData({
      topic: '',
      numberOfImages: 4,
      aspectRatio: '9:16',
      voice: 'JBFqnCBsd6RMkjVDRZzb',
      format: 'short'
    });
    setCurrentStep('input');
    setProgress(0);
    setCurrentTask('');
    setError(null);
    setScript('');
    setAudio('');
    setImages([]);
    setFinalVideo('');
  };

  // Render different steps
  if (currentStep === 'generating') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">🎬 Generating Your Video</h2>
        
        <div className="space-y-6">
          <ProgressBar progress={progress} />
          
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700 mb-2">{currentTask}</p>
            <p className="text-sm text-gray-500">{progress}% complete</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
              <Button onClick={handleReset} variant="danger" className="mt-2">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 'preview') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">🎬 Preview Your Video</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Generated Script</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700">{script}</p>
            </div>
            
            <h3 className="text-lg font-semibold mb-3 mt-6">Generated Audio</h3>
            <AudioPlayer audioData={audio} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Selected Images</h3>
            <ImageGallery images={images} />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button onClick={() => setCurrentStep('input')} variant="secondary">
            Back to Edit
          </Button>
          <Button onClick={() => generateVideo(script, audio, images)}>
            Generate Final Video
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">🎉 Video Complete!</h2>
        
        <VideoPreview videoUrl={finalVideo} />
        
        <div className="flex gap-3 mt-6 justify-center">
          <Button onClick={handleReset} variant="secondary">
            Create Another Video
          </Button>
          <Button onClick={() => window.open(finalVideo, '_blank')}>
            Download Video
          </Button>
        </div>
      </div>
    );
  }

  // Main input form
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">🎬 AI TikTok Video Generator</h2>
      
      {session ? (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">
            Welcome back, {session.user?.name}! 
            Plan: {session.user?.plan || 'Free'} 
            ({session.user?.videosCreated || 0} videos created)
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm">
            Sign in to save your videos and track your usage!
          </p>
        </div>
      )}
      
      <form onSubmit={(e) => { e.preventDefault(); handleGenerateVideo(); }} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Topic *
          </label>
          <Input
            name="topic"
            value={formData.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
            placeholder="e.g., Why cats are amazing, Best coffee brewing methods, Travel tips for beginners"
            required
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Images
            </label>
            <Select
              name="numberOfImages"
              value={formData.numberOfImages}
              onChange={(e) => handleInputChange('numberOfImages', parseInt(e.target.value))}
              options={[
                { value: 2, label: '2 Images' },
                { value: 4, label: '4 Images' },
                { value: 6, label: '6 Images' },
                { value: 8, label: '8 Images' }
              ]}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aspect Ratio
            </label>
            <Select
              name="aspectRatio"
              value={formData.aspectRatio}
              onChange={(e) => handleInputChange('aspectRatio', e.target.value)}
              options={[
                { value: '9:16', label: 'TikTok (9:16)' },
                { value: '1:1', label: 'Instagram (1:1)' },
                { value: '16:9', label: 'YouTube (16:9)' }
              ]}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Style
            </label>
            <Select
              name="voice"
              value={formData.voice}
              onChange={(e) => handleInputChange('voice', e.target.value)}
              options={[
                { value: 'JBFqnCBsd6RMkjVDRZzb', label: 'Sarah (Friendly)' },
                { value: 'pNInz6obpgDQGcFmaJgB', label: 'Adam (Professional)' },
                { value: 'yoZ06aMxZJJ28mfd3POQ', label: 'Josh (Casual)' }
              ]}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Format
            </label>
            <Select
              name="format"
              value={formData.format}
              onChange={(e) => handleInputChange('format', e.target.value)}
              options={[
                { value: 'short', label: 'Short (30-60s)' },
                { value: 'square', label: 'Square (1:1)' },
                { value: 'landscape', label: 'Landscape (16:9)' }
              ]}
              className="w-full"
            />
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <div className="flex gap-3">
          <Button type="submit" className="flex-1" disabled={!formData.topic.trim()}>
            🎬 Generate Video (FREE!)
          </Button>
          <Button type="button" onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>✨ Using AI-powered script generation, voice synthesis, and stock images</p>
          <p>⏱️ Generation time: 2-3 minutes</p>
        </div>
      </form>
    </div>
  );
}
