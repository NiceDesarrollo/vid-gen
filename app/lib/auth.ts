import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './database';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.plan = user.plan;
        token.videosCreated = user.videosCreated;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.plan = token.plan as string;
        session.user.videosCreated = token.videosCreated as number;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
};

// Auth utilities
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Middleware for protected routes
export const requireAuth = (handler: any) => {
  return async (req: any, res: any) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return handler(req, res);
  };
};

// User plan validation
export const validateUserPlan = (userPlan: string, requiredPlan: string) => {
  const planHierarchy = {
    free: 0,
    premium: 1,
    pro: 2
  };
  
  return planHierarchy[userPlan as keyof typeof planHierarchy] >= 
         planHierarchy[requiredPlan as keyof typeof planHierarchy];
};

// Rate limiting for video generation
export const checkRateLimit = async (userId: string, plan: string) => {
  const limits = {
    free: 3,
    premium: 20,
    pro: 100
  };
  
  const dailyLimit = limits[plan as keyof typeof limits] || limits.free;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const videosToday = await prisma.video.count({
    where: {
      userId,
      createdAt: {
        gte: today
      }
    }
  });
  
  return {
    allowed: videosToday < dailyLimit,
    remaining: Math.max(0, dailyLimit - videosToday),
    limit: dailyLimit
  };
};
