const MongoClient = require('mongodb').MongoClient
const MongoStore = require('connect-mongo')
const bcrypt = require('bcryptjs')
const constants = require('./utils/constants')
const logger = require('./utils/logger')

module.exports = {
    client: null,
    db: null,

    connect: async function (uri) {
        try {
            // connect to mongo
            this.client = await MongoClient.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            this.db = this.client.db()

            // install schemas
            for (let coll_name of constants.MONGO_SCHEMAS) {
                if (!await this.collection_exists(coll_name)) {
                    await this.db.createCollection(coll_name)
                }

                await this.db.command({
                    collMod: coll_name,
                    validator: {
                        $jsonSchema: require(`./schemas/${coll_name}`)
                    },
                    validationLevel: 'strict',
                    validationAction: 'error',
                })
            }

            // create index
            await this.db.collection('books').createIndex('isbn', { unique: true })
            await this.db.collection('users').createIndex('username', { unique: true })
            await this.db.collection('users').createIndex('email', { unique: true })
        } catch (err) {
            logger.error(err.stack)
        }
    },

    create_session_store: async function () {
        return MongoStore.create({
            client: this.client,
            ttl: 14 * 24 * 60 * 60, // expire in 14 days
            autoRemove: 'interval',
            autoRemoveInterval: 10, // remove expired session every 10 mins
            touchAfter: 24 * 60 * 60 // each touch on same session should be min. 24 hrs apart
        })
    },

    collection_exists: async function (coll_name) {
        let colls = await this.db.listCollections().toArray()
        colls = colls.map(x => x.name)
        return colls.includes(coll_name)
    },

    update_super_admin: async function () {
        // update super admin account
        await this.db.collection('users').updateOne(
            { username: process.env.SUPER_ADMIN_USERNAME },
            {
                $set: {
                    username: process.env.SUPER_ADMIN_USERNAME,
                    password: await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, constants.AUTH.SALT_WORK_FACTOR),
                    email: process.env.SUPER_ADMIN_EMAIL,
                    verified: true,
                    role: 'admin',
                }
            },
            { upsert: true }
        )
    },
}