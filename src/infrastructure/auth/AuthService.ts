import type * as admin from 'firebase-admin';

import { AuthenticationError } from '@/domain/errors/AppError';

import { FirebaseAuth } from './FirebaseAuth';

export interface AuthUser {
    uid: string;
    email?: string;
    emailVerified: boolean;
    displayName?: string;
}

export class AuthService {
    private firebaseAuth: FirebaseAuth;

    constructor() {
        this.firebaseAuth = FirebaseAuth.getInstance();
    }

    async verifyAndGetUser(token: string): Promise<AuthUser> {
        try {
            const decodedToken = await this.firebaseAuth.verifyToken(token);

            return {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified || false,
                displayName: decodedToken.name,
            };
        } catch (error) {
            throw new AuthenticationError('Invalid or expired token');
        }
    }

    async getUserById(uid: string): Promise<admin.auth.UserRecord> {
        try {
            return await this.firebaseAuth.getUser(uid);
        } catch (error) {
            throw new AuthenticationError('User not found');
        }
    }
}
