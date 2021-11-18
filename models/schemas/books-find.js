const constants = require('../../utils/constants')
const book_schema = require('./books')

// filter object
let filter_props = {}
let fields = ['_id', ...Object.keys(book_schema.properties)]
for (let field of fields) {
    let props = {
        $regex: { type: 'string' },
        $options: { type: 'string' },
    }
    let operators = ['$eq', '$gt', '$gte', '$lt', '$lte', '$ne']
    for (let operator of operators) {
        if (field == '_id') {
            props[operator] = { type: 'string' }
        } else {
            props[operator] = { type: book_schema.properties[field].type }
        }
    }

    filter_props[field] = {
        type: 'object',
        additionalProperties: false,
        properties: props,
    }
}

// sort object
let sort_props = {
    _id: { type: 'string' }
}
for (let key in book_schema.properties) {
    sort_props[key] = {
        type: 'integer',
        enum: [1, -1],
    }
}

// the final schema
let schema = {
    type: 'object',
    required: ['filter'],
    additionalProperties: true,
    properties: {
        filter: {
            type: 'object',
            additionalProperties: false,
            properties: filter_props,
            default: {},
        },
        sort: {
            type: 'object',
            additionalProperties: false,
            properties: sort_props,
            default: {},
        },
        skip: {
            type: 'integer',
            minimum: 0,
            default: 0,
        },
        limit: {
            type: 'integer',
            minimum: 0,
            maximum: constants.MONGO_FIND_QUERY_LIMIT.MAX,
            default: constants.MONGO_FIND_QUERY_LIMIT.DEFAULT,
        },
    }
}

module.exports = schema