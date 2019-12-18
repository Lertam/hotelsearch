const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    optimization: {
        minimize: true
    },
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
        },
        ],
    }
};