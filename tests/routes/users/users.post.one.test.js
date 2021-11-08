process.env.TEST_SUITE = __filename
const { db } = require('../../../mongo')

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

    test('happy path - ensure password is hashed', async () => {
        // Prepare
        const { db } = require('../../../mongo')
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]

        // Request
        let res = await global.request
            .post('/api/users')
            .send(test_data)

        let user = await db.collection('users').findOne({ username: test_data.username })

        // Assert response
        expect(res.status).toEqual(global.constants.HTTP_STATUS.CREATED)

        // Assert password is hashed
        expect(user.password.startsWith('$2a$' + global.constants.AUTH.SALT_WORK_FACTOR)).toEqual(true)
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
            .get('/api/users?role=user')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.MESSAGES.DUP_KEY_ERR)
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
            .get('/api/users?role=user')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.MESSAGES.UNKNOWN_PROP)
        })

        // Assert no records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length)
    })

    test('invalid username - too short', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]
        test_data.username = 'user'

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get('/api/users?role=user')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining('username must')
        })

        // Assert no records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length)
    })

    test('invalid password - too short', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]
        test_data.password = 'abc'

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get('/api/users?role=user')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining('password must')
        })

        // Assert no records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length)
    })

    test('invalid password - no lowercase', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]
        test_data.password = 'PASSWORD'

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get('/api/users?role=user')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining('password must')
        })

        // Assert no records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length)
    })

    test('invalid password - no uppercase', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]
        test_data.password = 'password'

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get('/api/users?role=user')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining('password must')
        })

        // Assert no records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length)
    })

    test('invalid password - no digit', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]
        test_data.password = 'PASSword'

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get('/api/users?role=user')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining('password must')
        })

        // Assert no records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length)
    })

    test('invalid password - no special char', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.users)
        test_data = test_data[0]
        test_data.password = 'PASSword123'

        // Request
        let res1 = await global.request
            .post('/api/users')
            .send(test_data)

        let res2 = await global.request
            .get('/api/users?role=user')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining('password must')
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
            .get('/api/users?role=user')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.MESSAGES.MISSING_REQUIRED)
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
            .get('/api/users?role=user')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE)
        expect(res1.body).toEqual({
            error: global.constants.MESSAGES.EXPECT_REQ_BODY
        })

        // Assert no records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length)
    })
})