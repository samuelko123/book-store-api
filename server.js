const dotenv = require('dotenv')
const logger = require('./utils/logger')
const db = require('./utils/db')
const doc = require('./utils/doc')
const app = require('./app')

async function start_server() {
    try {
        logger.info('Starting server')

        // read .env file
        dotenv.config()

        // generate documentation
        doc.generate()

        // connect to db
        if (process.env.NODE_ENV !== 'production') {
            await db.connect(process.env.MONGO_URI_DEV)
        } else {
            await db.connect(process.env.MONGO_URI)
        }

        // create session store
        const session_store = db.create_session_store()

        // start the express server
        const server = await app.create(session_store)
        const port = process.env.PORT || 3000
        server.listen(port, () => {
            logger.info(`Listening on port ${port}`)
        })
    } catch (err) {
        logger.error(err)
    }
}

start_server()