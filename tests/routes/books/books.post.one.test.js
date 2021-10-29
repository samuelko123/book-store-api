process.env.TEST_SUITE = __filename

describe('POST /books', () => {
    test('successful - return created record', async () => {
        // Prepare
        let test_data = {
            isbn: 1112223334445,
            name: 'Book ABC',
            author: 'Author ABC',
            price: 9.99,
        }

        // Request
        let res = await global.request
            .post('/api/books')
            .set('Accept', 'application/json')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.CREATED)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            _id: expect.any(String),
            isbn: test_data.isbn,
            name: test_data.name,
            author: test_data.author,
            price: test_data.price
        })
    })

    test('duplicate key', async () => {
        // Prepare
        let test_data = {
            isbn: 1112223334445,
            name: 'Book ABC',
            author: 'Author ABC',
            price: 9.99,
        }

        // Request
        let res1 = await global.request
            .post('/api/books')
            .set('Accept', 'application/json')
            .send(test_data)
        
        let res2 = await global.request
            .post('/api/books')
            .set('Accept', 'application/json')
            .send(test_data)

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.CREATED)
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body).toEqual({
            error: expect.any(String)
        })
    })

    test('invalid field', async () => {
        // Prepare
        let test_data = {
            i: 1112223334445, // expect "isbn"
            name: 'Book ABC',
            author: 'Author ABC',
            price: 9.99,
        }

        // Request
        let res = await global.request
            .post('/api/books')
            .set('Accept', 'application/json')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String)
        })
    })

    test('invalid value', async () => {
        // Prepare
        let test_data = {
            isbn: 1112223334445,
            name: 'Book ABC',
            author: 'Author ABC',
            price: 0, // invalid price
        }

        // Request
        let res = await global.request
            .post('/api/books')
            .set('Accept', 'application/json')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String)
        })
    })

    test('missing required field', async () => {
        // Prepare
        let test_data = {
            // missing isbn
            name: 'Book ABC',
            author: 'Author ABC',
            price: 9.99,
        }

        // Request
        let res = await global.request
            .post('/api/books')
            .set('Accept', 'application/json')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String)
        })
    })

    test('extra field - expected to throw', async () => {
        // Prepare
        let test_data = {
            no_such_field: 'abc',
            isbn: 9780747532743,
            name: "Harry Potter And The Philosopher's Stone",
            author: 'J. K. Rowling',
            price: 9.99,
        }

        // Request
        let res = await global.request
            .post('/api/books')
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