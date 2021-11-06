const supertest = require('supertest')
const path = require('path')
const mongo = require('../../mongo')

beforeAll(async () => {
    // constants
    global.constants = require('../../utils/constants')
    global.seed_data = require('./seed_data')
    global.test_data = require('./test_data')
    global.clone = require('rfdc')()

    // create db name for each test suite
    let db_name = 'db-' + path.basename(process.env.TEST_SUITE).split('.').join('-')
    let uri = process.env.mongo_uri_test.replace('?', db_name + '?')

    // connect to mongo db
    await mongo.connect(uri)

    // session store
    const session_store = await mongo.create_session_store()

    // express server
    const server = await require('../../app').create(session_store)
    global.request = supertest(server)
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
        let data = global.clone(global.seed_data[coll_name])
        let controller = require(`../../controllers/${coll_name}`)
        controller.clean_input_arr(data)
        if (!!controller.add_defaults_to_arr){
            controller.add_defaults_to_arr(data)
        }
        await mongo.db.collection(coll_name).insertMany(data)
    }
})

afterAll(async () => {
    await mongo.client.close()
})