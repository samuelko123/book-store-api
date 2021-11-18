const clone = require('rfdc')()
let schema = clone(require('./books'))

module.exports = {
    type: 'object',
    additionalProperties: false,
    required: ['isbn'],
    properties: {
        isbn: schema.properties.isbn
    }
}