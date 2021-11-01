const winston = require('winston')
const { LEVEL } = require('triple-beam')
const { LOG_COLORS } = require('./constants')

winston.addColors(LOG_COLORS)

function filterOnly(level) {
    return winston.format(function (info) {
        if (info[LEVEL] === level) {
            return info
        }
    })()
}

module.exports = winston.createLogger({
    level: (process.env.NODE_ENV == 'production' ? 'http' : 'debug'),
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.colorize({ all: true }),
            silent: (process.env.NODE_ENV == 'test'),
        }),
        new winston.transports.File({
            filename: 'logs/all.log',
            maxsize: 1 * 1000 * 1000, // 1 MB
            maxFiles: 3
        }),
        new winston.transports.File({
            format: filterOnly('http'),
            filename: 'logs/http.log',
            level: 'http',
            maxsize: 1 * 1000 * 1000, // 1 MB
            maxFiles: 3
        }),
        new winston.transports.File({
            format: filterOnly('info'),
            filename: 'logs/info.log',
            level: 'info',
            maxsize: 1 * 1000 * 1000, // 1 MB
            maxFiles: 3
        }),
        new winston.transports.File({
            format: filterOnly('warn'),
            filename: 'logs/warn.log',
            level: 'warn',
            maxsize: 1 * 1000 * 1000, // 1 MB
            maxFiles: 3
        }),
        new winston.transports.File({
            format: filterOnly('error'),
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 1 * 1000 * 1000, // 1 MB
            maxFiles: 3
        }),
    ],
})