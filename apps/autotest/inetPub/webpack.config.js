/**
 * Created by pavel.mash on 04.09.2016.
 */
module.exports = {
  entry: './app.js',
  output: {
    filename: 'app.min.js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      // exclude: /node_modules/,
      include: [/(@|ub)/]
    }]
  },

  plugins: [
  ]
}
