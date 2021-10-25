const dotenv = require('dotenv')
const logger = require('./utils/logger')
const db = require('./db')

async function start_server() {
    try {
        logger.info('Starting server')

        // read .env file
        dotenv.config()

        // Regenerate documentation
        await require('./doc')()

        // Connect to DB
        if (process.env.NODE_ENV !== 'production') {
            const replica = await db.create_memory_replica()
            const uri = replica.getUri()
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