# 🎬 AI TikTok Video Generator

A full-stack Next.js application that generates engaging TikTok videos using AI - from script to final video with just a prompt! Built with modern web technologies and best practices.

## 🚀 Live Demo

**[View Live Application](https://ai-video-generator.vercel.app)**

## ✨ Features

### 🤖 AI-Powered Content Generation
- **Script Generation**: Google Gemini 2.5 Flash for intelligent video scripts
- **Voice Synthesis**: ElevenLabs integration for natural-sounding narration
- **Image Generation**: Multiple options (AI-generated or stock photos)
- **Video Rendering**: Professional video creation with transitions

### 🎯 User Experience
- **Real-time Progress**: Live updates during video generation
- **Multiple Formats**: TikTok (9:16), Instagram (1:1), YouTube (16:9)
- **Customization**: Voice selection, image styles, aspect ratios
- **Preview System**: Audio and image previews before final render

### 🔐 Authentication & Security
- **NextAuth.js**: Google OAuth and email/password authentication
- **JWT Tokens**: Secure session management
- **Rate Limiting**: Plan-based usage limits
- **API Key Validation**: Secure API key management

### 📊 Analytics & Monitoring
- **User Analytics**: Video generation tracking
- **API Usage**: Cost monitoring and optimization
- **Performance Metrics**: Real-time application monitoring
- **Error Tracking**: Comprehensive error logging

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form management and validation
- **Framer Motion** - Smooth animations

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database management
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication system

### AI & External APIs
- **Google Gemini 2.5 Flash** - Script generation (FREE tier)
- **ElevenLabs** - Voice synthesis
- **Unsplash API** - Stock image search (FREE) - Both SDK and custom API route
- **Shotstack** - Video rendering

### DevOps & Deployment
- **Vercel** - Hosting and deployment
- **GitHub Actions** - CI/CD pipeline
- **Docker** - Containerization
- **PostgreSQL** - Database hosting

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- API keys for external services

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-video-generator.git
cd ai-video-generator
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env.local
```

4. **Configure environment variables**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/video_generator"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI APIs
GEMINI_API_KEY="your-gemini-api-key"
ELEVENLABS_API_KEY="your-elevenlabs-api-key"

# Image APIs
UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
SHOTSTACK_API_KEY="your-shotstack-api-key"
```

5. **Database setup**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

6. **Run development server**
```bash
npm run dev
```

## 🧪 Testing

### Run all tests
```bash
npm run test
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run E2E tests
```bash
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 📊 API Documentation

### Script Generation
```typescript
POST /api/geminiScript
{
  "topic": "Why cats are amazing",
  "style": "casual" // optional
}
```

### Voice Generation
```typescript
POST /api/elevenLabs
{
  "script": "Your generated script here",
  "voice": "JBFqnCBsd6RMkjVDRZzb"
}
```

### Image Search
```typescript
POST /api/unsplash
{
  "query": "nature landscape",
  "count": 4,
  "orientation": "landscape"
}
```

## 🏗️ Architecture

### Project Structure
```
app/
├── api/                 # API routes
│   ├── auth/           # Authentication endpoints
│   ├── geminiScript/   # Script generation
│   ├── elevenLabs/     # Voice synthesis
│   ├── unsplash/       # Image search
│   └── videos/         # Video management
├── components/         # Reusable components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── types/             # TypeScript definitions
└── (routes)/          # Page components
```

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  plan VARCHAR DEFAULT 'free',
  videosCreated INTEGER DEFAULT 0
);

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  userId UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  topic VARCHAR NOT NULL,
  script TEXT NOT NULL,
  status VARCHAR DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  metadata JSONB
);
```

## 🔧 Development

### Unsplash Integration
The application provides two ways to integrate with Unsplash:

1. **Custom API Route** (`/api/unsplash`): Server-side integration for secure API key handling
2. **Direct SDK Integration**: Client-side integration using the official `unsplash-js` package

#### SDK Setup
```bash
npm install unsplash-js
```

#### Environment Variables
```env
# For server-side API route (secure)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# For client-side SDK (exposed to browser)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

#### Usage Examples
- **API Route**: More secure, allows server-side processing and rate limiting
- **SDK**: Direct integration, faster response times, full SDK features

### Code Quality
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety
- **Husky** - Git hooks

### Performance Optimization
- **React.memo** - Component memoization
- **useMemo/useCallback** - Hook optimization
- **Code splitting** - Dynamic imports
- **Image optimization** - Next.js Image component

### Security Measures
- **API key validation** - Secure key management
- **Rate limiting** - Abuse prevention
- **Input sanitization** - XSS protection
- **CORS configuration** - Cross-origin security

## 📈 Performance Metrics

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: < 500KB (gzipped)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI script generation
- **ElevenLabs** for voice synthesis
- **Unsplash** for stock images
- **Vercel** for hosting and deployment
- **Next.js** team for the amazing framework

## 📞 Contact

- **Portfolio**: [your-portfolio.com](https://your-portfolio.com)
- **LinkedIn**: [your-linkedin](https://linkedin.com/in/your-profile)
- **Email**: your.email@example.com

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**
