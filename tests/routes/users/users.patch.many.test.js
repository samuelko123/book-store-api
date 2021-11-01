process.env.TEST_SUITE = __filename

describe('PATCH /users', () => {
    test('happy path', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        test_data = test_data.slice(0, 2).map(x => `username=${x.username}`).join('&')

        let body = {
            role: 'admin'
        }

        // Request
        let res1 = await global.request
            .patch(`/api/users?${test_data}`)
            .send(body)

        let res2 = await global.request
            .get('/api/users?role=admin')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.body).toEqual({
            acknowledged: true,
            modifiedCount: 2,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 2
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(2)
        expect(res2.body).toEqual(
            expect.arrayContaining([{
                _id: expect.any(String),
                created_at: expect.any(String),
                updated_at: expect.any(String),
                username: expect.any(String),
                email: expect.any(String),
                locked: false,
                login_attempts: 0,
                verified: false,
                role: 'admin',
            }])
        )
    })

    test('duplicate key - no problem', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        test_data = test_data.slice(0, 2).map(x => `username=${x.username}`).join('&')
        test_data += `&username=${global.seed_data.users[0].username}` // duplicate key

        let body = {
            role: 'admin'
        }

        // Request
        let res1 = await global.request
            .patch(`/api/users?${test_data}`)
            .send(body)

        let res2 = await global.request
            .get('/api/users?role=admin')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.body).toEqual({
            acknowledged: true,
            modifiedCount: 2,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 2
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(2)
        expect(res2.body).toEqual(
            expect.arrayContaining([{
                _id: expect.any(String),
                created_at: expect.any(String),
                updated_at: expect.any(String),
                username: expect.any(String),
                email: expect.any(String),
                locked: false,
                verified: false,
                login_attempts: 0,
                role: 'admin',
            }])
        )
    })

    test('non-existing id - no problem', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        test_data = test_data.slice(0, 2).map(x => `username=${x.username}`).join('&')
        test_data += '&username=no_such_user'

        let body = {
            role: 'admin'
        }

        // Request
        let res1 = await global.request
            .patch(`/api/users?${test_data}`)
            .send(body)

        let res2 = await global.request
            .get('/api/users?role=admin')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.body).toEqual({
            acknowledged: true,
            modifiedCount: 2,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 2
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(2)
        expect(res2.body).toEqual(
            expect.arrayContaining([{
                _id: expect.any(String),
                created_at: expect.any(String),
                updated_at: expect.any(String),
                username: expect.any(String),
                email: expect.any(String),
                locked: false,
                verified: false,
                login_attempts: 0,
                role: 'admin',
            }])
        )
    })

    test('no username - expect error', async () => {
        // Prepare
        let body = {
            role: 'admin'
        }

        // Request
        let res1 = await global.request
            .patch('/api/users')
            .send(body)

        let res2 = await global.request
            .get('/api/users?role=admin')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.MISSING_REQUIRED)
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(0)
    })

    test('no request body - expect error', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        test_data = test_data.slice(0, 2)

        // Request
        let res1 = await global.request
            .patch(`/api/users?${test_data}`)

        let res2 = await global.request
            .get('/api/users?role=admin')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.UNSUPPORTED_MEDIA_TYPE)
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(0)
    })
})