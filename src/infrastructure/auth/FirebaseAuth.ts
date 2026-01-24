import admin from 'firebase-admin';

import { getEnvVar } from '@/config/env';

import { logger } from '../logger/Logger';

export class FirebaseAuth {
  private auth: admin.auth.Auth;
  private static instance: FirebaseAuth;

  private constructor() {
    try {
      const serviceAccountPath = getEnvVar('FIREBASE_SERVICE_ACCOUNT_PATH');

      // サービスアカウントキーの読み込み
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount: admin.ServiceAccount = require(
        serviceAccountPath
      ) as admin.ServiceAccount;

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.LLES_FIREBASE_PROJECT_ID,
        });
      }

      this.auth = admin.auth();
      logger.info('Firebase Admin initialized');
    } catch (error) {
      logger.error('Firebase Admin initialization failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  static getInstance(): FirebaseAuth {
    if (!FirebaseAuth.instance) {
      FirebaseAuth.instance = new FirebaseAuth();
    }
    return FirebaseAuth.instance;
  }

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await this.auth.verifyIdToken(token);
      logger.debug('Token verified', { uid: decodedToken.uid });
      return decodedToken;
    } catch (error) {
      logger.warn('Token verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getUser(uid: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.auth.getUser(uid);
    } catch (error) {
      logger.error('Get user failed', {
        uid,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
