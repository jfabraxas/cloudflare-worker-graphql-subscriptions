const path = require('path')

module.exports = {
  target: 'webworker',
  entry: './src/index.ts',
  resolve: {
    extensions: ['.ts', '.js']
  },
  mode: 'production',
  output: {
    filename: `worker.js`,
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          // transpileOnly: true
        }
      }
    ]
  }
}
