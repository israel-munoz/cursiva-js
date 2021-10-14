const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js?v=[hash]',
    path: resolve(__dirname, 'dist')
  },
  devtool: isProduction ? null : 'inline-source-map',
  devServer: {
    compress: true,
    port: 1000,
    headers: {
      'Cache-Cotrol': 'max-age=31536000'
    }
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      ]
    }, {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader'
      ],
      exclude: /node_modules/
    }, {
      test: /\.(svg|png)$/,
      type: 'asset/resource',
      generator: {
        filename: 'images/[name][ext]'
      },
      exclude: /node_modules/
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'cursiva-js',
      filename: 'index.html',
      template: 'src/index.html'
    }),
    new HtmlWebpackPlugin({
      title: 'Canvas Draw',
      filename: 'draw.html',
      template: 'src/draw.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
      chunkFilename: '[name].css?v=[hash]'
    }),
    new ESLintPlugin()
  ]
};
