module.exports = {
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    testEnvironment: 'node',
    globalSetup: '<rootDir>/tests/fixtures/global-setup.js',
    setupFilesAfterEnv: ['<rootDir>/tests/fixtures/test-setup.js'],
    globalTeardown: '<rootDir>/tests/fixtures/global-teardown.js',
    testTimeout: 10 * 1000, // 10s
    slowTestThreshold: 10, // 10s
    maxWorkers: '50%',
    collectCoverage: true,
    restoreMocks: true,
}