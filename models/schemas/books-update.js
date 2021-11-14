const clone = require('rfdc')()
let schema = clone(require('./books'))

delete schema.required

module.exports = schema