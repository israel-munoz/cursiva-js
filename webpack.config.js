const path = require('path');
const htmlPlugin = require('html-webpack-plugin');
const cssPlugin = require('mini-css-extract-plugin');
const uglifyPlugin = require('uglifyjs-webpack-plugin');
const optimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
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
        watchContentBase: true
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
                }
            ]
        }, {
            test: /\.css$/,
            use: [{
                loader: cssPlugin.loader,
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
        new htmlPlugin({
            title: 'Numbers Converter',
            filename: 'index.html',
            template: 'src/index.html'
        }),
        new htmlPlugin({
            title: 'Canvas Draw',
            filename: 'draw.html',
            template: 'src/draw.html'
        }),
        new cssPlugin({
            filename: 'styles.css',
            chunkFilename: '[id].css'
        })
    ],
    optimization: {
        minimizer: [
            new uglifyPlugin({
                cache: true,
                parallel: true,
                sourceMap: !isProduction
            }),
            new optimizeCssPlugin({})
        ]
    }
}
