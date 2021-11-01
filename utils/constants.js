module.exports = Object.freeze({
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        FOUND: 302,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        UNSUPPORTED_MEDIA_TYPE: 415,
        SERVER_ERROR: 500,
    },
    MONGO_USER_ERRORS: [
        66, // update immutable field
        11000, // duplicate key error
    ],
    AUTH: {
        SALT_WORK_FACTOR: 10,
        MAX_LOGIN_ATTEMPTS: 5,
    },
    TEST_ERRORS: {
        DUPLICATE_KEY: 'duplicate key error',
        IMMUTABLE_FIELD: 'immutable field',
        MISSING_REQUIRED: 'should have required property',
        NO_DOCUMENT_FOUND: 'No document found',
        NOT_IN_SCHEMA: 'not in schema',
        UNSUPPORTED_MEDIA_TYPE: 'unsupported media type',
        VALIDATION_FAILED: 'validation failed',
    },
    OPEN_API_JSON: {
        URL: '/docs/openapi.json',
        FILE: './docs/openapi.json'
    },
    LOG_COLORS: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'white',
    },
})