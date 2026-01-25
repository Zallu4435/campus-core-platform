// infrastructure/services/auth/JwtService.ts
import jwt from "jsonwebtoken";
import { config } from "../../../config/config";
import { InvalidTokenError } from "../../../domain/auth/errors/AuthErrors";
import { IJwtService } from "../../../application/auth/service/IJwtService";

export { IJwtService }; // Re-export if needed, or just remove if unused by others locally

export class JwtService implements IJwtService {
    private readonly secret: jwt.Secret;
    private readonly refreshSecret: jwt.Secret;

    constructor() {
        if (!config.jwt.secret || !config.jwt.refreshSecret) {
            throw new Error("JWT secrets are not defined in config.");
        }
        this.secret = config.jwt.secret as jwt.Secret;
        this.refreshSecret = config.jwt.refreshSecret as jwt.Secret;
    }

    generateToken(payload: object, expiresIn: string): string {
        return jwt.sign(payload, this.secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
    }

    generateAccessToken(payload: object): string {
        return jwt.sign(payload, this.secret, { expiresIn: '10m' });
    }

    generateRefreshToken(payload: object): string {
        return jwt.sign(payload, this.refreshSecret, { expiresIn: '7d' });
    }

    verifyToken<T>(token: string, options: { isRefreshToken?: boolean; ignoreExpiration?: boolean } = {}): T {
        try {
            const secret = options.isRefreshToken ? this.refreshSecret : this.secret;
            const decoded = jwt.verify(token, secret, { ignoreExpiration: options.ignoreExpiration }) as T;
            return decoded;
        } catch (error) {
            throw new InvalidTokenError("Invalid or expired token.");
        }
    }
}