const clone = require('rfdc')()

let schema = clone(require('./books'))
schema.required.push('_id')
schema.properties._id = {
    type: 'string'
}

schema = {
    type: 'object',
    oneOf: [
        schema,
        {
            type: 'object',
            additionalProperties: false,
        },
    ]
}

module.exports = schema