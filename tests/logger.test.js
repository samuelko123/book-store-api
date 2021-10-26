process.env.TEST_SUITE = __filename

describe('winston logger', () => {
    const OLD_ENV = process.env

    beforeEach(() => {
        jest.resetModules()
        process.env = { ...OLD_ENV }
    })

    afterEach(() => {
        process.env = OLD_ENV
    })

    test('debug for development', async () => {
        // Prepare
        process.env.NODE_ENV = 'development'
        const logger = require(`${process.cwd()}/utils/logger`)

        // Assert
        expect(logger.level).toEqual('debug')
    })

    test('info for production', async () => {
        // Prepare
        process.env.NODE_ENV = 'production'
        const logger = require(`${process.cwd()}/utils/logger`)

        // Assert
        expect(logger.level).toEqual('http')
    })
})