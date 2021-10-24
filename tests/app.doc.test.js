require(`${process.cwd()}/tests/fixtures/request`)
const constants = require(`${process.cwd()}/utils/constants`)
process.env.TEST_SUITE = __filename

describe('doc json', () => {
    test('returns openapi json', async () => {
        // Request
        let res = await global.request
            .get('/docs/openapi.json')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res.headers['content-type']).toMatch(/json/)
    })
})