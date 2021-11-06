const empty = require('../../utils/empty')
const logger = require('../../utils/logger')
process.env.TEST_SUITE = __filename

describe('routing error handling', () => {
    test('Not Found', async () => {
        // Request
        let res = await global.request
            .get('/no-such-path')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NOT_FOUND)
        expect(res.body).toEqual({
            error: 'Not Found'
        })
    })

    test('Internal Server Error', async () => {
        // Prepare
        let spy = {
            empty_fn: jest.spyOn(empty, 'empty_fn').mockImplementation(() => {
                throw Error('Test Error')
            }),
            logger: jest.spyOn(logger, 'error')
        }

        // Request
        let res = await global.request
            .get('/error-path')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.SERVER_ERROR)
        expect(res.body).toEqual({
            error: 'Test Error'
        })
        expect(spy.empty_fn).toHaveBeenCalledTimes(1)
        expect(spy.logger).toHaveBeenCalledTimes(1)
    })

    test('error in error handler', async () => {
        // Prepare
        let spy = {
            logger_warn: jest.spyOn(logger, 'warn').mockImplementation((err) => {
                throw Error('Test Error in Error Handler')
            }),
            logger_error: jest.spyOn(logger, 'error')
        }

        // Request
        let res = await global.request
            .get('/no-such-path')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NOT_FOUND)
        expect(spy.logger_warn).toHaveBeenCalledTimes(1) // 404 Not Found
        expect(spy.logger_error).toHaveBeenCalledTimes(1) // caused by error thrown in logger.warn
    })
})