// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        bracketSameLine: true, // Prevents line breaks for JSX props
        jsxBracketSameLine: true, // Prevents line breaks for JSX props
      },
    ],
  },
};
