module.exports = {
  extends: [
    '@docusaurus/eslint-config',
    '@docusaurus/eslint-config/lib/client',
  ],
  plugins: ['security-sanitize'],
  rules: {
    // Custom rule to enforce sanitizeHTML usage
    'security-sanitize/require-sanitize-html': 'error',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  }
}; 