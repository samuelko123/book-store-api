const MongoClient = require('mongodb').MongoClient
const logger = require('./logger')

module.exports = new function () {
    this.client = null
    this.db = null

    this.connect = async function (uri) {
        this.client = await MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        this.db = this.client.db()

        await this.create_collections()
        await this.set_indexes()

        logger.info('Connected to database')
    }

    this.create_collections = async function () {
        let coll_names = await this.db.listCollections().toArray()
        coll_names = coll_names.map(x => x.name)

        const models = require('../models')
        for (let key in models) {
            let model = models[key]

            if (!coll_names.includes(model.name)) {
                await this.db.createCollection(model.name)
            }
        }
    }

    this.set_indexes = async function () {
        const models = require('../models')
        for (let key in models) {
            let model = models[key]

            for (let field of model.indexes) {
                await this.db.collection(model.name).createIndex(field, { unique: true })
            }
        }
    }
}