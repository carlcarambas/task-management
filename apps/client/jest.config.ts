export default {
  displayName: 'client',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/client', // Adjust path as needed
  // setupFilesAfterEnv: ['../../test-setup.ts'], // Optional for custom test setup
  // testEnvironment: 'jsdom',
  // testEnvironment: 'jest-environment-jsdom',
  testEnvironment: 'jest-fixed-jsdom',
  // testEnvironmentOptions: {
  //   customExportConditions: [''],
  // },
};
