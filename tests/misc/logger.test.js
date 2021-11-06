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

    test('debug for development', async () => {
        // Prepare
        process.env.NODE_ENV = 'development'
        jest.isolateModules(() => {
            logger = require('../../utils/logger')
        })

        // Assert
        expect(logger.level).toEqual('debug')
    })

    test('info for production', async () => {
        // Prepare
        process.env.NODE_ENV = 'production'
        jest.isolateModules(() => {
            logger = require('../../utils/logger')
        })

        // Assert
        expect(logger.level).toEqual('http')
    })
})