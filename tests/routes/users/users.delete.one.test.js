process.env.TEST_SUITE = __filename

describe('DELETE /users/:username', () => {
    test('happy path - return deleted record', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        test_data = test_data[0]

        // Request
        let res1 = await global.request
            .delete(`/api/users/${test_data.username}`)

        let res2 = await global.request
            .get('/api/users')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.body).toEqual({
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            locked: false,
            login_attempts: 0,
            username: test_data.username,
            email: test_data.email,
            role: 'standard',
            verified: false,
        })

        // Assert records deleted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length - 1)
    })

    test('non-existent id', async () => {
        // Prepare
        let test_data = 'no such user'

        // Request
        let res1 = await global.request
            .delete(`/api/users/${test_data}`)

        let res2 = await global.request
            .get('/api/users')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.NOT_FOUND)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.NO_DOCUMENT_FOUND)
        })

        // Assert no records deleted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length)
    })
})