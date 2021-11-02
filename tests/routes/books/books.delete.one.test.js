process.env.TEST_SUITE = __filename

describe('DELETE /books/:isbn', () => {
    test('success - return deleted record', async () => {
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
            _id: expect.any(String),
            isbn: test_data.isbn,
            name: test_data.name,
            author: test_data.author,
            price: test_data.price
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
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NOT_FOUND)
        expect(res.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.NO_DOCUMENT_FOUND)
        })
    })
})