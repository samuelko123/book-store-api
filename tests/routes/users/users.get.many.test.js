process.env.TEST_SUITE = __filename

describe('GET /users', () => {
    test('happy path', async () => {
        // Request
        let res = await global.request
            .get(`/api/users?role=user`)

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
                locked_until: new Date(0).toISOString(),
                login_attempts: 0,
                verified: false,
                role: 'user',
            }])
        )
    })

    test('date filter', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]

        let date_filter = new Date().toISOString()

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get(`/api/users?created_at.gt=${date_filter}`)

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.CREATED)
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual([{
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            username: test_data.username,
            email: test_data.email,
            locked_until: new Date(0).toISOString(),
            login_attempts: 0,
            verified: false,
            role: 'user',
        }])
    })
})