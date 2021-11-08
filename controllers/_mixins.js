const mongodb = require('mongodb')
const constants = require('../utils/constants')
const { CustomError } = require('../utils/error')

exports.clean_output_arr = function (arr) {
    for (let doc of arr) {
        this.clean_output_obj(doc)
    }
}

exports.clean_input_arr = async function (arr) {
    for (let doc of arr) {
        await this.clean_input_obj(doc)
    }
}

exports.add_defaults_to_arr = function (arr) {
    for (let doc of arr) {
        this.add_defaults_to_obj(doc)
    }
}

exports.bind_all_fn = function (obj) {
    for (let key in obj) {
        if (typeof obj[key] == 'function') {
            obj[key] = obj[key].bind(obj)
        }
    }
}

exports.check_schema = function (obj){
    for (let key in obj) {
        if (!(key in this.schema.properties)) {
            throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, `${constants.MESSAGES.UNKNOWN_PROP}: ${key}`)
        }
    }
}

exports.insertOne = async function (req, res, next) {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new CustomError(constants.HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE, constants.MESSAGES.EXPECT_REQ_BODY)
        }

        for (let field of this.schema.required) {
            if (!(field in req.body)) {
                throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, `${constants.MESSAGES.MISSING_REQUIRED}: ${field}`)
            }
        }

        await this.clean_input_obj(req.body)
        if (!!this.add_defaults_to_obj) {
            this.add_defaults_to_obj(req.body)
        }
        let doc = await this.collection.insertOne(req.body)
        this.clean_output_obj(doc)
        res.status(constants.HTTP_STATUS.CREATED).json(doc)
    } catch (err) {
        next(err)
    }
}

exports.findOne = async function (req, res, next) {
    try {
        let query = { [this.id_field]: req.params[this.id_field] }
        await this.clean_input_obj(query)
        let data = await this.collection.findOne(query)

        if (!!data) {
            this.clean_output_obj(data)
            res.json(data)
        } else {
            res.sendStatus(constants.HTTP_STATUS.NO_CONTENT)
        }

    } catch (err) {
        next(err)
    }
}

exports.findMany = async function (req, res, next) {
    try {
        // limit
        let limit = req.query.limit || constants.GET_QUERY_LIMIT.DEFAULT
        if (!/^[0-9]{1,}$/.test(limit)) {
            throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, `${constants.MESSAGES.EXPECT_POS_INT}: limit`)
        }
        limit = Math.min(parseInt(limit), constants.GET_QUERY_LIMIT.MAX)
        delete req.query.limit

        // skip
        let skip = req.query.skip || 0
        if (!/^[0-9]{1,}$/.test(skip)) {
            throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, `${constants.MESSAGES.EXPECT_POS_INT}: skip`)
        }
        skip = parseInt(skip)
        delete req.query.skip

        // sort query
        let sort_query = {}
        if (Array.isArray(req.query.sort)) {
            for (let field of req.query.sort) {
                let value = 1
                if (field[0] == '-') {
                    field = field.substr(1)
                    value = -1
                }

                sort_query[field] = value
            }
        }

        delete req.query.sort

        // filter query
        let filter_query = {}
        for (let field in req.query) {
            if (field.includes('.')) {
                // convert query operator (e.g. gte, lte)
                let [name, operator] = field.split('.')
                let value = req.query[field]

                // throw error for unknown parameter
                if (!(name in this.schema.properties)) {
                    throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, `${constants.MESSAGES.UNKNOWN_QUERY_PARAM}: ${field}`)
                }

                // convert date to bson type for mongo
                if (this.schema.properties[name].bsonType == 'date') {
                    value = new Date(value)
                }

                // convert number to double
                if (this.schema.properties[name].bsonType == 'double') {
                    value = mongodb.Double(value)
                }

                // assign to filter query
                let filter = { ['$' + operator]: value }
                if (name in filter_query) {
                    // append operator to filter
                    Object.assign(filter_query[name], filter)
                } else {
                    // create filter
                    filter_query[name] = filter
                }
            } else {
                // throw error for unknown parameter
                if (!(field in this.schema.properties)) {
                    throw new CustomError(constants.HTTP_STATUS.BAD_REQUEST, `${constants.MESSAGES.UNKNOWN_QUERY_PARAM}: ${field}`)
                }

                // convert text value to regex for keyword search (case-insensitive)
                filter_query[field] = { $regex: req.query[field], $options: "i" }
            }
        }

        // query mongo database
        let data = await this.collection
            .find(filter_query)
            .sort(sort_query)
            .skip(skip)
            .limit(limit)
            .toArray()

        // return result
        if (data.length == 0) {
            res.sendStatus(constants.HTTP_STATUS.NO_CONTENT)
        } else {
            this.clean_output_arr(data)
            res.json(data)
        }
    } catch (err) {
        next(err)
    }
}

exports.updateOne = async function (req, res, next) {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new CustomError(constants.HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE, constants.MESSAGES.EXPECT_REQ_BODY)
        }

        let query = { [this.id_field]: req.params[this.id_field] }
        await this.clean_input_obj(query)
        await this.clean_input_obj(req.body)
        if ('updated_at' in this.schema.properties) {
            req.body.updated_at = new Date()
        }
        let data = await this.collection.updateOne(query, { $set: req.body })
        res.json(data)
    } catch (err) {
        next(err)
    }
}

exports.deleteOne = async function (req, res, next) {
    try {
        let query = { [this.id_field]: req.params[this.id_field] }
        await this.clean_input_obj(query)
        let data = await this.collection.deleteOne(query)
        res.json(data)
    } catch (err) {
        next(err)
    }
}