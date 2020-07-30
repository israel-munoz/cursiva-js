const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: isProduction ? null : 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 1000,
    watchContentBase: true,
    headers: {
      'Cache-Cotrol': 'max-age=31536000'
    }
  },
  watchOptions: {
    ignored: /node_modules/
  },
  resolve: {
    extensions: ['.js']
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
        },
        'eslint-loader'
      ]
    }, {
      test: /\.css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
        options: {
          publicPath: 'css/',
          minimize: true
        }
      }, {
        loader: 'css-loader'
      }],
      exclude: /node_modules/
    }, {
      test: /\.(svg|png)$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'images/',
          emitFile: true
        }
      }],
      exclude: /node_modules/
    }]
  },
  plugins: [
    new HtmlPlugin({
      title: 'Numbers Converter',
      filename: 'index.html',
      template: 'src/index.html'
    }),
    new HtmlPlugin({
      title: 'Canvas Draw',
      filename: 'draw.html',
      template: 'src/draw.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
      chunkFilename: '[id].css'
    })
  ],
  optimization: {
    minimizer: [
      new UglifyPlugin({
        cache: true,
        parallel: true,
        sourceMap: !isProduction
      }),
      new OptimizeCssPlugin({})
    ]
  }
};
