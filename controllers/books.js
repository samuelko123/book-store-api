const mongodb = require('mongodb')
const { db } = require('../mongo')
const constants = require('../utils/constants')
const { CustomError } = require('../utils/error')
const mixins = require('./_mixins')

function BookController() {
    this.collection = db.collection('books')
    this.schema = require('../schemas/books')
    this.id_field = 'isbn'

    this.clean_input_arr = mixins.clean_input_arr
    this.clean_output_arr = mixins.clean_output_arr
    this.insertOne = mixins.insertOne
    this.findOne = mixins.findOne
    this.findMany = mixins.findMany
    this.updateOne = mixins.updateOne
    this.deleteOne = mixins.deleteOne
    this.bind_all_fn = mixins.bind_all_fn

    this.clean_input_obj = function (doc) {
        for (let key in doc) {
            if (!(key in this.schema.properties)) {
                throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, `not in schema: ${key}`)
            }
        }

        if ('isbn' in doc) {
            doc.isbn = mongodb.Long.fromNumber(doc.isbn)
        }

        if ('price' in doc) {
            doc.price = mongodb.Double(doc.price)
        }
    }

    this.clean_output_obj = function (doc) {
        if ('insertedId' in doc) {
            doc.insertedId = doc.insertedId.toString()
        }

        if ('_id' in doc) {
            doc._id = doc._id.toString()
        }

        if ('price' in doc) {
            doc.price = doc.price.valueOf()
        }
    }

    mixins.bind_all_fn(this)
}

module.exports = new BookController()