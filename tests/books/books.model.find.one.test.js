process.env.TEST_SUITE = __filename

describe('happy paths', () => {
    describe('happy paths', () => {
        const seed_data = require('../fixtures/seed_data/books')[0]
        const test_data = require('../fixtures/test_data/books')[0]
        const test_cases = [
            [
                'record found',
                {
                    isbn: seed_data.isbn
                },
                {
                    _id: expect.any(String),
                    ...seed_data
                }
            ],
            [
                'type conversion',
                {
                    isbn: seed_data.isbn.toString()
                },
                {
                    _id: expect.any(String),
                    ...seed_data
                }
            ],
            [
                'no record found',
                {
                    isbn: test_data.isbn
                },
                {}
            ],
        ]
    
        test.each(test_cases)(
            '%s',
            async (_, query, expected_result) => {
                // Arrange
                let spy = {
                    fn: jest.spyOn(global.models.books.collection, 'findOne')
                }
    
                // Action
                let res = await global.models.books.find_one(query)
                
                // Assert
                expect(spy.fn).toHaveBeenCalledTimes(1)
                expect(res).toEqual(expected_result)
            }
        )
    })
})

describe('unhappy paths', () => {
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
            let spy = {
                fn: jest.spyOn(global.models.books.collection, 'findOne')
            }

            // Action
            let error
            try {
                await global.models.books.find_one(query)
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