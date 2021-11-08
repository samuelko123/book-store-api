process.env.TEST_SUITE = __filename

describe('PATCH /users/:username', () => {
    test('happy path', async () => {
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

        let res3 = await global.request
            .get(`/api/users/${global.seed_data.users[1].username}`)

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.body).toEqual({
            acknowledged: true,
            matchedCount: 1,
            modifiedCount: 1,
            upsertedCount: 0,
            upsertedId: null,
        })

        // Assert record updated
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            locked_until: new Date(0).toISOString(),
            login_attempts: 0,
            username: username,
            email: test_data.email,
            role: test_data.role,
            verified: false,
        })

        // Assert new record has different updated_at timestamp
        expect(res3.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res3.body.updated_at).not.toEqual(res2.body.updated_at)
    })

    test('happy path - ensure password is hashed', async () => {
        // Prepare
        let username = global.seed_data.users[0].username
        let test_data = {
            password: global.seed_data.users[1].password
        }

        const { db } = require('../../../mongo')
        let user_old = await db.collection('users').findOne({ username: username })
        let hash_old = user_old.password

        // Action
        let res = await global.request
            .patch(`/api/users/${username}`)
            .send(test_data)

        let user_new = await db.collection('users').findOne({ username: username })
        let hash_new = user_new.password

        // Assert response
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body.modifiedCount).toEqual(1)

        // Assert password is hashed
        expect(user_old.password.startsWith('$2a$' + global.constants.AUTH.SALT_WORK_FACTOR)).toEqual(true)
        expect(user_new.password.startsWith('$2a$' + global.constants.AUTH.SALT_WORK_FACTOR)).toEqual(true)
        expect(hash_old).not.toEqual(hash_new)
    })

    test('invalid update - duplicate key', async () => {
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
            error: expect.stringContaining(global.constants.MESSAGES.DUP_KEY_ERR)
        })

        // Assert record not updated
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            locked_until: new Date(0).toISOString(),
            login_attempts: 0,
            username: user.username,
            email: user.email,
            role: 'user',
            verified: false,
        })
    })


    test('non-existent id', async () => {
        // Prepare
        let username = 'nosuchuser'
        let test_data = {
            email: 'new_email@gmail.com',
            role: 'admin',
        }

        // Request
        let res = await global.request
            .patch(`/api/users/${username}`)
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body).toEqual({
            acknowledged: true,
            matchedCount: 0,
            modifiedCount: 0,
            upsertedCount: 0,
            upsertedId: null,
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
            error: expect.stringContaining(global.constants.MESSAGES.UNKNOWN_PROP)
        })

        // Assert record not updated
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            locked_until: new Date(0).toISOString(),
            login_attempts: 0,
            username: user.username,
            email: user.email,
            role: 'user',
            verified: false,
        })
    })

    test('invalid update - immutable field', async () => {
        // Prepare
        let user = global.seed_data.users[0]
        let username = user.username
        let test_data = {
            _id: '616e3e2f5df30eb71e3b78d9', // mongo _id, not updateable
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
            error: expect.stringContaining(global.constants.MESSAGES.IMMUTABLE_FIELD)
        })

        // Assert record not updated
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            locked_until: new Date(0).toISOString(),
            login_attempts: 0,
            username: user.username,
            email: user.email,
            role: 'user',
            verified: false,
        })
    })

    test('missing request body', async () => {
        // Prepare
        let user = global.seed_data.users[0]
        let username = user.username

        // Request
        let res = await global.request
            .patch(`/api/users/${username}`)

        // Assert response
        expect(res.status).toEqual(global.constants.HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE)
        expect(res.body).toEqual({
            error: global.constants.MESSAGES.EXPECT_REQ_BODY
        })
    })
})