const NodeEnvironment = require('jest-environment-node')

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context)
    this.testPath = context.testPath
    this.docblockPragmas = context.docblockPragmas
  }

  async setup() {
    await super.setup()

    // constants
    this.global.constants = require('../../utils/constants')

    // seed data
    this.global.seed_data = require('./books')
  }

  async teardown() {
    await super.teardown()
  }

  getVmContext() {
    return super.getVmContext()
  }
}

module.exports = CustomEnvironment