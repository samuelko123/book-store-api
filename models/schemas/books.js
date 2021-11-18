module.exports = {
    type: 'object',
    required: ['isbn', 'name', 'author', 'price'],
    additionalProperties: false,
    properties: {
        isbn: {
            type: 'integer',
            description: 'must be 13-digit integer',
            minimum: 1e12,
            maximum: 1e13 - 1,
        },
        name: {
            type: 'string',
        },
        author: {
            type: 'string',
        },
        price: {
            type: 'number',
            minimum: 0,
        },
    }
}