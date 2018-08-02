const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const path = require('path');
const paths = require('./paths');

const theme = require(paths.appPackageJson).theme;

const dllCssETP = new ExtractTextPlugin('static/css/dll.css', {
    disable: false,
    allChunks: true,
});
const dllLessETP = new ExtractTextPlugin('static/css/dll.css', {
    disable: false,
    allChunks: true,
});
const appETP = new ExtractTextPlugin('static/css/app.css', {
    disable: false,
    allChunks: true,
});

const appLessLoader = {
    loader: 'less-loader',
    options: {
        strictMath: true,
        javascriptEnabled: true
    }
};

const cssLoader = {
    loader: 'css-loader',
    options: {
        sourceMap: true,
        // modules: true
    }
};
const postcssLoader = {
    loader: 'postcss-loader',
    options: {
        sourceMap: true,
        options: {
            config: {
                path: './'
            }
        }
    }
};

const dllLessLoader = {
    loader: 'less-loader',
    options: {
        javascriptEnabled: true,
        modifyVars: theme
    }
};

const getUrlLoader = (minetype) => {
    const loader = {
        loader: 'url-loader',
        options: {
            limit: 10000,
            name: 'static/fonts/[name].[ext]'
        }
    };
    if (minetype) {
        loader.options.minetype = minetype;
    }
    return loader;
}

module.exports = {
    mode: 'development',
    entry: {
        react: ['react', 'react-dom', 'redux', 'react-redux', 'redux-saga', 'reselect'],
        echart: ['echarts', 'echarts-for-react'],
        antd: ['antd'],
        editor: ['brace', 'react-ace'],
        utils: ['diff', 'diff2html', 'highlight.js', 'httpsnippet', 'react-copy-to-clipboard', 'react-intl', 'react-json-tree', 'react-perfect-scrollbar', 'react-sortable-hoc', 'react-syntax-highlighter', 'reflect-metadata', 'shellwords', 'shortid', 'uuid'],
        css: [paths.appIndexJs]
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
                use: [{
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true
                        }
                    },
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            useCache: true
                        }
                    }
                ]
            }, {
                test: /\.css$/,
                use: dllCssETP.extract({
                    fallback: 'style-loader',
                    use: [
                        cssLoader,
                        postcssLoader
                    ]
                })
            },
            {
                test: /\.less$/,
                include: paths.appSrc,
                use: appETP.extract({
                    fallback: 'style-loader',
                    use: [
                        cssLoader,
                        postcssLoader,
                        appLessLoader
                    ]
                })
            }, {
                test: /\.less$/,
                exclude: paths.appSrc,
                use: dllLessETP.extract({
                    fallback: 'style-loader',
                    use: [
                        cssLoader,
                        postcssLoader,
                        dllLessLoader
                    ]
                })
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: [getUrlLoader('image/svg+xml')]
            },
            {
                test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
                use: [getUrlLoader('application/font-woff')]
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: [getUrlLoader('application/octet-stream')]
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: [getUrlLoader('application/vnd.ms-fontobject')]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,
        }),
        dllCssETP,
        dllLessETP,
        appETP,
        new CaseSensitivePathsPlugin(),
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