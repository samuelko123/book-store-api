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
            locked_until: new Date(0).toISOString(),
            login_attempts: 0,
            username: test_data.username,
            email: test_data.email,
            role: 'user',
            verified: false,
        })
    })

    test('non-existent id', async () => {
        // Request
        let res = await global.request
            .get('/api/users/nosuchuser')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NO_CONTENT)
        expect(res.body).toEqual({})
    })

    test('error handler', async () => {
        // Prepare
        let test_data = global.seed_data.books[0]

        const controller = require('../../../controllers/users')
        const err_msg = 'Test Error'
        let spy = {
            fn: jest.spyOn(controller, 'clean_input_obj').mockImplementation(() => {
                throw Error(err_msg)
            }),
        }

        // Request
        let res = await global.request
            .get(`/api/users/${test_data.username}`)

        // Assert
        expect(spy.fn).toHaveBeenCalledTimes(1)

        expect(res.status).toEqual(global.constants.HTTP_STATUS.SERVER_ERROR)
        expect(res.body).toEqual({
            error: err_msg
        })
    })
})