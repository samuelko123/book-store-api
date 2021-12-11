module.exports = Object.freeze({
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        FOUND: 302,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        SERVER_ERROR: 500,
    },
    LOG_COLORS: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'white',
    },
    MESSAGES: {
        DUPLICATE_KEY: 'duplicate key error',
        IMMUTABLE_FIELD: 'immutable field',
        MUST_HAVE_REQUIRED: 'must have required property',
        MUST_BE_INT: 'must be integer',
        MUST_BE_NUM: 'must be number',
        MUST_BE_OBJ: 'must be object',
        MUST_BE_ALLOWED_VAL: 'must be equal to one of the allowed values',
        NO_ADDITIONAL_PROPS: 'must NOT have additional properties',
        NOT_FOUND: 'Not Found',
        NOT_UNIQUE_IN_SCHEMA: 'property is not unique in schema',
        TOO_LARGE: 'must be <',
        TOO_SMALL: 'must be >',
    },
    MONGO_FIND_QUERY_LIMIT: {
        DEFAULT: 25,
        MAX: 100
    },
    MONGO_USER_ERRORS: [
        66, // update immutable field
        121, // document validation failed
        11000, // duplicate key error
    ],
    OPEN_API_JSON: {
        URL: '/docs/openapi.json',
        FILE: './docs/openapi.json'
    },
})