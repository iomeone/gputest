import eslint from "@eslint/js";
import tseslint from 'typescript-eslint';
import rhooks from 'eslint-plugin-react-hooks';

export default tseslint.config({
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
      plugins: {
        "react-hooks": rhooks,
      },
      rules: rhooks.configs.recommended.rules,
    },
  ],
  files: ['packages/**/src/*.ts', 'packages/**/src/*.tsx'],
  ignores: [
    "*.wgsl.ts"
  ],
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-extra-semi": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/no-unsafe-function-type": "off",

    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-unused-vars": "error",

    "react-hooks/rules-of-hooks": "off",
  }
});
