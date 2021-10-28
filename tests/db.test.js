const db = require(`${process.cwd()}/db`)
const logger = require(`${process.cwd()}/utils/logger`)
process.env.TEST_SUITE = __filename

describe('connect to database', () => {
    test('logger will log the error', async () => {
        let spy = {
            logger: jest.spyOn(logger, 'error')
        }
        await db.connect('invalid-mongo-uri')
        expect(spy.logger).toHaveBeenCalledTimes(1)
    })
})
