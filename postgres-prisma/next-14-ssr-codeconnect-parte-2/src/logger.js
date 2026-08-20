import { createLogger, format, transports } from 'winston';

const loggerTransports =
  process.env.NODE_ENV === 'production'
    ? [new transports.Console()]
    : [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
      ];

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: loggerTransports,
});

export default logger
