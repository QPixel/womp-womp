/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    "eslint:recommended",
    "plugin:astro/recommended",
    'plugin:@typescript-eslint/recommended',

  ],
  plugins: ['@typescript-eslint', 'import'],
  env: {
    es2022: true,
    node: true,
    browser: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    extraFileExtensions: [".astro", ".svelte"],
  },
  overrides: [
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      }
    },
    {
      files: ["*.d.ts"],
      rules: {
        "@typescript-eslint/triple-slash-reference": "off",
        "@typescript-eslint/consistent-type-imports": "off",
      },
    },
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      plugins: ['svelte', '@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:svelte/prettier',
        'plugin:@typescript-eslint/recommended-type-checked',
      ],
      parserOptions: {
        parser: '@typescript-eslint/parser',
      }
    }
  ],
  ignorePatterns: [
    "**/*.config.js",
    "**/*.config.cjs",
    "**/.eslintrc.cjs",
    "dist",
    "pnpm-lock.yaml",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { prefer: "type-imports", fixStyle: "separate-type-imports" },
    ],
    "@typescript-eslint/no-misused-promises": [
      2,
      { checksVoidReturn: { attributes: false } },
    ],
    "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    '@typescript-eslint/no-non-null-assertion': 'off',
    "@typescript-eslint/triple-slash-reference": 'off',
  }
}

module.exports = config