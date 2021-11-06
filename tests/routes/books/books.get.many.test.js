process.env.TEST_SUITE = __filename

describe('GET /books', () => {
    test('blank query', async () => {
        // Request
        let res = await global.request
            .get(`/api/books`)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body.length).toEqual(global.seed_data.books.length)
        expect(res.body).toEqual(
            expect.arrayContaining([{
                _id: expect.any(String),
                isbn: expect.any(Number),
                name: expect.any(String),
                author: expect.any(String),
                price: expect.any(Number)
            }])
        )
    })

    test('no records found', async () => {
        // Request
        let res = await global.request
            .get(`/api/books?name=no_such_book`)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NO_CONTENT)
        expect(res.body).toEqual({})
    })

    test('limit - default and max', async () => {
        // Prepare
        let extra_data = Array.from(Array(120).keys())
        extra_data = extra_data.map((_, index) => {
            return {
                isbn: 1000000000000 + index,
                name: 'Book ABC',
                author: 'Author ABC',
                price: 100
            }
        })
        require('../../../controllers/books').clean_input_arr(extra_data)

        const { db } = require('../../../mongo')
        await db.collection('books').insertMany(extra_data)

        // Request
        let res1 = await global.request
            .get(`/api/books`)

        let res2 = await global.request
            .get(`/api/books?limit=200`)

        // Assert default limit
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.body.length).toEqual(global.constants.GET_QUERY_LIMIT.DEFAULT)

        // Assert default limit
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.constants.GET_QUERY_LIMIT.MAX)
    })

    test('text filters', async () => {
        // Request
        let res = await global.request
            .get('/api/books?name=book&author=thor a')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body.length).toEqual(1)
    })

    test('numeric filters', async () => {
        // Request
        let res = await global.request
            .get('/api/books?price.gte=2&price.lte=4')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body.length).toEqual(3)
    })

    test('sort', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=-name&sort=author')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body.map(x => x.name)).toEqual(['Book E', 'Book C', 'Book C', 'Book A', 'Book A'])
        expect(res.body.map(x => x.author)).toEqual(['Author A', 'Author C', 'Author D', 'Author B', 'Author E'])
    })

    test('skip records', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&skip=3')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body.map(x => x.name)).toEqual(['Book C', 'Book E'])
    })

    test('limit records', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&skip=3&limit=1')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body.map(x => x.name)).toEqual(['Book C'])
    })

    test('complex query', async () => {
        // Request
        let res = await global.request
            .get('/api/books?price.gte=1&price.lte=4&sort=-name&sort=price&skip=1&limit=2')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body).toEqual([
            {
                _id: expect.any(String),
                isbn: 1234567890124,
                name: 'Book C',
                author: 'Author D',
                price: 4,
            },
            {
                _id: expect.any(String),
                isbn: 1234567890121,
                name: 'Book A',
                author: 'Author E',
                price: 1,
            },
        ])
    })

    test('invalid skip - negative', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&skip=-3')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.SHOULD_BE_NON_NEGATIVE)
        })
    })

    test('invalid skip - decimal', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&skip=3.1')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.SHOULD_BE_INTEGER)
        })
    })

    test('invalid skip - not a number', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&skip=a1')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.SHOULD_BE_INTEGER)
        })
    })

    test('invalid limit - negative', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&limit=-1')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.SHOULD_BE_NON_NEGATIVE)
        })
    })

    test('invalid limit - decimal', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&limit=1.01')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.SHOULD_BE_INTEGER)
        })
    })

    test('invalid limit - not a number', async () => {
        // Request
        let res = await global.request
            .get('/api/books?sort=name&limit=abc123')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.SHOULD_BE_INTEGER)
        })
    })

    test('invalid field', async () => {
        // Request
        let res = await global.request
            .get('/api/books?no_such_field=1')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.UNKNOWN_QUERY_PARAMETER)
        })
    })

    test('server error', async () => {
        // Prepare
        const controller = require('../../../controllers/books')
        const err_msg = 'Test Error'
        let spy = {
            fn: jest.spyOn(controller, 'clean_output_arr').mockImplementation(() => {
                throw Error(err_msg)
            }),
        }

        // Request
        let res = await global.request
            .get('/api/books')

        // Assert
        expect(spy.fn).toHaveBeenCalledTimes(1)

        expect(res.status).toEqual(global.constants.HTTP_STATUS.SERVER_ERROR)
        expect(res.body).toEqual({
            error: err_msg
        })
    })
})