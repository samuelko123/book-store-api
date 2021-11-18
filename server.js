const logger = require('./utils/logger')

async function start_server() {
    try {
        // logging
        logger.info('Starting server')

        // read .env file
        const dotenv = require('dotenv')
        dotenv.config()

        // generate documentation
        const doc = require('./utils/doc')
        doc.generate()

        // connect to db
        const mongo = require('./utils/mongo')
        if (process.env.NODE_ENV == 'production') {
            await mongo.connect(process.env.MONGO_URI_PROD)
        } else {
            await mongo.connect(process.env.MONGO_URI_DEV)
        }

        // start the express server
        const app = require('./app')
        const port = process.env.PORT || 3000
        app.listen(port, () => {
            logger.info(`Listening on port ${port}`)
        })
    } catch (err) {
        logger.error(err)
    }
}

start_server()