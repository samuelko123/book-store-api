process.env.TEST_SUITE = __filename

describe('DELETE /users/:username', () => {
    test('happy path', async () => {
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
            acknowledged: true,
            deletedCount: 1,
        })

        // Assert records deleted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length - 1)
    })

    test('non-existent id', async () => {
        // Prepare
        let test_data = 'no such user'

        // Request
        let res = await global.request
            .delete(`/api/users/${test_data}`)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body).toEqual({
            acknowledged: true,
            deletedCount: 0,
        })
    })

    test('server error', async () => {
        // Prepare
        let test_data = global.seed_data.users[0]

        const controller = require('../../../controllers/users')
        const err_msg = 'Test Error'
        let spy = {
            fn: jest.spyOn(controller, 'clean_input_obj').mockImplementation(() => {
                throw Error(err_msg)
            }),
        }

        // Request
        let res = await global.request
            .delete(`/api/users/${test_data.username}`)

        // Assert
        expect(spy.fn).toHaveBeenCalledTimes(1)

        expect(res.status).toEqual(global.constants.HTTP_STATUS.SERVER_ERROR)
        expect(res.body).toEqual({
            error: err_msg
        })
    })
})