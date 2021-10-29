process.env.TEST_SUITE = __filename

describe('PATCH /books/:isbn', () => {
    test('success - return updated record', async () => {
        // Prepare
        let isbn = 1234567890121
        let test_data = {
            isbn: 1111122222333,
            name: 'Book XYZ',
            author: 'John Doe',
        }

        // Request
        let res = await global.request
            .patch(`/api/books/${isbn}`)
            .set('Accept', 'application/json')
            .send(test_data)

        // Assert
        console.log(res.body)
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            _id: expect.any(String),
            isbn: test_data.isbn,
            name: test_data.name,
            author: test_data.author,
            price: 1
        })
    })

    test('invalid id', async () => {
        // Prepare
        let isbn = 'invalid isbn'
        let test_data = {
            name: 'Book XYZ',
            author: 'John Doe',
        }

        // Request
        let res = await global.request
            .patch(`/api/books/${isbn}`)
            .set('Accept', 'application/json')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String),
        })
    })

    test('id not found', async () => {
        // Prepare
        let isbn = 5554443332221
        let test_data = {
            name: 'Book XYZ',
            author: 'John Doe',
        }

        // Request
        let res = await global.request
            .patch(`/api/books/${isbn}`)
            .set('Accept', 'application/json')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NOT_FOUND)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String),
        })
    })

    test('invalid field', async () => {
        // Prepare
        let isbn = 1234567890121
        let test_data = {
            invalid_field: 'Book XYZ',
            author: 'John Doe',
        }

        // Request
        let res = await global.request
            .patch(`/api/books/${isbn}`)
            .set('Accept', 'application/json')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String),
        })
    })

    test('invalid change - duplicate key', async () => {
        // Prepare
        let isbn = 1234567890121
        let test_data = {
            isbn: 1234567890122, // isbn exists
            name: 'Book XYZ',
            author: 'John Doe',
        }

        // Request
        let res = await global.request
            .patch(`/api/books/${isbn}`)
            .set('Accept', 'application/json')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String),
        })
    })

    test('invalid change - mongo _id field', async () => {
        // Prepare
        let isbn = 1234567890121
        let test_data = {
            _id: '616e3e2f5df30eb71e3b78d9', // mongo _id, not updateable
            name: 'Book XYZ',
            author: 'John Doe',
        }

        // Request
        let res = await global.request
            .patch(`/api/books/${isbn}`)
            .set('Accept', 'application/json')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String),
        })
    })
})