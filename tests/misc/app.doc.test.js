process.env.TEST_SUITE = __filename

describe('doc json', () => {
    test('returns openapi json', async () => {
        // Request
        let res = await global.request
            .get(global.constants.OPEN_API_JSON.URL)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
    })
})