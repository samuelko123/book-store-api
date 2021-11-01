process.env.TEST_SUITE = __filename

describe('GET /users', () => {
    test('no filters', async () => {
        // Request
        let res = await global.request
            .get(`/api/users`)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body.length).toEqual(global.seed_data.users.length)
        expect(res.body).toEqual(
            expect.arrayContaining([{
                _id: expect.any(String),
                created_at: expect.any(String),
                updated_at: expect.any(String),
                username: expect.any(String),
                email: expect.any(String),
                locked: false,
                login_attempts: 0,
                verified: false,
                role: 'standard',
            }])
        )
    })
})