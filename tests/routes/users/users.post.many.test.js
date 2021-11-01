process.env.TEST_SUITE = __filename

describe('POST /users - multi records', () => {
    test('happy path', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get('/api/users')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.CREATED)
        expect(res1.body.length).toEqual(test_data.length)
        expect(res1.body).toEqual(
            expect.arrayContaining([{
                _id: expect.any(String),
                created_at: expect.any(String),
                updated_at: expect.any(String),
                locked: false,
                login_attempts: 0,
                username: expect.any(String),
                email: expect.any(String),
                role: 'standard',
                verified: false,
            }])
        )

        // Assert records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length + test_data.length)
    })

    test('duplicate key', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        test_data.push(global.seed_data.users[2])

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
        let test_data = global.clone(global.seed_data.users)
        test_data[2].no_such_field = 'abc'

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

    test('missing required field', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        delete test_data[2].username

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

    test('invalid value', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        test_data[2].password = 'invalid password'

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
})