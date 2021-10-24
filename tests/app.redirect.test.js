require(`${process.cwd()}/tests/fixtures/request`)
const constants = require(`${process.cwd()}/utils/constants`)
process.env.TEST_SUITE = __filename

describe('app redirect', () => {
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