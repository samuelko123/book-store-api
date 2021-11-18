process.env.TEST_SUITE = __filename

const validator = require('../../utils/validator')
const test_data = require('../fixtures/test_data/books')

describe('check_output', () => {
    test('valid', async () => {
        // Prepare
        let data = test_data[0]

        // Action
        let action = () => {
            validator.check_output('books', data)
        }

        // Assert
        expect(action).not.toThrow()
    })

    test('invalid', async () => {
        // Prepare
        let data = {
            invalid_field: 'invalid value'
        }

        // Action
        let action = () => {
            validator.check_output('books', data)
        }

        // Assert
        expect(action).toThrow()
    })
})