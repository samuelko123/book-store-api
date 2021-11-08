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
    this.check_schema = mixins.check_schema

    this.clean_input_obj = async function (obj) {
        this.check_schema(obj)

        if ('isbn' in obj) {
            obj.isbn = mongodb.Long.fromNumber(obj.isbn)
        }

        if ('price' in obj) {
            if (isNaN(obj.price) || obj.price < 0){
                throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, `${constants.MESSAGES.EXPECT_POS_NUM}: price`)
            }

            obj.price = mongodb.Double(obj.price)
        }
    }

    this.clean_output_obj = function (obj) {
        if ('insertedId' in obj) {
            obj.insertedId = obj.insertedId.toString()
        }

        if ('_id' in obj) {
            obj._id = obj._id.toString()
        }

        if ('price' in obj) {
            obj.price = obj.price.valueOf()
        }
    }

    mixins.bind_all_fn(this)
}

module.exports = new BookController()