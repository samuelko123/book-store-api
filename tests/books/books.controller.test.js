process.env.TEST_SUITE = __filename

describe('happy paths', () => {
    const constants = require('../../utils/constants')
    const test_cases = [
        [
            'insert_one',
            constants.HTTP_STATUS.CREATED,
        ],
        [
            'find_one',
            constants.HTTP_STATUS.OK,
        ],
        [
            'update_one',
            constants.HTTP_STATUS.OK,
        ],
        [
            'delete_one',
            constants.HTTP_STATUS.OK,
        ],
        [
            'find_many',
            constants.HTTP_STATUS.OK,
        ],
    ]

    test.each(test_cases)(
        '%s',
        async (ctrl_fn, expected_http_status) => {
            // Arrange
            let spy = {
                fn: jest
                    .spyOn(global.models.books, ctrl_fn)
                    .mockImplementation(() => { })
            }

            // Action
            await global.controllers.books[ctrl_fn](global.mock_req, global.mock_res, global.mock_next)

            // Assert
            expect(spy.fn).toHaveBeenCalledTimes(1)
            expect(global.mock_res.status).toHaveBeenCalledWith(expected_http_status)
            expect(global.mock_next).toHaveBeenCalledTimes(0)
        }
    )
})

describe('error handling', () => {
    const test_cases = [
        [
            'insert_one',
        ],
        [
            'find_one',
        ],
        [
            'update_one',
        ],
        [
            'delete_one',
        ],
        [
            'find_many',
        ],
    ]

    test.each(test_cases)(
        '%s',
        async (ctrl_fn) => {
            // Arrange
            let spy = {
                fn: jest
                    .spyOn(global.models.books, ctrl_fn)
                    .mockImplementation(() => { throw global.mock_err })
            }

            // Action
            await global.controllers.books[ctrl_fn](global.mock_req, global.mock_res, global.mock_next)

            // Assert
            expect(spy.fn).toHaveBeenCalledTimes(1)
            expect(global.mock_res.status).toHaveBeenCalledTimes(0)
            expect(global.mock_res.json).toHaveBeenCalledTimes(0)
            expect(global.mock_next).toHaveBeenCalledTimes(1)
        }
    )
})

describe('find_many query', () => {
    const test_cases = [
        [
            'blank query',
            {},
            {
                filter: {},
            },
        ],
        [
            'limit',
            {
                limit: '1',
            },
            {
                filter: {},
                limit: '1',
            },
        ],
        [
            'skip',
            {
                skip: '1',
            },
            {
                filter: {},
                skip: '1',
            },
        ],
        [
            'sort - one field',
            {
                sort: '-name'
            },
            {
                filter: {},
                sort: {
                    name: -1,
                }
            },
        ],
        [
            'sort - multi field',
            {
                sort: ['name', '-price'],
            },
            {
                filter: {},
                sort: {
                    name: 1,
                    price: -1,
                },
            },
        ],
        [
            'filter',
            {
                name$eq: 'Book A',
                price$gte: '2',
                price$lte: '5.1',
            },
            {
                filter: {
                    name: { $eq: 'Book A' },
                    price: { $gte: '2', $lte: '5.1' },
                },
            },
        ],
        [
            'altogether',
            {
                name$eq: 'Book A',
                price$gte: '2',
                price$lte: '5.1',
                sort: ['name', '-price'],
                skip: '1',
                limit: '1',
                custom_timestamp: 'hello world', // for cache busting
            },
            {
                filter: {
                    name: { $eq: 'Book A' },
                    price: { $gte: '2', $lte: '5.1' },
                },
                sort: {
                    name: 1,
                    price: -1,
                },
                limit: '1',
                skip: '1',
            },
        ],
    ]

    test.each(test_cases)(
        '%s',
        async (_, query, expected_result) => {
            // Arrange
            let req = {
                query: query
            }
            let spy = {
                fn: jest
                    .spyOn(global.models.books, 'find_many')
                    .mockImplementation((query) => query)
            }

            // Action
            await global.controllers.books.find_many(req, global.mock_res, global.mock_next)

            // Assert
            expect(spy.fn).toHaveBeenCalledTimes(1)
            expect(global.mock_res.status).toHaveBeenCalledWith(global.constants.HTTP_STATUS.OK)
            expect(global.mock_res.json).toHaveBeenCalledWith(expected_result)
            expect(global.mock_next).toHaveBeenCalledTimes(0)
        }
    )
})