const mongo = require('../../utils/mongo')
beforeAll(async () => {
    // create db for each test suite
    const path = require('path')
    let db_name = 'db-' + path.basename(process.env.TEST_SUITE).split('.').join('-')
    let uri = process.env.MONGO_URI_TEST.replace('?', db_name + '?')

    // connect to mongo db
    await mongo.connect(uri)

    // constants
    global.clone = require('rfdc')()
    global.validator = require('../../utils/validator')
    global.models = require('../../models')
    global.controllers = require('../../controllers')
    global.seed_data = require('./seed_data')
    global.test_data = require('./test_data')
    global.constants = require('../../utils/constants')

    // req res factory
    global.create_mock_res = () => {
        let res = {}
        res.status = jest.fn().mockReturnValue(res)
        res.json = jest.fn().mockReturnValue(res)
        return res
    }

    // express app
    if (process.env.TEST_SUITE.includes('router')) {
        const supertest = require('supertest')
        const app = require('../../app')
        global.request = supertest(app)
    }
})

beforeEach(async () => {
    if (
        process.env.TEST_SUITE.includes('model')
        || process.env.TEST_SUITE.includes('router')
    ) {
        // clear db
        let collections = await mongo.db.listCollections().toArray()
        let coll_names = collections.map(x => x.name)
        for (let coll_name of coll_names) {
            await mongo.db.collection(coll_name).deleteMany({})
        }

        // seed db
        for (let coll_name in global.seed_data) {
            let data = global.clone(global.seed_data[coll_name])
            await mongo.db.collection(coll_name).insertMany(data)
        }
    }

    if (
        process.env.TEST_SUITE.includes('controller')
        || process.env.TEST_SUITE.includes('error_handler')
    ) {
        global.mock_req = {
            query: {},
            params: {},
            body: {},
            session: {},
        }
        global.mock_res = global.create_mock_res()
        global.mock_next = jest.fn()
        global.mock_err = new Error('hello world')
    }
})

afterAll(async () => {
    // disconnect from mongo db
    await mongo.client.close()
})