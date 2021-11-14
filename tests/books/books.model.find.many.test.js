process.env.TEST_SUITE = __filename

describe('happy paths', () => {
    const seed_data = require('../fixtures/seed_data/books')
    const clone = require('rfdc')()
    const test_cases = [
        [
            'blank query',
            {},
            clone(seed_data)
                .map(doc => {
                    doc._id = expect.any(String)
                    return doc
                })
        ],
        [
            'filter',
            {
                filter: {
                    name: { $eq: 'Book A' }
                },
            },
            clone(seed_data)
                .filter(doc => doc.name == 'Book A')
                .map(doc => {
                    doc._id = expect.any(String)
                    return doc
                })
        ],
        [
            'filter - no record found',
            {
                filter: {
                    name: { $eq: 'no such name' }
                },
            },
            []
        ],
        [
            'sort',
            {
                sort: {
                    price: -1
                },
            },
            clone(seed_data)
                .sort((a, b) => b.price - a.price)
                .map(doc => {
                    doc._id = expect.any(String)
                    return doc
                })
        ],
        [
            'skip',
            {
                skip: 3
            },
            clone(seed_data)
                .slice(3, seed_data.length)
                .map(doc => {
                    doc._id = expect.any(String)
                    return doc
                })
        ],
        [
            'limit',
            {
                limit: 3
            },
            clone(seed_data)
                .slice(0, 3)
                .map(doc => {
                    doc._id = expect.any(String)
                    return doc
                })
        ],
    ]

    test.each(test_cases)(
        '%s',
        async (_, query, expected_result) => {
            // Arrange
            let spy = {
                check_input: jest.spyOn(global.validator, 'check_input'),
                collection_find: jest.spyOn(global.models.books.collection, 'find'),
            }

            // Action
            let res = await global.models.books.find_many(query)

            // Assert
            expect(spy.check_input).toHaveBeenCalledTimes(1)
            expect(spy.collection_find).toHaveBeenCalledTimes(1)
            expect(res).toEqual(expected_result)
        })

    test('default query', async () => {
        // Arrange
        let spy = {
            check_input: jest.spyOn(global.validator, 'check_input'),
            collection_find: jest.spyOn(global.models.books.collection, 'find'),
        }
        let query = {}

        // Action
        await global.models.books.find_many(query)

        // Assert
        expect(spy.check_input).toHaveBeenCalledTimes(1)
        expect(spy.collection_find).toHaveBeenCalledTimes(1)
        expect(query).toEqual({
            filter: {},
            sort: {},
            skip: 0,
            limit: global.constants.MONGO_FIND_QUERY_LIMIT.DEFAULT,
        })
    })
})

describe('unhappy paths - invalid query', () => {
    const constants = require('../../utils/constants')
    const test_cases = [
        [
            'non-obj filter',
            {
                filter: 'abc',
            },
            constants.MESSAGES.MUST_BE_OBJ,
        ],
        [
            'invalid filter field',
            {
                filter: {
                    no_such_field: { $eq: 'Book A' }
                },
            },
            constants.MESSAGES.NO_ADDITIONAL_PROPS,
        ],
        [
            'invalid filter operator',
            {
                filter: {
                    name: {
                        $no_such_operator: 'Book A',
                    },
                },
            },
            constants.MESSAGES.NO_ADDITIONAL_PROPS,
        ],
        [
            'invalid sort',
            {
                sort: 'abc',
            },
            constants.MESSAGES.MUST_BE_OBJ,
        ],
        [
            'invalid sort field',
            {
                sort: {
                    no_such_field: 1,
                },
            },
            constants.MESSAGES.NO_ADDITIONAL_PROPS,
        ],
        [
            'invalid sort value',
            {
                sort: {
                    name: 2,
                },
            },
            constants.MESSAGES.MUST_BE_ALLOWED_VAL,
        ],
        [
            'invalid skip',
            {
                skip: 'abc',
            },
            constants.MESSAGES.MUST_BE_INT,
        ],
        [
            'invalid skip value',
            {
                skip: -1,
            },
            constants.MESSAGES.TOO_SMALL,
        ],
        [
            'invalid limit',
            {
                limit: 'abc',
            },
            constants.MESSAGES.MUST_BE_INT,
        ],
        [
            'too-small limit',
            {
                limit: -1,
            },
            constants.MESSAGES.TOO_SMALL,
        ],
        [
            'too-large limit',
            {
                limit: constants.MONGO_FIND_QUERY_LIMIT.MAX + 1,
            },
            constants.MESSAGES.TOO_LARGE,
        ],
    ]

    test.each(test_cases)(
        '%s',
        async (_, query, expected_err_msg) => {
            // Arrange
            let spy = {
                check_input: jest.spyOn(global.validator, 'check_input'),
                collection_find: jest.spyOn(global.models.books.collection, 'find'),
            }

            // Action
            let error
            try {
                await global.models.books.find_many(query)
            } catch (e) {
                error = e
            }
            
            // Assert
            expect(spy.check_input).toHaveBeenCalledTimes(1)
            expect(spy.collection_find).toHaveBeenCalledTimes(0)
            expect(error.message).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        message: expect.stringContaining(expected_err_msg)
                    })
                ])
            )
        })
})