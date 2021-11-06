module.exports = Object.freeze({
    AUTH: {
        SALT_WORK_FACTOR: 10,
        MAX_LOGIN_ATTEMPTS: 5,
    },
    GET_QUERY_LIMIT: {
        DEFAULT: 25,
        MAX: 100
    },
    HTTP_STATUS: {
        OK: 200,
        NO_CONTENT: 204,
        CREATED: 201,
        FOUND: 302,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        UNSUPPORTED_MEDIA_TYPE: 415,
        SERVER_ERROR: 500,
    },
    LOG_COLORS: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'white',
    },
    MONGO_SCHEMAS: ['books','users'],
    MONGO_USER_ERRORS: [
        66, // update immutable field
        121, // document validation failed
        11000, // duplicate key error
    ],
    OPEN_API_JSON: {
        URL: '/docs/openapi.json',
        FILE: './docs/openapi.json'
    },
    TEST_ERRORS: {
        DUPLICATE_KEY: 'duplicate key error',
        IMMUTABLE_FIELD: 'immutable field',
        MISSING_REQUIRED: 'should have required property',
        NO_DOCUMENT_FOUND: 'No document found',
        NOT_IN_SCHEMA: 'not in schema',
        SHOULD_BE_NUMBER: 'should be number',
        SHOULD_BE_INTEGER: 'should be integer',
        SHOULD_BE_NON_NEGATIVE: 'should be >= 0',
        UNSUPPORTED_MEDIA_TYPE: 'unsupported media type',
        UNKNOWN_QUERY_PARAMETER: 'Unknown query parameter',
        FAIlED_VALIDATION: 'failed validation',
    },
})