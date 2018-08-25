const webpack = require('webpack');
const path = require('path');
const paths = require('./paths');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const theme = require(paths.appPackageJson).theme;
const commonLessLoader = {
    loader: 'less-loader',
    options: {
        javascriptEnabled: true,
        modifyVars: theme
    }
};
const cssLoader = {
    loader: 'css-loader',
    options: {
        sourceMap: true,
        // modules: true
    }
};

const appLessLoader = {
    loader: 'less-loader',
    options: {
        strictMath: true,
        javascriptEnabled: true
    }
};
const commonLessETP = new ExtractTextPlugin('static/css/antd.css', {
    disable: false,
    allChunks: true,
});
const appETP = new ExtractTextPlugin('static/css/app.css', {
    disable: false,
    allChunks: true,
});

module.exports = {
    mode: 'development',
    entry: {
        react: ['react', 'react-dom', 'redux', 'react-redux', 'redux-saga', 'reselect'],
        echart: ['echarts', 'echarts-for-react'],
        antd: ['antd'],
        editor: ['brace', 'react-ace'],
        utils: ['diff', 'diff2html', 'highlight.js', 'httpsnippet', 'react-copy-to-clipboard', 'react-intl', 'react-json-tree', 'react-perfect-scrollbar', 'react-sortable-hoc', 'react-syntax-highlighter', 'reflect-metadata', 'shellwords', 'shortid', 'uuid', 'lodash'],
        less: [paths.appIndexJs],
        polyfill: [require.resolve('react-dev-utils/webpackHotDevClient'), require.resolve('./polyfills')]
    },
    output: {
        filename: 'static/js/[name].dll.js',
        path: paths.appBuild,
        publicPath: '/',
        pathinfo: true,
        library: '_dll_[name]'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    module: {
        rules: [{
                test: /\.(ts|tsx)$/,
                include: paths.appSrc,
                use: //'happypack/loader?id=ts'
                    [{
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true
                        }
                    }, {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            onlyCompileBundledFiles: true,
                        }
                    }]
            }, {
                test: /\.less$/,
                exclude: paths.appSrc,
                use: commonLessETP.extract({
                    fallback: 'style-loader',
                    use: [cssLoader,
                        //postcssLoader,
                        commonLessLoader
                    ]
                })
            }, {
                test: /\.less$/,
                include: paths.appSrc,
                use: appETP.extract({
                    fallback: 'style-loader',
                    // use: 'happypack/loader?id=appless'
                    use: [cssLoader,
                        //postcssLoader,
                        appLessLoader
                    ]
                })
            }, {
                test: /\.css$/,
                use: 'css-loader'
            },
            {
                test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader'
            }
        ]
    },
    plugins: [
        commonLessETP,
        appETP,
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