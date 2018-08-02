const webpack = require('webpack');
const path = require('path');
const paths = require('./paths');

module.exports = {
    mode: 'development',
    entry: {
        react: ['react', 'react-dom', 'redux', 'react-redux', 'redux-saga', 'reselect'],
        echart: ['echarts', 'echarts-for-react'],
        antd: ['antd'],
        editor: ['brace', 'react-ace'],
        utils: ['diff', 'diff2html', 'highlight.js', 'httpsnippet', 'react-copy-to-clipboard', 'react-intl', 'react-json-tree', 'react-perfect-scrollbar', 'react-sortable-hoc', 'react-syntax-highlighter', 'reflect-metadata', 'shellwords', 'shortid', 'uuid']
    },
    output: {
        filename: 'static/js/[name].dll.js',
        path: paths.appBuild,
        publicPath: '/',
        pathinfo: true,
        library: '_dll_[name]'
    },
    plugins: [
        new webpack.DllPlugin({
            name: '_dll_[name]',
            path: path.resolve(paths.appBuild, 'static/js', '[name].manifest.json')
        })
    ],
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
};