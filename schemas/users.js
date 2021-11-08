const constants = require('../utils/constants')

module.exports = {
   bsonType: 'object',
   required: ['username', 'password', 'email'],
   additionalProperties: false,
   properties: {
      _id: {
         bsonType: 'objectId',
      },
      username: {
         bsonType: 'string',
         description: `
            - must be at least 6 characters long
            - must contain lowercase alphanumeric characters only
         `,
         pattern: '^[a-z0-9]{6,}$',
      },
      password: {
         bsonType: 'string',
      },
      email: {
         bsonType: 'string',
      },
      verified: {
         bsonType: 'bool',
      },
      role: {
         enum: ['user', 'admin'],
      },
      login_attempts: {
         bsonType: 'int',
         minimum: 0,
         maximum: constants.AUTH.MAX_LOGIN_ATTEMPTS,
      },
      locked_until: {
         bsonType: 'date',
      },
      created_at: {
         bsonType: 'date',
      },
      updated_at: {
         bsonType: 'date',
      },
   }
}