const Ajv = require("ajv")
const schemas = require('../models/schemas')
const { ValidationError } = require('./errors')

// initialize ajv
const ajv = new Ajv({
    removeAdditional: false,
    useDefaults: true,
    coerceTypes: true,
    allErrors: true,
    logger: false,
})

// add all schemas
for (let key in schemas) {
    let schema = schemas[key]
    ajv.addSchema(schema, key)
}

exports.check_input = function (schema_name, obj) {
    let validate = ajv.getSchema(schema_name)
    let is_valid = validate(obj)
    if (!is_valid) {
        throw new ValidationError(validate.errors, obj)
    }
}

exports.check_output = function (schema_name, obj) {
    let validate = ajv.getSchema(schema_name)
    let is_valid = validate(obj)
    if (!is_valid) {
        throw new Error(validate.errors)
    }
}