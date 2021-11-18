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
})