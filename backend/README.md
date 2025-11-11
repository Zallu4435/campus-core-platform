# University Academy - Backend

A comprehensive backend API for managing university academy operations including academics, admissions, faculty management, student services, and more.

## 🚀 Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: MongoDB (Mongoose) + Prisma ORM
- **Authentication**: JWT + Firebase Admin
- **File Upload**: Multer + Cloudinary
- **Real-time**: Socket.io + WebSocket
- **Payment**: Stripe + Razorpay
- **Email**: Nodemailer
- **Logging**: Winston
- **Validation**: Built-in TypeScript types

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB database
- Cloudinary account (for file uploads)
- Firebase project (for authentication)

## 🛠️ Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend root directory with the following variables:
   ```env
   # URLs (REQUIRED)
   FRONTEND_URL="http://localhost:5173"
   BACKEND_BASE_URL="http://localhost:5000"
   CORS_ORIGINS="http://localhost:5173,http://localhost:3000,https://yourdomain.com"
   
   # Database (REQUIRED)
   MONGODB_URI="your_mongodb_connection_string"
   DATABASE_URL="your_postgresql_connection_string"
   
   # JWT (REQUIRED)
   JWT_SECRET="your_jwt_secret_key"
   JWT_REFRESH_SECRET="your_refresh_jwt_secret_key"
   JWT_EXPIRES_IN="7d"
   
   # Email (REQUIRED)
   EMAIL_HOST="your_smtp_host"
   EMAIL_PORT="587"
   EMAIL_SECURE="false"
   EMAIL_USER="your_email"
   EMAIL_PASSWORD="your_password"
   EMAIL_FROM="Your App Name <your_email@example.com>"
   
   # Cloudinary (REQUIRED)
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   
   # Firebase (REQUIRED)
   FIREBASE_PROJECT_ID="your_project_id"
   FIREBASE_PRIVATE_KEY="your_private_key"
   FIREBASE_CLIENT_EMAIL="your_client_email"
   
   # Payment Gateways
   STRIPE_SECRET_KEY="your_stripe_secret"
   RAZORPAY_KEY_ID="your_razorpay_key"
   RAZORPAY_KEY_SECRET="your_razorpay_secret"
   ```
   
   **Important**: Copy `.env.example` to `.env` and update with your actual values.

## 🚀 Available Scripts

- **Development**: `npm run dev` - Start development server with hot reload
- **Build**: `npm run build` - Build the project for production
- **Start**: `npm start` - Start production server
- **Type Check**: `npm run type-check` - Check TypeScript types

## 🏗️ Project Structure

```
src/
├── application/          # Application layer (use cases, repositories)
├── domain/              # Domain entities, DTOs, and business logic
├── infrastructure/      # Database, external services, implementations
├── presentation/        # HTTP controllers, routes, and middleware
├── shared/             # Common utilities and middleware
└── app.ts              # Main application entry point
```

## 🔧 Key Features

- **Modular Architecture**: Clean separation of concerns with domain-driven design
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **File Management**: Secure file uploads with Cloudinary integration
- **Real-time Communication**: WebSocket support for live updates
- **Payment Processing**: Multiple payment gateway integrations
- **Email Notifications**: Automated email system for various events
- **Logging & Monitoring**: Comprehensive logging with Winston
- **API Documentation**: RESTful API endpoints with proper error handling

## 🌐 API Endpoints

The backend provides RESTful APIs for:
- User authentication and management
- Academic operations (courses, assignments, grades)
- Student and faculty management
- Admission processes
- Financial management
- Campus life and events
- Communication and notifications

## 🚀 Getting Started

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Access the API**
   - Development: `http://localhost:3000`
   - API endpoints: `http://localhost:3000/api/v1/*`

## 📝 Development Guidelines

- Follow TypeScript best practices
- Use proper error handling and validation
- Implement proper logging for debugging
- Follow RESTful API conventions
- Write clean, maintainable code

## 🔒 Security Features

- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Rate limiting (if implemented)
- Secure file upload validation

## 📚 Dependencies

Major dependencies include:
- Express.js for web framework
- Mongoose for MongoDB operations
- Prisma for database ORM
- Socket.io for real-time features
- Cloudinary for file management
- JWT for authentication
- Winston for logging

For a complete list, see `package.json`.
