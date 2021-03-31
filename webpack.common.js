module.exports = {
  devtool: false,
  entry: { index: './src/index.js', game: './src/game.js' },
  module: {
    rules: [
      { test: /\.html/, use: ['html-loader'] },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset',
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
