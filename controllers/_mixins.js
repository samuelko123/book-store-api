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
        let mongo_select = req.query.select || ''
        let mongo_sort = req.query.sort || ''
        let mongo_skip = req.query.skip || 0
        let mongo_limit = Math.min(req.query.limit || 25, 100)

        let mongo_query = {}
        for (let field in req.query) {
            if (['select', 'sort', 'skip', 'limit'].includes(field)) {
                // do nothing
            }
            else if (field.includes('$')) {
                // convert to mongo query operator (e.g. gte, lte)
                let [name, operator] = field.split('$')
                let filter = { ['$' + operator]: req.query[field] }
                if (name in mongo_query) {
                    // append filter for field
                    Object.assign(mongo_query[name], filter)
                } else {
                    // create filter for field
                    mongo_query[name] = filter
                }
            } else {
                // convert text value to regex for keyword search (case-insensitive)
                mongo_query[field] = { $regex: req.query[field], $options: "i" }
            }
        }

        // query mongo database
        let data = await this.model
            .find(mongo_query)
            .sort(mongo_sort)
            .skip(mongo_skip)
            .limit(mongo_limit)
            .select(mongo_select)

        // return result
        res.json(data)
    } catch (err) {
        next(err)
    }
}

exports.updateOne = async function (req, res, next) {
    try {
        // validate
        if('created_at' in req.body){
            throw new CustomError(400, "immutable field - 'created_at'")
        }

        if('updated_at' in req.body){
            throw new CustomError(400, "immutable field - 'updated_at'")
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

exports.sanitiseQuery = async function (req, res, next) {
    // trim and lowercase all the fields
    for (let field in req.query) {
        req.query[field] = req.query[field].toLowerCase().trim()

        let sanitised = field.toLowerCase().trim()
        if (sanitised !== field) {
            req.query[sanitised] = req.query[field]
            delete req.query[field]
        }
    }

    // mongoose will ignore "limit" if it's invalid
    if (!!req.query.limit) {
        if (!/^[0-9]+$/.test(req.query.limit)) {
            next(new CustomError(constants.HTTP_STATUS.BAD_REQUEST, 'query "limit" must be positive integer'))
        }
        req.query.limit = parseInt(req.query.limit)
    }

    // mongoose will ignore "skip" if it's invalid
    if (!!req.query.skip) {
        if (!/^[0-9]+$/.test(req.query.skip)) {
            next(new CustomError(constants.HTTP_STATUS.BAD_REQUEST, 'query "skip" must be positive integer'))
        }
        req.query.skip = parseInt(req.query.skip)
    }

    // go to next middleware
    next()
}