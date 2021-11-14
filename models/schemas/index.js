module.exports = new function () {
    this.books = require('./books')
    this.books_doc = require('./books-doc')
    this.books_find = require('./books-find')
    this.books_id = require('./books-id')
    this.books_update = require('./books-update')
}