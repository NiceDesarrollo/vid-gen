// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Video Generation Types
export interface VideoGenerationRequest {
  topic: string;
  numberOfImages?: number;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  voice?: string;
  format?: 'short' | 'square' | 'landscape';
}

export interface VideoGenerationResponse {
  success: boolean;
  videoId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

// Script Generation Types
export interface ScriptGenerationRequest {
  topic: string;
  style?: 'casual' | 'professional' | 'funny' | 'educational';
  duration?: number; // in seconds
}

export interface ScriptGenerationResponse {
  success: boolean;
  script: string;
  topic: string;
  model: string;
  cost: string;
}

// Voice Generation Types
export interface VoiceGenerationRequest {
  script: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

export interface VoiceGenerationResponse {
  success: boolean;
  audio: string; // base64 encoded
  script: string;
  voice: string;
  model: string;
  cost: string;
  format: string;
}

// Image Generation Types
export interface ImageGenerationRequest {
  prompt: string;
  numberOfImages?: number;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  sampleImageSize?: '1K' | '2K';
}

export interface GeneratedImage {
  id: number;
  imageBytes: string; // base64 encoded
  buffer: Buffer;
  size: number;
  note?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  images: GeneratedImage[];
  count: number;
  prompt: string;
  config: {
    numberOfImages: number;
    aspectRatio: string;
    model: string;
    cost: string;
  };
}

// Unsplash Types
export interface UnsplashImage {
  id: number;
  unsplashId: string;
  url: string;
  urlFull: string;
  urlThumb: string;
  width: number;
  height: number;
  alt: string;
  photographer: string;
  photographerUrl: string;
  downloadUrl: string;
  description: string;
  tags: string[];
}

export interface UnsplashSearchRequest {
  query: string;
  count?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
}

export interface UnsplashSearchResponse {
  success: boolean;
  images: UnsplashImage[];
  count: number;
  query: string;
  totalResults: number;
  totalPages: number;
  config: {
    count: number;
    orientation: string;
    source: string;
    cost: string;
  };
}

// Video Types
export interface Video {
  id: string;
  title: string;
  topic: string;
  script: string;
  audioUrl?: string;
  images: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    duration: number;
    format: string;
    size: number;
    model: string;
    cost: string;
  };
}

// User Types (for future authentication)
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'premium' | 'pro';
  videosCreated: number;
  createdAt: Date;
  lastLogin: Date;
}

// API Key Validation Types
export interface ApiKeyValidation {
  isValid: boolean;
  error?: string;
  status: number;
  apiKey?: string;
}

export interface ApiKeyStatus {
  configured: boolean;
  error?: string;
}

// Form Types
export interface FormData {
  [key: string]: any;
}

// Hook Types
export interface UseFetchReturn<T> {
  loading: boolean;
  error: any;
  value: T | null;
  refetch: () => void;
}

export interface UseFormReturn {
  formData: FormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleReset: () => void;
  setFormData: (data: FormData) => void;
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface SelectProps {
  name: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Configuration Types
export interface AppConfig {
  apiKeys: {
    gemini: string;
    elevenlabs: string;
    unsplash: string;
    shotstack: string;
  };
  limits: {
    freeVideosPerDay: number;
    maxImagesPerVideo: number;
    maxVideoDuration: number;
  };
  features: {
    aiImageGeneration: boolean;
    stockImageSearch: boolean;
    voiceGeneration: boolean;
    videoRendering: boolean;
  };
}
