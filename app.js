const express = require('express')
const responseTime = require('response-time')
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const swaggerUi = require("swagger-ui-express")

const not_found_handler = require('./utils/not_found_handler')
const error_handler = require('./utils/error_handler')
const logger = require('./utils/logger')
const constants = require('./utils/constants')

// initialize Express
const app = express()
app.use(helmet())
app.use(cors())
app.use(responseTime())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(rateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000 // 1,000 requests per IP
}))
app.enable('trust proxy')
app.set('json spaces', 4)

// initialize http traffic logger
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: { write: (message) => logger.http(message.trim()) }
}))

// home page => API Documentation
app.get('/', (req, res, next) => {
    res.redirect('/docs')
})

// // documentation route
app.get(constants.OPEN_API_JSON.URL, (req, res, next) => {
    res.json(require(constants.OPEN_API_JSON.FILE))
})

// initialize routers
app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(null, {
        customSiteTitle: 'Book Store API',
        swaggerOptions: {
            url: constants.OPEN_API_JSON.URL
        }
    })
)
app.use('/api', require('./routers'))
app.use(not_found_handler)
app.use(error_handler)

module.exports = app
