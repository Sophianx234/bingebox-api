import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  // Include standard JavaScript recommended rules
  eslint.configs.recommended,
  // Include standard TypeScript recommended rules
  ...tseslint.configs.recommended,
  {
    // Tell ESLint to ignore your compiled dist folder
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      globals: {
        // This tells ESLint you are using Node.js (so it doesn't yell at you for using process.env)
        ...globals.node,
      },
    },
    rules: {
      // You can customize your strictness here!
      'no-console': 'off', // We want to allow console.logs in our backend
      '@typescript-eslint/no-explicit-any': 'warn', // Warns you if you use 'any' instead of a proper type
      '@typescript-eslint/no-unused-vars': 'warn' // Warns you if you declare a variable but never use it
    },
  }
);