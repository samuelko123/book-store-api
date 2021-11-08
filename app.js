const dotenv = require('dotenv')
const express = require('express')
const responseTime = require('response-time')
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const swaggerUi = require("swagger-ui-express")
const session = require('express-session')

const { CustomError } = require('./utils/error')
const empty = require('./utils/empty')
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
        name: 'book_store_api_session_id',
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

    // swagger ui
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

    // api validation
    if (process.env.NODE_ENV !== 'production') {
        const OpenApiValidator = require('express-openapi-validator')
        app.use(
            OpenApiValidator.middleware({
                apiSpec: constants.OPEN_API_JSON.FILE,
                validateRequests: false,
                validateResponses: true,
                validateApiSpec: true,
                ignoreUndocumented: false,
            }),
        )
    }

    // api route
    app.use('/api', require('./routes'))

    // test route (useful for mocking)
    app.use((req, res, next) => {
        empty.empty_fn()
        next()
    })

    // 'Not Found' route
    app.use((req, res, next) => {
        next(new CustomError(constants.HTTP_STATUS.NOT_FOUND, 'Not Found'))
    })

    // error route
    app.use((err, req, res, next) => {

        // assign error status and log error
        try {
            if (
                !!err.name
                && err.name.startsWith('Mongo')
                && constants.MONGO_USER_ERRORS.includes(err.code)
            ) {
                // set http status to 400
                err.status = constants.HTTP_STATUS.BAD_REQUEST
            }

            // log error if http status is server error
            err.status = err.status || constants.HTTP_STATUS.SERVER_ERROR
            if (err.status >= 500 && err.status < 600) {
                logger.error(err.stack)
            } else {
                logger.warn(err)
            }

            // add header to Unauthorized response
            if (err.status == constants.HTTP_STATUS.UNAUTHORIZED) {
                res.set('WWW-Authenticate', 'Basic')
            }
        } catch (err_in_handler) {
            // log error during error handling
            logger.error(err_in_handler.stack)
        }

        res
            .status(err.status)
            .json({ error: err.message })
    })

    return app
}