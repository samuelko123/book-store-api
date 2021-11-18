process.env.TEST_SUITE = __filename

describe('unhappy path', () => {
    test('unexpected error in error handler', async () => {
        // Prepare
        const error_handler = require('../../utils/error_handler')
        const logger = require('../../utils/logger')
        let spy = {
            warn_logger: jest
                .spyOn(logger, 'warn')
                .mockImplementation(() => { throw new Error('hello world') })
            ,
            error_logger: jest.spyOn(logger, 'error')
        }
        let mock_err = {
            status: 400,
            message: 'Not Found',
        }

        // Action
        await error_handler(mock_err, global.mock_req, global.mock_res, global.mock_next)

        // Assert
        expect(spy.warn_logger).toHaveBeenCalledTimes(1)
        expect(spy.error_logger).toHaveBeenCalledTimes(1)
    })
})