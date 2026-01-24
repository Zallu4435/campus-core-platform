import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Admin } from "../../infrastructure/database/mongoose/auth/admin.model";
import { User } from "../../infrastructure/database/mongoose/auth/user.model";
import { FacultyUserModel as Faculty } from "../../infrastructure/database/mongoose/faculty/faculty.model";
import { Register } from "../../infrastructure/database/mongoose/auth/register.model";
import { Admission } from "../../infrastructure/database/mongoose/admission/AdmissionModel";
import { config } from "../../config/config";

interface AuthenticatedUser {
  userId: string;
  collection: "register" | "admin" | "user" | "faculty";
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

declare global {
  namespace Express {
    interface Request {
      user: AuthenticatedUser;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.access_token;
    if (!accessToken) {
      res.status(401).json({
        error: 'Access token missing',
        message: 'Please log in again to continue.',
        code: 'TOKEN_MISSING'
      });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(accessToken, config.jwt.secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error('authMiddleware: Access token expired');
        res.status(401).json({
          error: 'Token expired',
          message: 'Your session has expired. Please refresh the page.',
          code: 'TOKEN_EXPIRED'
        });
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        console.error('authMiddleware: Invalid access token');
        res.status(401).json({
          error: 'Invalid token',
          message: 'Your session is invalid. Please log in again.',
          code: 'TOKEN_INVALID'
        });
        return;
      }
      throw error;
    }

    let user;
    switch (decoded.collection) {
      case 'admin':
        user = await Admin.findById(decoded.userId);
        break;
      case 'user':
        user = await User.findById(decoded.userId);
        break;
      case 'faculty':
        user = await Faculty.findById(decoded.userId);
        break;
      case 'register':
        user = await Register.findById(decoded.userId);
        if (user) {
          const admission = await Admission.findOne({ registerId: user._id });
          if (admission) {
            console.error('authMiddleware: User has an admission and cannot access:', decoded.userId);
            res.status(403).json({
              error: 'User has already made an admission',
              message: 'You have already submitted an admission application.',
              code: 'ADMISSION_EXISTS'
            });
            return;
          }
        }
        break;
      default:
        console.error('authMiddleware: Invalid collection:', decoded.collection);
        res.status(403).json({
          error: 'Invalid user collection',
          message: 'Your user type is not recognized. Please contact support.',
          code: 'INVALID_COLLECTION'
        });
        return;
    }

    if (!user) {
      console.error('authMiddleware: User not found:', decoded.userId);
      res.status(401).json({
        error: 'User not found',
        message: 'Your user account was not found. Please log in again.',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
      collection: decoded.collection,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture
    };

    next();
  } catch (error) {
    console.error('authMiddleware: Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.',
      code: 'INTERNAL_ERROR'
    });
  }
};