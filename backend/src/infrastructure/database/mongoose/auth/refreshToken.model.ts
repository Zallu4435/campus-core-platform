import { Schema, model } from 'mongoose';
import { IRefreshSession } from '../../../../domain/auth/entities/AuthTypes';

const RefreshSessionSchema = new Schema<IRefreshSession>({
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, unique: true },
    refreshToken: { type: String, required: true },
    userAgent: { type: String, required: true },
    ipAddress: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
});

export const RefreshSession = model<IRefreshSession>('RefreshSession', RefreshSessionSchema); 