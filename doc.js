const $RefParser = require("@apidevtools/json-schema-ref-parser")
const fs = require('fs')
const logger = require('./utils/logger')
const constants = require('./utils/constants')

const generate_doc = async () => {
    try {
        let json_file = constants.OPEN_API_JSON.FILE
        let schema = await $RefParser.bundle('./docs/_index.yaml')
        fs.writeFileSync(json_file, JSON.stringify(schema))
        logger.info('Generated documentation')
    } catch (err) {
        logger.error(err)
    }
}

if (process.env.NODE_ENV == 'test') {
    generate_doc()
}

module.exports = generate_doc