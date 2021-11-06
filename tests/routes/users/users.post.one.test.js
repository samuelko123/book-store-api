process.env.TEST_SUITE = __filename

describe('POST /users - single record', () => {
    test('happy path', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get(`/api/users/${test_data.username}`)

        let res3 = await global.request
            .get(`/api/users/${global.seed_data.users[0].username}`)

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.CREATED)
        expect(res1.body).toEqual({
            acknowledged: true,
            insertedId: expect.any(String),
        })

        // Assert records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            locked_until: new Date(0).toISOString(),
            login_attempts: 0,
            username: test_data.username,
            email: test_data.email,
            role: 'user',
            verified: false,
        })

        // Assert new record has different created_at timestamp
        expect(res3.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res3.body.created_at).not.toEqual(res2.body.created_at)
    })

    test('happy path - override default value', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]
        test_data.verified = true

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get(`/api/users/${test_data.username}`)

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.CREATED)
        expect(res1.body).toEqual({
            acknowledged: true,
            insertedId: expect.any(String),
        })

        // Assert records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            locked_until: new Date(0).toISOString(),
            login_attempts: 0,
            username: test_data.username,
            email: test_data.email,
            role: 'user',
            verified: true,
        })
    })

    test('duplicate key', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        test_data = test_data[0]

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get('/api/users')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.DUPLICATE_KEY)
        })

        // Assert no records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length)
    })

    test('invalid field', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]
        test_data.no_such_field = 'abc'

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get('/api/users')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.NOT_IN_SCHEMA)
        })

        // Assert no records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length)
    })

    test('invalid value', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]
        test_data.password = 'invalid password'

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get('/api/users')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining('request.body.password should match pattern')
        })

        // Assert no records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length)
    })

    test('missing required field', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]
        delete test_data.email

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get('/api/users')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.MISSING_REQUIRED)
        })

        // Assert no records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length)
    })

    test('missing request body', async () => {
        // Request
        let res1 = await global.request
            .post('/api/users')

        let res2 = await global.request
            .get('/api/users')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.UNSUPPORTED_MEDIA_TYPE)
        })

        // Assert no records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length)
    })
})