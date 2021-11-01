process.env.TEST_SUITE = __filename

describe('PATCH /users/:username', () => {
    test('success - return updated record', async () => {
        // Prepare
        let username = global.seed_data.users[0].username
        let test_data = {
            email: 'new_email@gmail.com',
            role: 'admin',
        }

        // Request
        let res1 = await global.request
            .patch(`/api/users/${username}`)
            .send(test_data)

        let res2 = await global.request
            .get(`/api/users/${username}`)

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.body).toEqual({
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            locked: false,
            login_attempts: 0,
            username: username,
            email: test_data.email,
            role: test_data.role,
            verified: false,
        })

        // Assert record updated
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            locked: false,
            login_attempts: 0,
            username: username,
            email: test_data.email,
            role: test_data.role,
            verified: false,
        })
    })

    test('non-existent id', async () => {
        // Prepare
        let username = 'no such user'
        let test_data = {
            email: 'new_email@gmail.com',
            role: 'admin',
        }

        // Request
        let res = await global.request
            .patch(`/api/users/${username}`)
            .send(test_data)

        // Assert response
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NOT_FOUND)
        expect(res.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.NO_DOCUMENT_FOUND)
        })
    })

    test('duplicate key', async () => {
        // Prepare
        let user = global.seed_data.users[0]
        let username = user.username
        let test_data = {
            email: global.seed_data.users[1].email,
            role: 'admin'
        }

        // Request
        let res1 = await global.request
            .patch(`/api/users/${username}`)
            .send(test_data)

        let res2 = await global.request
            .get(`/api/users/${username}`)

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.DUPLICATE_KEY)
        })

        // Assert record not updated
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            locked: false,
            login_attempts: 0,
            username: user.username,
            email: user.email,
            role: 'standard',
            verified: false,
        })
    })

    test('invalid field', async () => {
        // Prepare
        let user = global.seed_data.users[0]
        let username = user.username
        let test_data = {
            email: 'new_email@gmail.com',
            invalid_field: 'new user',
        }

        // Request
        let res1 = await global.request
            .patch(`/api/users/${username}`)
            .send(test_data)

        let res2 = await global.request
            .get(`/api/users/${username}`)

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.NOT_IN_SCHEMA)
        })

        // Assert record not updated
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            locked: false,
            login_attempts: 0,
            username: user.username,
            email: user.email,
            role: 'standard',
            verified: false,
        })
    })

    test('invalid update - immutable field', async () => {
        // Prepare
        let user = global.seed_data.users[0]
        let username = user.username
        let test_data = {
            created_at: '2000-01-01T01:01:01.000Z', // immutable
            role: 'admin'
        }

        // Request
        let res1 = await global.request
            .patch(`/api/users/${username}`)
            .send(test_data)

        let res2 = await global.request
            .get(`/api/users/${username}`)

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.IMMUTABLE_FIELD)
        })

        // Assert record not updated
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            locked: false,
            login_attempts: 0,
            username: user.username,
            email: user.email,
            role: 'standard',
            verified: false,
        })
    })
})