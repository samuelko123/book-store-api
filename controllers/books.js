const constants = require('../utils/constants')
const { send_res } = require('../utils/res_handler')
const book_model = require('../models/books')

module.exports = new function () {
    let param_name = 'isbn'
    
    this.insert_one = async function (req, res, next) {
        try {
            let doc = await book_model.insert_one(req.body)
            let status = constants.HTTP_STATUS.CREATED

            send_res(res, status, doc)
        } catch (err) {
            next(err)
        }
    }

    this.find_one = async function (req, res, next) {
        try {
            let query = { [param_name]: req.params[param_name] }
            let doc = await book_model.find_one(query)
            let status = constants.HTTP_STATUS.OK

            send_res(res, status, doc)
        } catch (err) {
            next(err)
        }
    }

    this.find_many = async function (req, res, next) {
        try {
            let find_query = {
                filter: {},
            }

            // build filter query
            for (let key in req.query) {
                // skip special words
                if (['sort', 'skip', 'limit'].includes(key)) {
                    continue
                }

                if (!key.includes('$')){
                    continue // allow additional query string for cache busting
                }

                // parse query string
                let value = req.query[key]
                let [field, operator] = key.split('$')

                // create field (if not exist)
                if (!(field in find_query.filter)) {
                    find_query.filter[field] = {}
                }

                // assign filter to field
                find_query.filter[field]['$' + operator] = value
            }

            // build sort query
            if (!!req.query.sort) {
                find_query.sort = {}

                if (!Array.isArray(req.query.sort)) {
                    req.query.sort = [req.query.sort]
                }

                for (let field of req.query.sort) {
                    let value = 1

                    // assign -1 if field starts with '-'
                    if (field[0] == '-') {
                        field = field.substr(1)
                        value = -1
                    }

                    find_query.sort[field] = value
                }
            }

            // assign skip
            if (!!req.query.skip) {
                find_query.skip = req.query.skip
            }

            // assign limit
            if (!!req.query.limit) {
                find_query.limit = req.query.limit
            }

            // query db
            let docs = await book_model.find_many(find_query)
            let status = constants.HTTP_STATUS.OK

            // send response
            send_res(res, status, docs)
        } catch (err) {
            next(err)
        }
    }

    this.update_one = async function (req, res, next) {
        try {
            let filter_query = { [param_name]: req.params[param_name] }
            let doc = await book_model.update_one(filter_query, req.body)
            let status = constants.HTTP_STATUS.OK

            send_res(res, status, doc)
        } catch (err) {
            next(err)
        }
    }

    this.delete_one = async function (req, res, next) {
        try {
            let filter_query = { [param_name]: req.params[param_name] }
            let doc = await book_model.delete_one(filter_query)
            let status = constants.HTTP_STATUS.OK

            send_res(res, status, doc)
        } catch (err) {
            next(err)
        }
    }
}