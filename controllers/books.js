const model = require('../models/books')
const mixins = require('./_mixins')

function BookController() {
    this.model = model
    this.id_field = 'isbn'
    this.create = mixins.create.bind(this)
    this.findOne = mixins.findOne.bind(this)
    this.updateOne = mixins.updateOne.bind(this)
    this.deleteOne = mixins.deleteOne.bind(this)
    this.deleteMany = mixins.deleteMany.bind(this)
    this.findMany = mixins.findMany.bind(this)
    this.sanitiseQuery = mixins.sanitiseQuery.bind(this)
}

module.exports = new BookController()