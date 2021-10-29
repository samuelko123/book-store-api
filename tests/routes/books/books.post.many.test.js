process.env.TEST_SUITE = __filename

describe('POST /books', () => {
    test('happy path', async () => {
        // Prepare
        let test_data = [].concat(global.seed_data.data)
        test_data = test_data.map(elem => {
            elem.isbn += 100
            return elem
        })

        // Request
        let res1 = await global.request
            .post('/api/books')
            .set('Accept', 'application/json')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.CREATED)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body.length).toEqual(5)

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(10)
    })

    test('duplicate key', async () => {
        // Prepare
        let test_data = [].concat(global.seed_data.data)
        test_data.push({
            isbn: 1234567890121, // duplicate key
            name: 'Book ABC',
            author: 'Author ABC',
            price: 9.99,
        })

        test_data.push({
            isbn: 1234567890122, // duplicate key
            name: 'Book ABC',
            author: 'Author ABC',
            price: 9.99,
        })

        // Request
        let res1 = await global.request
            .post('/api/books')
            .set('Accept', 'application/json')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(global.seed_data.data.length) // expect no record created
    })

    test('invalid field', async () => {
        // Prepare
        let test_data = [].concat(global.seed_data.data)
        test_data.push({
            no_such_field: 1112223334445, // expect "isbn"
            name: 'Book ABC',
            author: 'Author ABC',
            price: 9.99,
        })

        // Request
        let res1 = await global.request
            .post('/api/books')
            .set('Accept', 'application/json')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(global.seed_data.data.length) // expect no record created
    })

    test('invalid value', async () => {
        // Prepare
        let test_data = [].concat(global.seed_data.data)
        test_data.push({
            isbn: 111, // expect 13-digit integer
            name: 'Book ABC',
            author: 'Author ABC',
            price: 9.99,
        })

        // Request
        let res1 = await global.request
            .post('/api/books')
            .set('Accept', 'application/json')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(global.seed_data.data.length) // expect no record created
    })
})