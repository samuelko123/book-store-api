process.env.TEST_SUITE = __filename

describe('DELETE /users', () => {
    test('happy path - return deleted count', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        test_data = test_data.slice(0, 2).map(x => `username=${x.username}`).join('&')

        // Request
        let res1 = await global.request
            .delete(`/api/users?${test_data}`)

        let res2 = await global.request
            .get('/api/users')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.body).toEqual({ deletedCount: 2 })

        // Assert records deleted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length - 2)
    })

    test('non-existent id - expect error', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        test_data = test_data.slice(0, 2).map(x => `username=${x.username}`).join('&')
        test_data += '&username=no_such_user'

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

    test('duplicate key - expect success', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        test_data = test_data.slice(0, 2).map(x => `username=${x.username}`).join('&')
        test_data += '&username=' + global.seed_data.users[0].username

        // Request
        let res1 = await global.request
            .delete(`/api/users?${test_data}`)

        let res2 = await global.request
            .get('/api/users')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.body).toEqual({ deletedCount: 2 })

        // Assert records deleted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.users.length - 2)
    })
})