process.env.TEST_SUITE = __filename

describe('error handling', () => {
    test('Not Found', async () => {
        // Action
        let res = await global.request
            .get('/no-such-path')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NOT_FOUND)
        expect(res.body).toEqual({ error: global.constants.MESSAGES.NOT_FOUND })
    })

    test('openapi json', async () => {
        // Request
        let res = await global.request
            .get('/docs/openapi.json')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res.headers['content-type']).toMatch(/json/)
    })

    test('redirect homepage to api doc', async () => {
        // Request
        let res = await global.request
            .get('/')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(constants.HTTP_STATUS.FOUND)
        expect(res.headers['location']).toEqual('/docs')
    })
})