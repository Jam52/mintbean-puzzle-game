const path = require('path');
const common = require('./webpack.common');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
  },
  output: {
    publicPath: './',
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['index'],
      title: 'index',
      template: './src/index.html',
      output: {
        publicPath: './',
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'game.html',
      chunks: ['index', 'game'],
      title: 'game',
      template: './src/game.html',
      output: {
        publicPath: './',
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.scss/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      { test: /\.css/, use: ['style-loader', 'css-loader'] },
    ],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
});
