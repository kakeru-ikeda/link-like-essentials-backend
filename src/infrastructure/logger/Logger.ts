import winston from 'winston';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? ` ${JSON.stringify(meta)}`
      : '';
    return `${String(timestamp)} [${String(level)}]: ${String(message)}${metaString}`;
  })
);

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: customFormat,
  defaultMeta: { service: 'link-like-backend' },
  transports: [
    new winston.transports.Console({
      format: NODE_ENV === 'production' ? customFormat : consoleFormat,
    }),
  ],
});

// Production環境では、ファイル出力も追加可能
if (NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

export default logger;
