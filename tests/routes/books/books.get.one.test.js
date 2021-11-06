process.env.TEST_SUITE = __filename

describe('GET /books/:isbn', () => {
    test('happy path', async () => {
        // Prepare
        let test_data = global.seed_data.books[0]

        // Request
        let res = await global.request
            .get(`/api/books/${test_data.isbn}`)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body).toEqual({
            _id: expect.any(String),
            isbn: test_data.isbn,
            name: test_data.name,
            author: test_data.author,
            price: test_data.price
        })
    })

    test('non-existent id', async () => {
        // Request
        let res = await global.request
            .get('/api/books/2224567890123')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NO_CONTENT)
        expect(res.body).toEqual({})
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
            .get(`/api/books/${test_data.isbn}`)

        // Assert
        expect(spy.fn).toHaveBeenCalledTimes(1)

        expect(res.status).toEqual(global.constants.HTTP_STATUS.SERVER_ERROR)
        expect(res.body).toEqual({
            error: err_msg
        })
    })
})