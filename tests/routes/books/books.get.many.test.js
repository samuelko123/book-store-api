process.env.TEST_SUITE = __filename

describe('GET /books', () => {
    test('no filters', async () => {
        // Request
        let res = await global.request
            .get(`/api/books`)
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body.length).toEqual(global.seed_data.data.length)
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.any(String),
                    isbn: expect.any(Number),
                    name: expect.any(String),
                    author: expect.any(String),
                    price: expect.any(Number)
                })
            ])
        )
    })

    test('text filters', async () => {
        // Request
        let res = await global.request
            .get('/api/books?name=book&author=thor a')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body.length).toEqual(2)
    })

    test('numeric filters', async () => {
        // Request
        let res = await global.request
            .get('/api/books?price$gte=2&price$lte=4')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body.length).toEqual(3)
    })

    test('select one field', async () => {
        // Request
        let res = await global.request
            .get('/api/books?select=name')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body.length).toEqual(global.seed_data.data.length)
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.any(String),
                    name: expect.any(String),
                })
            ])
        )
    })

    test('sort asc', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&select=name')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body.map(x => x.name)).toEqual(['Book A', 'Book AB', 'Book AC', 'Book D', 'Book E'])
    })

    test('sort desc', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=-name&select=name')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body.map(x => x.name)).toEqual(['Book E', 'Book D', 'Book AC', 'Book AB', 'Book A'])
    })

    test('skip records', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&skip=3')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body.map(x => x.name)).toEqual(['Book D', 'Book E'])
    })

    test('skip and limit records', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&skip=3&limit=1')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body.map(x => x.name)).toEqual(['Book D'])
    })

    test('invalid skip - negative', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&skip=-3')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String)
        })
    })

    test('invalid skip - decimal', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&skip=3.1')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String)
        })
    })

    test('invalid skip - not a number', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&skip=a1')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String)
        })
    })

    test('invalid limit - negative', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&limit=-1')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String)
        })
    })

    test('invalid limit - decimal', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&limit=1.01')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String)
        })
    })

    test('invalid limit - not a number', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&limit=abc123')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String)
        })
    })

    test('invalid numeric filter', async () => {
        // Request
        let res = await global.request
            .get('/api/books?price=1') // should be price$eq=1
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String)
        })
    })

    test('complex query', async () => {
        // Request
        let res = await global.request
            .get('/api/books? PRICE$gte=1 & PRICE$lte=4 & SORT=-NAME & SKIP=1 & LIMIT=2 & SELECT=NAME AUTHOR')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual([
            {
                _id: expect.any(String),
                name: 'Book AC',
                author: 'Author C',
            },
            {
                _id: expect.any(String),
                name: 'Book AB',
                author: 'Author AB',
            },
        ])
    })
})