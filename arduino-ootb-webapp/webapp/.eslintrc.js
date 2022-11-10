module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  env: { es6: true },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
    'plugin:react-hooks/recommended', // Uses the recommended rules from @eslint-plugin-react-hooks
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  ignorePatterns: ['.eslintrc.js', 'vite.config.ts'],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/camelcase': 'off',
    'no-debugger': 'warn',
    'no-throw-literal': 'error',
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { "varsIgnorePattern": "^_" }],
    'no-restricted-imports': ['error', {
      'paths': [{
        'name': '@mui/material',
        'message': 'Please use @mui/material/* instead.'
      }]
    }],
    // 'import/no-unresolved': 'off',
    'import/order': ['warn', {
      'pathGroups': [
        {
          'pattern': 'react',
          'group': 'external',
          'position': 'before',
        },
        {
          'pattern': 'react-*',
          'group': 'external',
          'position': 'before',
        },
        {
          'pattern': '@redux/**',
          'group': 'external',
          'position': 'before',
        },
        {
          'pattern': '@mui/**',
          'group': 'external',
          'position': 'after',
        },
        {
          'pattern': '@mdi/**',
          'group': 'external',
          'position': 'after',
        },
        {
          'pattern': '**/store/**',
          'group': 'parent',
          'position': 'before',
        }, {
          'pattern': '**/hooks/**',
          'group': 'parent',
          'position': 'before',
        }
      ],
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true,
      },
      'pathGroupsExcludedImportTypes': ['builtin'],
    }]
  },
};
