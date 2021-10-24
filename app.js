const dotenv = require('dotenv')
const express = require('express')
const responseTime = require('response-time')
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const swaggerUi = require("swagger-ui-express")
const OpenApiValidator = require('express-openapi-validator')
const { CustomError } = require(`${process.cwd()}/utils/error`)
const empty = require(`${process.cwd()}/utils/empty`)
const error_handler = require(`${process.cwd()}/utils/error_handler`)
const constants = require('./utils/constants')
const logger = require('./utils/logger')

module.exports.create = async () => {

    // read .env file
    dotenv.config()

    // initialize Express
    const app = express()
    app.use(helmet())
    app.use(cors())
    app.use(responseTime())
    app.use(rateLimiter({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 1000 // 1,000 requests per IP
    }))
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
        stream: { write: (message) => logger.http(message.trim()) }
    }))

    // Home page => API Documentation
    app.get('/', (req, res, next) => {
        res.redirect('/docs')
    })

    // Documentation route
    app.get('/docs/openapi.json', (req, res, next) => {
        res.json(require('./docs/openapi.json'))
    })

    app.use(
        '/docs',
        swaggerUi.serve,
        swaggerUi.setup(null, {
            customSiteTitle: 'Book Store API',
            swaggerOptions: {
                url: '/docs/openapi.json'
            }
        })
    )

    // Install API validation
    app.use(
        OpenApiValidator.middleware({
            apiSpec: './docs/openapi.json',
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

    // Error route
    app.use((err, req, res, next) => {
        try {
            err = error_handler.preprocess_error(err)
        } catch (err_in_handler) {
            logger.error(err_in_handler.stack)
        }

        // return error
        res
            .status(err.status)
            .json({ 'error': err.message })
    })

    return app
}