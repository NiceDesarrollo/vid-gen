import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Video Repository
export class VideoRepository {
  static async create(data: {
    title: string;
    topic: string;
    script: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    userId?: string;
  }) {
    return await prisma.video.create({
      data: {
        ...data,
        progress: 0,
        metadata: {
          duration: 0,
          format: 'mp4',
          size: 0,
          model: 'gemini-2.5-flash',
          cost: 'FREE'
        }
      }
    });
  }

  static async findById(id: string) {
    return await prisma.video.findUnique({
      where: { id }
    });
  }

  static async findByUserId(userId: string) {
    return await prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateStatus(id: string, status: string, progress?: number) {
    return await prisma.video.update({
      where: { id },
      data: { 
        status: status as any,
        progress: progress || 0,
        updatedAt: new Date()
      }
    });
  }

  static async updateMetadata(id: string, metadata: any) {
    return await prisma.video.update({
      where: { id },
      data: { metadata }
    });
  }

  static async delete(id: string) {
    return await prisma.video.delete({
      where: { id }
    });
  }
}

// User Repository
export class UserRepository {
  static async create(data: {
    email: string;
    name: string;
    plan?: 'free' | 'premium' | 'pro';
  }) {
    return await prisma.user.create({
      data: {
        ...data,
        plan: data.plan || 'free',
        videosCreated: 0
      }
    });
  }

  static async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  static async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        videos: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  }

  static async updateLastLogin(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() }
    });
  }

  static async incrementVideosCreated(id: string) {
    return await prisma.user.update({
      where: { id },
      data: {
        videosCreated: {
          increment: 1
        }
      }
    });
  }
}

// Analytics Repository
export class AnalyticsRepository {
  static async trackVideoGeneration(data: {
    userId?: string;
    topic: string;
    status: string;
    cost: string;
    duration: number;
  }) {
    return await prisma.analytics.create({
      data: {
        ...data,
        timestamp: new Date()
      }
    });
  }

  static async getDailyStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.analytics.groupBy({
      by: ['status'],
      where: {
        timestamp: {
          gte: today
        }
      },
      _count: {
        status: true
      }
    });
  }

  static async getUserStats(userId: string) {
    return await prisma.analytics.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true
      }
    });
  }
}

// API Usage Repository
export class ApiUsageRepository {
  static async trackApiCall(data: {
    service: string;
    endpoint: string;
    userId?: string;
    cost: number;
    success: boolean;
  }) {
    return await prisma.apiUsage.create({
      data: {
        ...data,
        timestamp: new Date()
      }
    });
  }

  static async getUsageByService(service: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await prisma.apiUsage.groupBy({
      by: ['endpoint'],
      where: {
        service,
        timestamp: {
          gte: startDate
        }
      },
      _sum: {
        cost: true
      },
      _count: {
        endpoint: true
      }
    });
  }
}
