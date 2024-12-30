module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    watchman: false,
    moduleNameMapper: {
        '^@models/(.*)$': '<rootDir>/src/models/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@routes/(.*)$': '<rootDir>/src/routes/$1',
        '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    },
};
