const constants = require('../utils/constants')

exports.clean_output_arr = function (arr) {
    for (let doc of arr) {
        this.clean_output_obj(doc)
    }
}

exports.clean_input_arr = function (arr) {
    for (let doc of arr) {
        this.clean_input_obj(doc)
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

exports.insertOne = async function (req, res, next) {
    try {
        this.clean_input_obj(req.body)
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
        this.clean_input_obj(query)
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
        // filter query
        let filter_query = {}
        for (let field in req.query.filter) {
            if (field.includes('.')) {
                // convert query operator (e.g. gte, lte)
                let [name, operator] = field.split('.')
                let value = req.query.filter[field]
                if (this.schema.properties[name].bsonType == 'date'){
                    value = new Date(value)
                }
                let filter = { ['$' + operator]: value }

                if (name in filter_query) {
                    // append operator to filter
                    Object.assign(filter_query[name], filter)
                } else {
                    // create filter
                    filter_query[name] = filter
                }
            } else {
                // convert text value to regex for keyword search (case-insensitive)
                filter_query[field] = { $regex: req.query.filter[field], $options: "i" }
            }
        }

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

        // query mongo database
        let data = await this.collection
            .find(filter_query)
            .sort(sort_query)
            .skip(req.query.skip || 0)
            .limit(Math.min(req.query.limit, constants.GET_QUERY_LIMIT.MAX))
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
        let query = { [this.id_field]: req.params[this.id_field] }
        this.clean_input_obj(query)
        this.clean_input_obj(req.body)
        if ('updated_at' in this.schema.properties){
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
        this.clean_input_obj(query)
        let data = await this.collection.deleteOne(query)
        res.json(data)
    } catch (err) {
        next(err)
    }
}