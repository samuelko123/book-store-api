process.env.TEST_SUITE = __filename

describe('create_collections', () => {
    test('not create collection if exists', async () => {
        // Prepare
        const mongo = require('../../utils/mongo')
        let spy = {
            fn: jest.spyOn(mongo.db, 'createCollection')
        }

        // Action
        await mongo.create_collections()

        // Assert
        expect(spy.fn).toHaveBeenCalledTimes(0) // collections already created in test-setup
    })
})