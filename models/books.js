const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    isbn: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{13}$/.test(v)
            },
            message: 'ISBN must be 13-digit integer'
        },
     },
    name: { type: String, required: true },
    author: { type: String, required: true },
    price: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return v > 0
            },
            message: 'Price must be a positive number'
        },
    },
}, {
    versionKey: false,
    strict: 'throw',
    strictQuery: true,
})

module.exports = mongoose.model('books', schema, 'books')