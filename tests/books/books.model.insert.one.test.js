process.env.TEST_SUITE = __filename

describe('happy paths', () => {
    const test_data = require('../fixtures/test_data/books')[0]
    const test_cases = [
        [
            'record inserted',
            test_data,
            {
                _id: expect.any(String),
                ...test_data
            },
        ],
        [
            'type conversion',
            {
                ...test_data,
                isbn: test_data.isbn.toString()
            },
            {
                _id: expect.any(String),
                ...test_data
            },
        ],
    ]

    test.each(test_cases)(
        '%s',
        async (_, doc, expected_result) => {
            // Arrange
            let spy = {
                fn: jest.spyOn(global.models.books.collection, 'insertOne'),
            }

            // Action
            let res = await global.models.books.insert_one(doc)

            // Assert
            expect(spy.fn).toHaveBeenCalledTimes(1)
            expect(res).toEqual(expected_result)
        }
    )
})

describe('unhappy paths - duplicate key', () => {
    test('duplicate key', async () => {
        // Arrange
        let doc = global.clone(global.seed_data.books)[0]
        let spy = {
            fn: jest.spyOn(global.models.books.collection, 'insertOne'),
        }

        // Action
        let error
        try {
            await global.models.books.insert_one(doc)
        } catch (e) {
            error = e
        }

        // Assert
        expect(spy.fn).toHaveBeenCalledTimes(1)
        expect(error.message).toEqual(
            expect.stringContaining(global.constants.MESSAGES.DUPLICATE_KEY)
        )
    })
})

describe('unhappy paths - invalid doc', () => {
    const constants = require('../../utils/constants')
    const test_data = require('../fixtures/test_data/books')[0]
    const test_cases = [
        [
            'non-object',
            false,
            constants.MESSAGES.MUST_BE_OBJ,
        ],
        [
            'empty object',
            {},
            constants.MESSAGES.MUST_HAVE_REQUIRED,
        ],
        [
            'additional property',
            {
                no_such_field: 123,
                ...test_data,
            },
            constants.MESSAGES.NO_ADDITIONAL_PROPS,
        ],
        [
            'invalid isbn',
            {
                ...test_data,
                isbn: 'not a number',
            },
            constants.MESSAGES.MUST_BE_INT,
        ],
        [
            'too-small isbn',
            {
                ...test_data,
                isbn: 123,
            },
            constants.MESSAGES.TOO_SMALL,
        ],
        [
            'too-large isbn',
            {
                ...test_data,
                isbn: 1e16,
            },
            constants.MESSAGES.TOO_LARGE,
        ],
        [
            'invalid price',
            {
                ...test_data,
                price: 'not a number',
            },
            constants.MESSAGES.MUST_BE_NUM,
        ],
        [
            'negative price',
            {
                ...test_data,
                price: -0.1,
            },
            constants.MESSAGES.TOO_SMALL,
        ],
    ]

    test.each(test_cases)(
        '%s',
        async (_, doc, expected_err_msg) => {
            // Arrange
            let spy = {
                fn: jest.spyOn(global.models.books.collection, 'insertOne'),
            }

            // Action
            let error
            try {
                await global.models.books.insert_one(doc)
            } catch (e) {
                error = e
            }

            // Assert
            expect(spy.fn).toHaveBeenCalledTimes(0)
            expect(error.message).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        message: expect.stringContaining(expected_err_msg)
                    })
                ])
            )
        }
    )
})