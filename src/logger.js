const winston = require('winston');
const LEVEL = Symbol.for('level');

const levels = { 
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        filterOnly(process.env.LOG_ONLY || 'info'), // 'all' for logging all below provided level
        winston.format.printf(
          (info) => {
            return `${info.level}: ${info.message}`;
          })
      ),
      showLevel: false,
    }),
  ],
  exitOnError: false,
  silent: process.env.LOG_SILENT == 'true',
});

function filterOnly(level) {
  return winston.format(function (info) {
    if(level == 'all') {
      return info;
    }
    if (info[LEVEL] === level) {
      return info;
    }
  })();
}

function info(message) {
  logger.log('info', message);
}

function error(message) {
  logger.log('error', message);
}

function debug(message) {
  logger.log('debug', message);
}

module.exports = {
  info,
  error,
  debug,
}