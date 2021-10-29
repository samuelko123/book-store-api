const empty = require(`${process.cwd()}/utils/empty`)
const error_handler = require(`${process.cwd()}/utils/error_handler`)
const logger = require(`${process.cwd()}/utils/logger`)
process.env.TEST_SUITE = __filename

describe('routing error handling', () => {
    test('Not Found', async () => {
        // Request
        let res = await global.request.get('/no-such-path')

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
                throw Error('Unexpected Error')
            }),
            logger: jest.spyOn(logger, 'error')
        }

        // Request
        let res = await global.request.get('/error-path')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.SERVER_ERROR)
        expect(res.body).toEqual({
            error: 'Unexpected Error'
        })
        expect(spy.empty_fn).toHaveBeenCalledTimes(1)
        expect(spy.logger).toHaveBeenCalledTimes(1)
    })

    test('error in error handler', async () => {
        // Prepare
        let spy = {
            error_handler: jest.spyOn(error_handler, 'preprocess_error').mockImplementation((err) => {
                throw Error('Test Error in Error Handler')
            }),
            logger: jest.spyOn(logger, 'error')
        }

        // Request
        let res = await global.request.get('/no-such-path')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NOT_FOUND)
        expect(res.body).toEqual({
            error: 'Not Found'
        })
        expect(spy.error_handler).toHaveBeenCalledTimes(1)
        expect(spy.logger).toHaveBeenCalledTimes(1)
    })
})