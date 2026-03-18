import { IUser } from '../models/User';
export interface JWTPayload {
    id: string;
    email: string;
    role: string;
}
export declare const generateToken: (user: IUser) => string;
export declare const verifyToken: (token: string) => JWTPayload;
