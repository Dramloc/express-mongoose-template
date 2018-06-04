import winston from 'winston';

export default function createLogger(label) {
  if (process.env.NODE_ENV === 'production') {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({ label }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({
          filename: 'error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'combined.log',
        }),
      ],
    });
  }

  return winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.label({ label }),
      winston.format.colorize(),
      winston.format.printf(log => `[${log.label}] ${log.level}: ${log.message}`),
    ),
    transports: [new winston.transports.Console()],
  });
}
