const { CustomError } = require('../utils/error')
const constants = require('../utils/constants')

exports.createOne = async function (req, res, next) {
    try {
        // query mongo database
        let data = await this.model.create(req.body)
    
        // sanitise output - e.g. remove password
        if (!!this.sanitiseOutput) {
            data = this.sanitiseOutput(data)
        }

        // return result
        res.status(constants.HTTP_STATUS.CREATED).json(data)
    } catch (err) {
        next(err)
    }

}

exports.findOne = async function (req, res, next) {
    try {
        // query mongo database
        let data = await this.model
            .findOne({ [this.id_field]: req.params[this.id_field] })
            .orFail()

        // return result
        res.json(data)
    } catch (err) {
        next(err)
    }
}

exports.findMany = async function (req, res, next) {
    try {
        // build query
        let mongo_query = {}
        for (let field in req.query.filter) {
            if (field.includes('.')) {
                // convert query operator (e.g. gte, lte)
                let [name, operator] = field.split('.')
                let filter = { ['$' + operator]: req.query.filter[field] }

                if (name in mongo_query) {
                    // append operator to filter
                    Object.assign(mongo_query[name], filter)
                } else {
                    // create filter
                    mongo_query[name] = filter
                }
            } else {
                // convert text value to regex for keyword search (case-insensitive)
                mongo_query[field] = { $regex: req.query.filter[field], $options: "i" }
            }
        }

        // query mongo database
        let data = await this.model
            .find(mongo_query)
            .sort(!!req.query.sort ? req.query.sort.join(' ') : '')
            .skip(req.query.skip || 0)
            .limit(Math.min(req.query.limit, constants.GET_QUERY_LIMIT.MAX))

        // return result
        res.json(data)
    } catch (err) {
        next(err)
    }
}

exports.updateOne = async function (req, res, next) {
    try {
        // validate
        for (let field in req.body) {
            if (this.read_only_fields.includes(field)) {
                throw new CustomError(400, `immutable field - '${field}`)
            }
        }

        // query mongo database
        let data = await this.model
            .findOneAndUpdate({ [this.id_field]: req.params[this.id_field] }, req.body, { new: true })
            .orFail()

        // return reuslt
        res.json(data)
    } catch (err) {
        next(err)
    }
}

exports.deleteOne = async function (req, res, next) {
    try {
        // query mongo database
        let data = await this.model
            .findOneAndDelete({ [this.id_field]: req.params[this.id_field] })
            .orFail()

        // sanitise output - e.g. remove password
        if (!!this.sanitiseOutput) {
            data = this.sanitiseOutput(data)
        }

        // return result
        res.json(data)
    } catch (err) {
        next(err)
    }
}