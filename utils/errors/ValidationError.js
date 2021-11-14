function ValidationError(message, obj) {
    this.name = 'ValidationError'
    this.message = message
    this.stack = (new Error()).stack
    this.input_object = obj
}

ValidationError.prototype = Object.create(Error.prototype)

module.exports = ValidationError