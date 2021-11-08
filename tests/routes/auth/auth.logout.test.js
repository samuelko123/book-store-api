process.env.TEST_SUITE = __filename

describe('GET /auth/logout', () => {
    test('happy path', async () => {
        // Prepare
        let test_data = {
            username: process.env.SUPER_ADMIN_USERNAME,
            password: process.env.SUPER_ADMIN_PASSWORD
        }

        // Request
        let res1 = await global.request
            .get('/api/users')

        let res2 = await global.request
            .post('/api/auth/login')
            .auth(test_data.username, test_data.password)

        let res3 = await global.request
            .get('/api/users')

        let res4 = await global.request
            .get('/api/auth/logout')

        let res5 = await global.request
            .get('/api/users')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.UNAUTHORIZED)
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res3.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res4.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res5.status).toEqual(global.constants.HTTP_STATUS.UNAUTHORIZED)
    })

    test('happy path - logout without login session', async () => {
        // Request
        let res = await global.request
            .get('/api/auth/logout')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
    })
    
    test('error handling', async () => {
        // Prepare

        const ctrl = require('../../../controllers/auth')
        let spy = {
            next: jest.fn()
        }

        // Action
        ctrl.logout({}, {}, spy.next)

        // Assert error is handled
        expect(spy.next).toHaveBeenCalledTimes(1)
    })
})