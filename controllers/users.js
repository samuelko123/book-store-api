const model = require('../models/users')
const mixins = require('./_mixins')

function UserController() {
    this.model = model
    this.id_field = 'username'
    this.read_only_fields = ['created_at', 'updated_at', 'verified', 'login_attempts']
    this.createOne = mixins.createOne.bind(this)
    this.findOne = mixins.findOne.bind(this)
    this.findMany = mixins.findMany.bind(this)
    this.updateOne = mixins.updateOne.bind(this)
    this.deleteOne = mixins.deleteOne.bind(this)
    this.sanitiseOutput = (data) => {
        // remove password
        data = data.toObject()
        data._id = data._id.toString()
        delete data.password

        // return result
        return data
    }
}

module.exports = new UserController()