process.env.TEST_SUITE = __filename

describe('POST /books', () => {
    test('happy path', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.books)
        test_data = test_data.map(elem => {
            elem.isbn += 100
            return elem
        })

        // Request
        let res1 = await global.request
            .post('/api/books')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.CREATED)
        expect(res1.body.length).toEqual(test_data.length)

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(test_data.length + global.seed_data.books.length)
    })

    test('duplicate key', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.books)
        test_data.push(global.seed_data.books[0])
        test_data.push(global.seed_data.books[2])

        // Request
        let res1 = await global.request
            .post('/api/books')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.books.length) // expect no record created
    })

    test('invalid field', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.books)
        test_data.push({
            no_such_field: 1112223334445, // expect "isbn"
            name: 'Book ABC',
            author: 'Author ABC',
            price: 9.99,
        })

        // Request
        let res1 = await global.request
            .post('/api/books')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.books.length) // expect no record created
    })

    test('invalid value', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.books)
        test_data.push({
            isbn: 111, // expect 13-digit integer
            name: 'Book ABC',
            author: 'Author ABC',
            price: 9.99,
        })

        // Request
        let res1 = await global.request
            .post('/api/books')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.books.length) // expect no record created
    })
})