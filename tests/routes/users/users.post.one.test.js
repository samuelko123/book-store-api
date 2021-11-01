process.env.TEST_SUITE = __filename

describe('POST /users - single record', () => {
    test('happy path - return created record', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get('/api/users')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.CREATED)
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

        // Assert records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length + 1)
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

    test('extra field - expect error', async () => {
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
            error: expect.stringContaining(global.constants.TEST_ERRORS.VALIDATION_FAILED)
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
})