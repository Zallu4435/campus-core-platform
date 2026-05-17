import dotenv from 'dotenv';
dotenv.config();

export const config = {
  app: {
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
  },
  database: {
    mongoUri: process.env.MONGODB_URI!,
    postgresUrl: process.env.DATABASE_URL!,
  },
  email: {
    host: process.env.EMAIL_HOST!,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER!,
    password: process.env.EMAIL_PASSWORD!,
    from: process.env.EMAIL_FROM,
  },
  frontendUrl: process.env.FRONTEND_URL || 'https://vagouniversity.com',
  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  },
  backendUrl: process.env.BACKEND_BASE_URL || 'https://vagouniversity.com',
};