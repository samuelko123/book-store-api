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
    LOG_COLORS:{
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'white',
    },
    OPEN_API_JSON: {
        URL: '/docs/openapi.json',
        FILE: './docs/openapi.json'
    }
})