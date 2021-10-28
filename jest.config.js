module.exports = {
    testEnvironment: 'node',
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    // testMatch: ['<rootDir>/tests/**/books.post.many.test.js'],
    maxWorkers: '50%',
    slowTestThreshold: 10,
    collectCoverage: true,
}