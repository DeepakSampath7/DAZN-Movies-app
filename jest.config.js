module.exports = {
  testMatch: ['**/tests/**/*.test.ts'], // Look for .test.ts files in tests folder
  testEnvironment: 'node', // Set Node.js as the test environment
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Use ts-jest to handle TypeScript
  },
  moduleFileExtensions: ['ts', 'js'], // Include both TS and JS files
};
