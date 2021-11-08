process.env.TEST_SUITE = __filename

describe('app env', () => {
    const OLD_ENV = process.env
    let app

    beforeEach(() => {
        process.env = { ...OLD_ENV }
    })

    afterEach(() => {
        process.env = OLD_ENV
    })

    test('no api validator for production', async () => {
        // Prepare
        const OpenApiValidator = require('express-openapi-validator')
        process.env.NODE_ENV = 'production'
        jest.isolateModules(() => {
            app = require('../../app').create()
        })

        let spy = {
            validator: jest.spyOn(OpenApiValidator, 'middleware')
        }

        // Assert
        expect(spy.validator).toHaveBeenCalledTimes(0)
    })
})