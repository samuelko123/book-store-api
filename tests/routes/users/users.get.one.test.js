process.env.TEST_SUITE = __filename

describe('GET /users/:username', () => {
    test('happy path', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        test_data = test_data[0]

        // Request
        let res = await global.request
            .get(`/api/users/${test_data.username}`)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body).toEqual({
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            locked: false,
            login_attempts: 0,
            username: test_data.username,
            email: test_data.email,
            role: 'user',
            verified: false,
        })
    })

    test('not found', async () => {
        // Request
        let res = await global.request
            .get('/api/users/no-such-user')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NOT_FOUND)
        expect(res.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.NO_DOCUMENT_FOUND)
        })
    })
})