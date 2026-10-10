import { defineConfig } from 'oxfmt';

export default defineConfig({
  $schema: './node_modules/oxfmt/configuration_schema.json',

  ignorePatterns: [
    '**/node_modules/',
    'dist/',
    'quasar.config.*.temporary.compiled*',
    '.quasar/',
    'src-cordova/',
    'src-capacitor/',
    'src/router/typed-router.d.ts',
  ],

  printWidth: 100,
  arrowParens: 'always',
  bracketSpacing: true,
  bracketSameLine: false,
  htmlWhitespaceSensitivity: 'strict',
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'all',
  useTabs: false,
  vueIndentScriptAndStyle: false,
  singleAttributePerLine: true,
});
