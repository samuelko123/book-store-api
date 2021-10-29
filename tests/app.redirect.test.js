process.env.TEST_SUITE = __filename

describe('app redirect', () => {
    test('redirect homepage to api doc', async () => {
        // Request
        let res = await global.request
            .get('/')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.FOUND)
        expect(res.headers['location']).toEqual('/docs')
    })
})