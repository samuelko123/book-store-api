process.env.TEST_SUITE = __filename

describe('winston logger', () => {
    const OLD_ENV = process.env
    let logger

    beforeEach(() => {
        process.env = { ...OLD_ENV }
    })

    afterEach(() => {
        process.env = OLD_ENV
    })

    test('console logging for production', async () => {
        // Prepare
        process.env.NODE_ENV = 'production'
        jest.isolateModules(() => {
            logger = require('../../utils/logger')
        })
        let spy = {
            fn: jest.spyOn(logger, 'info')
        }

        // Action
        logger.info('Testing')

        // Assert
        expect(spy.fn).toBeCalledWith(expect.stringContaining('Testing'))
        expect(logger.transports[0].name).toEqual('console')
        expect(logger.transports[0].silent).toEqual(false)
    })
})