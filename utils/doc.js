const $RefParser = require("@apidevtools/json-schema-ref-parser")
const fs = require('fs')
const logger = require('./logger')
const constants = require('./constants')

module.exports.generate = async () => {
    try {
        let json_file = constants.OPEN_API_JSON.FILE
        let schema = await $RefParser.bundle('./docs/_index.yaml')
        fs.writeFileSync(json_file, JSON.stringify(schema))
        
        logger.info('Generated documentation')
    } catch (err) {
        logger.error(err)
    }
}