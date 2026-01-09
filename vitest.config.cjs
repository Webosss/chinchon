module.exports = {
  test: {
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'server/**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'node_modules/**',
      'tests/e2e/**',
      'e2e/**',
      'dist/**'
    ]
  }
}
