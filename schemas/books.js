module.exports = {
   bsonType: 'object',
   required: ['isbn', 'name', 'author', 'price'],
   additionalProperties: false,
   properties: {
      _id: {
         bsonType: 'objectId',
      },
      isbn: {
         bsonType: 'long',
         description: 'must be 13-digit integer',
         minimum: 1000000000000,
         maximum: 9999999999999,
      },
      name: {
         bsonType: 'string',
      },
      author: {
         bsonType: 'string',
      },
      price: {
         bsonType: 'double',
         minimum: 0,
      },
   }
}