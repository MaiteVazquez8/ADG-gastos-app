// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    // Reanimated shared values are mutated via `.value = ...` by design.
    files: ['components/PressableScale.tsx'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
]);