'use strict';

const path = require('path');
const webpack = require('webpack');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');
const HappyPack = require('happypack');
const AutoDllPlugin = require('autodll-webpack-plugin');

const publicPath = '/';
const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const theme = require(paths.appPackageJson).theme;

const commonLessETP = new ExtractTextPlugin('static/css/common.[md5:contenthash:hex:20].css', {
  disable: false,
  allChunks: true,
});
const appETP = new ExtractTextPlugin('static/css/app.[md5:contenthash:hex:20].css', {
  disable: false,
  allChunks: true,
});

const cssLoader = {
  loader: 'css-loader',
  options: {
    sourceMap: true,
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
const appLessLoader = {
  loader: 'less-loader',
  options: {
    strictMath: true,
    javascriptEnabled: true
  }
};
const commonLessLoader = {
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
  bail: true,
  devtool: 'source-map',
  entry: [
    require.resolve('./polyfills'),
    paths.appIndexJs
  ],
  output: {
    path: paths.appBuild,
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    publicPath: publicPath
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  mode: 'production',
  module: {
    noParse: /[\/\\]node_modules[\/\\]localforage[\/\\]dist[\/\\]localforage\.js$/,
    rules: [{
        exclude: [
          /\.html$/,
          /\.(js|jsx)(\?.*)?$/,
          /\.(ts|tsx)(\?.*)?$/,
          /\.less$/,
          /\.css$/,
          /\.json$/,
          /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        ],
        use: [getUrlLoader()],
      },
      {
        test: /\.(ts|tsx)$/,
        include: paths.appSrc,
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          }
        }, {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            onlyCompileBundledFiles: true,
          }
        }]
      },
      {
        test: /\.css$/,
        use: commonLessETP.extract({
          fallback: 'style-loader',
          use: cssLoader
        })
      },
      {
        test: /\.less$/,
        exclude: paths.appSrc,
        use: commonLessETP.extract({
          fallback: 'style-loader',
          use: 'happypack/loader?id=commonless'
        })
      },
      {
        test: /\.less$/,
        include: paths.appSrc,
        use: appETP.extract({
          fallback: 'style-loader',
          use: 'happypack/loader?id=appless'
        })
      },
      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        use: [getUrlLoader('application/font-woff')]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    commonLessETP,
    appETP,
    new HappyPack({
      id: 'appless',
      threads: 2,
      loaders: [
        cssLoader,
        postcssLoader,
        appLessLoader
      ]
    }),
    new HappyPack({
      id: 'commonless',
      threads: 4,
      loaders: [
        cssLoader,
        postcssLoader,
        commonLessLoader
      ]
    }),
    // new AutoDllPlugin({
    //   inject: true,
    //   filename: '[name].[md5:contenthash:hex:20].js',
    //   entry: {
    //     react: ['react', 'react-dom', 'redux', 'react-redux', 'redux-saga', 'reselect', 'react-intl'],
    //     editor: ['brace', 'react-ace'],
    //     utils: ['diff', 'diff2html', 'highlight.js', 'httpsnippet', 'react-copy-to-clipboard', 'react-json-tree', 'react-perfect-scrollbar', 'react-sortable-hoc', 'react-syntax-highlighter', 'reflect-metadata', 'shellwords', 'shortid', 'uuid', 'lodash']
    //   }
    // })
    new BundleAnalyzerPlugin()
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};