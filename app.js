const dotenv = require('dotenv')
const express = require('express')
const responseTime = require('response-time')
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const swaggerUi = require("swagger-ui-express")
const OpenApiValidator = require('express-openapi-validator')
const session = require('express-session')

const { CustomError } = require('./utils/error')
const empty = require('./utils/empty')
const error_handler = require('./utils/error_handler')
const constants = require('./utils/constants')
const logger = require('./utils/logger')

module.exports.create = async (session_store) => {
    // read .env file
    dotenv.config()

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

    // initialize HTTP Traffic Logger
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
        stream: { write: (message) => logger.http(message.trim()) }
    }))

    // initialize session middlware
    app.use(session({
        name: 'book_store_session_id',
        secret: process.env.SESSION_SECRET_KEY, // this is used to encrypt session id
        saveUninitialized: false, // prevent empty sessions
        resave: false, // don't save session if unmodified
        store: session_store,
        cookie: {
            maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
            sameSite: 'lax', // allow cookie access within same domain, but disallow cross-site
            httpOnly: true, // prevent javascript from reading cookie
            secure: (process.env.NODE_ENV == 'production') // true means https only
        },
    }))

    // store session data
    app.use((req, res, next) => {
        req.session.ip = req.ip
        req.session.last_visited = new Date().toISOString()
        next()
    })
    
    // home page => API Documentation
    app.get('/', (req, res, next) => {
        res.redirect('/docs')
    })

    // documentation route
    app.get(constants.OPEN_API_JSON.URL, (req, res, next) => {
        res.json(require(constants.OPEN_API_JSON.FILE))
    })

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

    // install API validation
    app.use(
        OpenApiValidator.middleware({
            apiSpec: constants.OPEN_API_JSON.FILE,
            validateRequests: true,
            validateResponses: (process.env.NODE_ENV !== 'production'),
            validateApiSpec: true,
        }),
    )

    // API route
    app.use('/api', require('./routes'))

    // Test route (useful for mocking)
    app.use((req, res, next) => {
        empty.empty_fn()
        next()
    })

    // 'Not Found' route
    app.use((req, res, next) => {
        next(new CustomError(constants.HTTP_STATUS.NOT_FOUND, 'Not Found'))
    })

    // 'Error' route
    app.use((err, req, res, next) => {
        try {
            err = error_handler.preprocess_error(err)
        } catch (err_in_handler) {
            logger.error(err_in_handler.stack)
        }

        res
            .status(err.status)
            .json({ 'error': err.message })
    })

    return app
}