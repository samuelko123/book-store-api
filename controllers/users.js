const model = require('../models/users')
const mixins = require('./_mixins')

function UserController() {
    this.model = model
    this.id_field = 'username'
    this.create = mixins.create.bind(this)
    this.findOne = mixins.findOne.bind(this)
    this.updateOne = mixins.updateOne.bind(this)
    this.updateMany = mixins.updateMany.bind(this)
    this.deleteOne = mixins.deleteOne.bind(this)
    this.deleteMany = mixins.deleteMany.bind(this)
    this.findMany = mixins.findMany.bind(this)
    this.sanitiseQuery = mixins.sanitiseQuery.bind(this)
    this.sanitiseOutput = (data) => {
        // turn object to array for consistent treatment
        let data_is_object = false
        if (!Array.isArray(data)) {
            data = [data]
            data_is_object = true
        }

        // remove password
        data = data.map(elem => {
            elem = elem.toObject()
            elem._id = elem._id.toString()
            delete elem.password
            return elem
        })

        // turn array to object
        if (data_is_object) {
            data = data[0]
        }

        // return result
        return data
    }
}

module.exports = new UserController()