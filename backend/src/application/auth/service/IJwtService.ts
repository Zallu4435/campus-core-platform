import { AuthCollection, TokenType } from "../constants/AuthConstants";

export interface IJwtService {
    generateToken(payload: object, expiresIn: string): string;
    generateAccessToken(payload: object): string;
    generateRefreshToken(payload: object): string;
    verifyToken<T>(token: string, options?: { isRefreshToken?: boolean; ignoreExpiration?: boolean }): T;
}
