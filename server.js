const dotenv = require('dotenv')
const logger = require('./utils/logger')

async function start_server() {
    try {
        logger.info('Starting server')

        // read .env file
        dotenv.config()

        // Regenerate documentation
        await require('./doc')()

        // Connect to DB
        const db = require('./db')
        if (process.env.NODE_ENV !== 'production') {
            require('mongoose')
            const { MongoMemoryServer } = require('mongodb-memory-server')
            const mongo_server = await MongoMemoryServer.create()
            const uri = mongo_server.getUri()
            await db.connect(uri)
        } else {
            await db.connect(process.env.MONGO_URI)
        }

        // Start the Express server
        const app = await require('./app').create()
        const port = process.env.PORT || 3000
        app.listen(port, () => {
            logger.info(`Listening on port ${port}`)
        })
    } catch (err) {
        logger.error(err)
    }
}

start_server()