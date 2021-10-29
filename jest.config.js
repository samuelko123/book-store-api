module.exports = {
    testEnvironment: 'node',
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    // testMatch: ['<rootDir>/tests/**/books.patch.one.test.js'],
    testEnvironment: '<rootDir>/tests/fixtures/test-environment.js',
    setupFilesAfterEnv: ['<rootDir>/tests/fixtures/test-setup.js'],
    testTimeout: 10 * 1000, // 10s
    maxWorkers: '50%',
    collectCoverage: true,
    restoreMocks: true,
}