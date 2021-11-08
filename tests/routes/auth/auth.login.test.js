process.env.TEST_SUITE = __filename
const logger = require('../../../utils/logger')

describe('POST /auth/login', () => {
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

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.UNAUTHORIZED)
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res3.status).toEqual(global.constants.HTTP_STATUS.OK)
    })

    test('wrong password', async () => {
        // Prepare
        let test_data = {
            username: global.clone(global.seed_data.users)[0].username,
            password: 'wrong password'
        }

        // Request
        let res = await global.request
            .post('/api/auth/login')
            .auth(test_data.username, test_data.password)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.UNAUTHORIZED)
    })

    test('blank password', async () => {
        // Prepare
        let test_data = {
            username: global.clone(global.seed_data.users)[0].username,
        }

        // Request
        let res = await global.request
            .post('/api/auth/login')
            .auth(test_data.username, null)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.UNAUTHORIZED)
    })

    test('blank username', async () => {
        // Prepare
        let test_data = {
            password: 'no such password'
        }

        // Request
        let res = await global.request
            .post('/api/auth/login')
            .auth(null, test_data.password)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.UNAUTHORIZED)
    })

    test('no auth header', async () => {
        // Request
        let res = await global.request
            .post('/api/auth/login')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.UNAUTHORIZED)
    })

    test('non-existent user', async () => {
        // Prepare
        let test_data = {
            username: 'nosuchuser',
            password: 'no such password'
        }

        // Request
        let res = await global.request
            .post('/api/auth/login')
            .auth(test_data.username, test_data.password)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.UNAUTHORIZED)
    })

    test('reset login attempts', async () => {
        // Prepare
        const { db } = require('../../../mongo')
        let test_data = global.clone(global.seed_data.users)
        test_data = test_data[0]

        // Action
        let user1 = await db.collection('users').findOne({ username: test_data.username })

        let res1 = await global.request
            .post('/api/auth/login')
            .auth(test_data.username, 'wrong password')

        let user2 = await db.collection('users').findOne({ username: test_data.username })

        let res2 = await global.request
            .post('/api/auth/login')
            .auth(test_data.username, test_data.password)

        let user3 = await db.collection('users').findOne({ username: test_data.username })

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.UNAUTHORIZED)
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(user1.login_attempts).toEqual(0)
        expect(user2.login_attempts).toEqual(1)
        expect(user3.login_attempts).toEqual(0)
    })

    test('max login attempts', async () => {
        // Prepare
        const { db } = require('../../../mongo')
        let test_data = global.clone(global.seed_data.users)
        test_data = test_data[0]

        // Action
        let user1 = await db.collection('users').findOne({ username: test_data.username })

        let attempts = Array
            .from(Array(global.constants.AUTH.MAX_LOGIN_ATTEMPTS))
            .map(x => global.request
                .post('/api/auth/login')
                .auth(test_data.username, 'wrong password')
            )
        let res1_arr = await Promise.all(attempts)

        let user2 = await db.collection('users').findOne({ username: test_data.username })

        let res2 = await global.request
            .post('/api/auth/login')
            .auth(test_data.username, test_data.password)

        let user3 = await db.collection('users').findOne({ username: test_data.username })

        // Assert
        expect(res1_arr.map(res => res.status)).toEqual(Array(global.constants.AUTH.MAX_LOGIN_ATTEMPTS).fill(global.constants.HTTP_STATUS.UNAUTHORIZED))
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.UNAUTHORIZED) // because account is locked
        expect(user1.login_attempts).toEqual(0)
        expect(user2.login_attempts).toEqual(5)
        expect(user3.login_attempts).toEqual(5)
        expect(user1.locked_until).toEqual(new Date(0))
        expect(user2.locked_until).not.toEqual(new Date(0))
        expect(user3.locked_until).not.toEqual(new Date(0))
    })

    test('error handler', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.users)
        test_data = test_data[0]

        const bcrypt = require('bcryptjs')
        let spy = {
            compare: jest.spyOn(bcrypt, 'compare').mockImplementation(() => {
                throw Error('Test Error')
            }),
            logger: jest.spyOn(logger, 'error')
        }

        // Request
        let res = await global.request
            .post('/api/auth/login')
            .auth(test_data.username, test_data.password)

        // Assert error logged
        expect(res.status).toEqual(global.constants.HTTP_STATUS.SERVER_ERROR)
        expect(spy.compare).toHaveBeenCalledTimes(1)
        expect(spy.logger).toHaveBeenCalledTimes(1)
    })
})