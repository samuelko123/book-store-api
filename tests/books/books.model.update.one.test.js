process.env.TEST_SUITE = __filename

describe('happy paths', () => {
    const seed_data = require('../fixtures/seed_data/books')[0]
    const test_data = require('../fixtures/test_data/books')[0]

    const test_cases = [
        [
            'record updated',
            {
                isbn: seed_data.isbn
            },
            {
                author: 'John Doe',
                price: 123,
            },
            {
                _id: expect.any(String),
                isbn: seed_data.isbn,
                name: seed_data.name,
                author: 'John Doe',
                price: 123,
            },
        ],
        [
            'type conversion',
            {
                isbn: seed_data.isbn.toString()
            },
            {
                author: 'John Doe',
                price: 123,
            },
            {
                _id: expect.any(String),
                isbn: seed_data.isbn,
                name: seed_data.name,
                author: 'John Doe',
                price: 123,
            },
        ],
        [
            'no record found',
            {
                isbn: test_data.isbn
            },
            {
                author: 'John Doe',
                price: 123,
            },
            {},
        ],
        [
            'empty doc',
            {
                isbn: seed_data.isbn
            },
            {},
            {
                _id: expect.any(String),
                ...seed_data
            },
        ],
    ]

    test.each(test_cases)(
        '%s',
        async (_, query, doc, expected_result) => {
            // Arrange
            let spy = {
                fn: jest.spyOn(global.models.books.collection, 'findOneAndUpdate')
            }

            // Action
            let res = await global.models.books.update_one(query, doc)

            // Assert
            expect(spy.fn).toHaveBeenCalledTimes(1)
            expect(res).toEqual(expected_result)
        }
    )
})

describe('unhappy paths - duplicate key', () => {
    test('duplicate key', async () => {
        // Arrange
        let seed_data = global.clone(global.seed_data.books)[0]
        let new_isbn = global.clone(global.seed_data.books)[1].isbn
        let query = {
            isbn: seed_data.isbn
        }
        let doc = {
            ...seed_data,
            isbn: new_isbn,
        }
        let spy = {
            fn: jest.spyOn(global.models.books.collection, 'findOneAndUpdate'),
        }

        // Action
        let error
        try {
            await global.models.books.update_one(query, doc)
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

describe('unhappy paths - invalid query', () => {
    const constants = require('../../utils/constants')
    const seed_data = require('../fixtures/seed_data/books')[0]
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
            'multiple properties',
            {
                isbn: seed_data.isbn,
                name: seed_data.name,
            },
            constants.MESSAGES.NO_ADDITIONAL_PROPS,
        ],
        [
            'additional property',
            {
                no_such_field: 123,
            },
            constants.MESSAGES.NO_ADDITIONAL_PROPS,
        ],
        [
            'non-id property',
            {
                name: 'Book A'
            },
            constants.MESSAGES.NO_ADDITIONAL_PROPS,
        ],
    ]

    test.each(test_cases)(
        '%s',
        async (_, query, expected_err_msg) => {
            // Arrange
            let doc = {
                name: 'Book XYZ',
                author: 'John Doe',
                price: 123
            }
            let spy = {
                fn: jest.spyOn(global.models.books.collection, 'findOneAndUpdate')
            }

            // Action
            let error
            try {
                await global.models.books.update_one(query, doc)
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
            let seed_data = global.clone(global.seed_data.books)[0]
            let query = {
                isbn: seed_data.isbn
            }
            let spy = {
                fn: jest.spyOn(global.models.books.collection, 'findOneAndUpdate'),
            }

            // Action
            let error
            try {
                await global.models.books.update_one(query, doc)
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