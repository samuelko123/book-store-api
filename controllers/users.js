const bcrypt = require('bcryptjs')
const { db } = require('../mongo')
const constants = require('../utils/constants')
const mixins = require('./_mixins')
const { CustomError } = require('../utils/error')

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
    this.check_schema = mixins.check_schema

    this.add_defaults_to_obj = function (obj) {
        let defaults = {
            verified: false,
            role: 'user',
            login_attempts: 0,
            locked_until: new Date(0),
            created_at: new Date(),
            updated_at: new Date(),
        }
        
        for (let field in defaults) {
            if (!(field in obj)) {
                obj[field] = defaults[field]
            }
        }
    }

    this.clean_input_obj = async function (obj) {
        this.check_schema(obj)

        if ('username' in obj ){
            if (!/^[a-z0-9]{6,}$/.test(obj.username)){
                throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, constants.MESSAGES.INVALID_USERNAME)
            }
        }
        if ('password' in obj) {
            if (!/(?=.{8,})/.test(obj.password)){
                throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, constants.MESSAGES.INVALID_PASSWORD_LENGTH)
            }

            if (!/(?=.*[a-z])/.test(obj.password)){
                throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, constants.MESSAGES.INVALID_PASSWORD_LOWERCASE)
            }

            if (!/(?=.*[A-Z])/.test(obj.password)){
                throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, constants.MESSAGES.INVALID_PASSWORD_UPPERCASE)
            }

            if (!/(?=.*[0-9])/.test(obj.password)){
                throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, constants.MESSAGES.INVALID_PASSWORD_DIGIT)
            }

            if (!/(?=.*[^A-Za-z0-9])/.test(obj.password)){
                throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, constants.MESSAGES.INVALID_PASSWORD_SPECIAL_CHAR)
            }

            obj.password = await bcrypt.hash(obj.password, constants.AUTH.SALT_WORK_FACTOR)
        }
    }

    this.clean_output_obj = function (obj) {
        if ('insertedId' in obj) {
            obj.insertedId = obj.insertedId.toString()
        }

        if ('_id' in obj) {
            obj._id = obj._id.toString()
        }

        delete obj.password
    }

    mixins.bind_all_fn(this)
}

module.exports = new UserController()