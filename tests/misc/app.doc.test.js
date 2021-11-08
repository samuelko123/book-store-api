process.env.TEST_SUITE = __filename

describe('openapi json', () => {
    test('redirect homepage to api doc', async () => {
        // Request
        let res = await global.request
            .get('/')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.FOUND)
        expect(res.headers['location']).toEqual('/docs')
    })

    test('/doc returns openapi json', async () => {
        // Request
        let res = await global.request
            .get(global.constants.OPEN_API_JSON.URL)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
    })
})