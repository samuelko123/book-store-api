const mongo = require('../../mongo')
const logger = require('../../utils/logger')
process.env.TEST_SUITE = __filename

describe('connect to database', () => {
    test('logger will log the error', async () => {
        let spy = {
            logger: jest.spyOn(logger, 'error')
        }
        await mongo.connect('invalid-mongo-uri')
        expect(spy.logger).toHaveBeenCalledTimes(1)
    })

    test('do not create collection if exists', async () => {
        // Prepare
        let mongo_mock
        jest.isolateModules(() => {
            mongo_mock = require('../../mongo')
        })

        let spy = {
            exists: jest.spyOn(mongo_mock, 'collection_exists').mockImplementation(() => {
                return true
            })
        }

        // Request
        await mongo_mock.connect(process.env.mongo_uri_test)

        // Assert
        expect(await mongo_mock.db.listCollections().toArray()).toEqual([])

        // Clean up
        mongo_mock.client.close()
    })
})
