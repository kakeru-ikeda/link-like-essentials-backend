import Redis from 'ioredis';

import { logger } from '../logger/Logger';

function getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

export class RedisClient {
    private static instance: Redis;

    private constructor() { }

    static getInstance(): Redis {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis({
                host: getEnvVar('REDIS_HOST', 'localhost'),
                port: parseInt(getEnvVar('REDIS_PORT', '6379')),
                password: process.env.REDIS_PASSWORD,
                retryStrategy: (times: number) => {
                    const delay = Math.min(times * 50, 2000);
                    logger.warn(`Redis retry attempt ${times}, waiting ${delay}ms`);
                    return delay;
                },
                maxRetriesPerRequest: 3,
            });

            RedisClient.instance.on('connect', () => {
                logger.info('Redis connected successfully');
            });

            RedisClient.instance.on('error', (error: Error) => {
                logger.error('Redis connection error', { error: error.message });
            });

            RedisClient.instance.on('close', () => {
                logger.warn('Redis connection closed');
            });
        }

        return RedisClient.instance;
    }

    static async disconnect(): Promise<void> {
        if (RedisClient.instance) {
            await RedisClient.instance.quit();
            logger.info('Redis disconnected');
        }
    }
}
