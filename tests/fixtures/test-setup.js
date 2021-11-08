const supertest = require('supertest')
const path = require('path')
const dotenv = require('dotenv')
const mongo = require('../../mongo')

beforeAll(async () => {
    // constants
    global.constants = require('../../utils/constants')
    global.seed_data = require('./seed_data')
    global.test_data = require('./test_data')
    global.clone = require('rfdc')()

    // read .env file
    dotenv.config()

    // create db name for each test suite
    let db_name = 'db-' + path.basename(process.env.TEST_SUITE).split('.').join('-')
    let uri = process.env.mongo_uri_test.replace('?', db_name + '?')

    // connect to mongo db
    await mongo.connect(uri)

    // session store
    const session_store = await mongo.create_session_store()

    // express server
    const server = await require('../../app').create(session_store)
    global.request = supertest.agent(server)
})

beforeEach(async () => {
    // clear db
    let collections = await mongo.db.listCollections().toArray()
    let coll_names = collections.map(x => x.name)
    for (let coll_name of coll_names) {
        await mongo.db.collection(coll_name).deleteMany({})
    }

    // seed db
    for (let coll_name of constants.MONGO_SCHEMAS) {
        let controller = require(`../../controllers/${coll_name}`)
        let data = global.clone(global.seed_data[coll_name])
        await controller.clean_input_arr(data)
        if (!!controller.add_defaults_to_arr) {
            controller.add_defaults_to_arr(data)
        }
        await mongo.db.collection(coll_name).insertMany(data)
        await mongo.update_super_admin()
    }

    // login as admin
    if (!process.env.TEST_SUITE.includes('auth')) {
        await global.request
            .post('/api/auth/login')
            .auth(process.env.SUPER_ADMIN_USERNAME, process.env.SUPER_ADMIN_PASSWORD)
    }
})

afterAll(async () => {
    await mongo.client.close()
})