function NotFoundError(message) {
    this.name = 'NotFoundError'
    this.message = message
    this.stack = (new Error()).stack
}

NotFoundError.prototype = Object.create(Error.prototype)

module.exports = NotFoundError