module.exports = {
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    testEnvironment: 'node',
    globalSetup: '<rootDir>/tests/fixtures/global-setup.js',
    setupFilesAfterEnv: ['<rootDir>/tests/fixtures/test-setup.js'],
    globalTeardown: '<rootDir>/tests/fixtures/global-teardown.js',
    maxWorkers: '50%',
    collectCoverage: true,
    restoreMocks: true,
}