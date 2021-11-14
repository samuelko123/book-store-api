const mongo = require('../utils/mongo')
const validator = require('../utils/validator')
const schema = require('./schemas/books')

module.exports = new function () {
   this.name = 'books'
   this.indexes = ['isbn']
   this.collection = mongo.db?.collection(this.name)
   this.schema = schema

   this.insert_one = async function (body) {
      validator.check_input(this.name, body)

      let ack = await this.collection.insertOne(body)
      let doc = await this.collection.findOne({ _id: ack.insertedId })
      doc = clean_output_doc(doc)

      validator.check_output(`${this.name}_doc`, doc)
      return doc
   }

   this.find_many = async function (query) {
      validator.check_input(`${this.name}_find`, query)

      let docs = await this.collection
         .find(query.filter)
         .sort(query.sort)
         .skip(query.skip)
         .limit(query.limit)
         .toArray()

      docs = docs.map(doc => {
         doc = clean_output_doc(doc)
         validator.check_output(`${this.name}_doc`, doc)
         return doc
      })

      return docs
   }

   this.find_one = async function (query) {
      validator.check_input(`${this.name}_id`, query)

      let doc = await this.collection.findOne(query)
      doc = clean_output_doc(doc)

      validator.check_output(`${this.name}_doc`, doc)
      return doc
   }

   this.update_one = async function (query, body) {
      validator.check_input(`${this.name}_id`, query)
      validator.check_input(`${this.name}_update`, body)

      let doc = await this.collection.findOneAndUpdate(query, { $set: body }, { returnDocument: 'after' })
      doc = doc.value
      doc = clean_output_doc(doc)

      validator.check_output(`${this.name}_doc`, doc)
      return doc
   }

   this.delete_one = async function (query) {
      validator.check_input(`${this.name}_id`, query)

      let doc = await this.collection.findOneAndDelete(query)
      doc = doc.value
      doc = clean_output_doc(doc)

      validator.check_output(`${this.name}_doc`, doc)
      return doc
   }
}

function clean_output_doc(doc) {
   if (!doc) {
      return {}
   }

   doc._id = doc._id.toString()
   return doc
}