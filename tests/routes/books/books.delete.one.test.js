process.env.TEST_SUITE = __filename

describe('DELETE /books/:isbn', () => {
    test('happy path', async () => {
        // Prepare
        let test_data = global.seed_data.books[0]

        // Request
        let res1 = await global.request
            .delete(`/api/books/${test_data.isbn}`)

        let res2 = await global.request
            .get('/api/books')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.body).toEqual({
            acknowledged: true,
            deletedCount: 1,
        })

        // Assert records deleted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.books.length - 1)
    })

    test('non-existent id', async () => {
        // Prepare
        let isbn = 5554443332221

        // Request
        let res = await global.request
            .delete(`/api/books/${isbn}`)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body).toEqual({
            acknowledged: true,
            deletedCount: 0,
        })
    })

    test('server error', async () => {
        // Prepare
        let test_data = global.seed_data.books[0]

        const controller = require('../../../controllers/books')
        const err_msg = 'Test Error'
        let spy = {
            fn: jest.spyOn(controller, 'clean_input_obj').mockImplementation(() => {
                throw Error(err_msg)
            }),
        }

        // Request
        let res = await global.request
            .delete(`/api/books/${test_data.isbn}`)

        // Assert
        expect(spy.fn).toHaveBeenCalledTimes(1)

        expect(res.status).toEqual(global.constants.HTTP_STATUS.SERVER_ERROR)
        expect(res.body).toEqual({
            error: err_msg
        })
    })
})