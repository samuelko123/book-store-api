module.exports = Object.freeze({
    AUTH: {
        SALT_WORK_FACTOR: 10,
        MAX_LOGIN_ATTEMPTS: 5,
        LOCK_DURATION_MS: 5 * 1000,
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
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        UNSUPPORTED_MEDIA_TYPE: 415,
        SERVER_ERROR: 500,
    },
    MESSAGES: {
        DUP_KEY_ERR: 'duplicate key error',
        EXPECT_POS_INT: 'expect positive integer',
        EXPECT_POS_NUM: 'expect positive number',
        EXPECT_REQ_BODY: 'request body cannot be empty',
        IMMUTABLE_FIELD: 'immutable field',
        MISSING_REQUIRED: 'missing required property',
        UNKNOWN_PROP: 'Unknown property',
        UNKNOWN_QUERY_PARAM: 'Unknown query parameter',

        ACCOUNT_LOCKED: 'Your account is locked. Please reset your password.',
        ADMIN_ONLY: 'This resource is for admin only.',
        LOGIN_FAILED: 'Login failed. Please try again.',

        INVALID_USERNAME: 'username must be at least 6 characters long, and contain lowercase alphanumeric characters only.',
        INVALID_PASSWORD_LENGTH: 'password must be at least 8 characters long',
        INVALID_PASSWORD_LOWERCASE: 'password must contain at least one lower case character',
        INVALID_PASSWORD_UPPERCASE: 'password must contain at least one upper case character',
        INVALID_PASSWORD_DIGIT: 'password must contain at least one digit',
        INVALID_PASSWORD_SPECIAL_CHAR: 'password must contain at least one special character',
    },
    LOG_COLORS: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'white',
    },
    MONGO_SCHEMAS: ['books', 'users'],
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