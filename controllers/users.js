const { db } = require('../mongo')
const constants = require('../utils/constants')
const { CustomError } = require('../utils/error')
const mixins = require('./_mixins')

function UserController() {
    this.collection = db.collection('users')
    this.schema = require('../schemas/users')
    this.id_field = 'username'

    this.clean_input_arr = mixins.clean_input_arr
    this.clean_output_arr = mixins.clean_output_arr
    this.add_defaults_to_arr = mixins.add_defaults_to_arr
    this.insertOne = mixins.insertOne
    this.findOne = mixins.findOne
    this.findMany = mixins.findMany
    this.updateOne = mixins.updateOne
    this.deleteOne = mixins.deleteOne

    this.add_defaults_to_obj = function (doc) {
        let defaults = {
            verified: false,
            role: 'user',
            login_attempts: 0,
            locked_until: new Date(0),
            created_at: new Date(),
            updated_at: new Date(),
        }
        
        for (let field in defaults) {
            if (!(field in doc)) {
                doc[field] = defaults[field]
            }
        }
    }

    this.clean_input_obj = function (doc) {
        for (let key in doc) {
            if (!(key in this.schema.properties)) {
                throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, `not in schema: ${key}`)
            }
        }
    }

    this.clean_output_obj = function (doc) {
        if ('insertedId' in doc) {
            doc.insertedId = doc.insertedId.toString()
        }

        if ('_id' in doc) {
            doc._id = doc._id.toString()
        }

        delete doc.password
    }

    mixins.bind_all_fn(this)
}

module.exports = new UserController()