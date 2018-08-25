'use strict';

const path = require('path');
const webpack = require('webpack');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HappyPack = require('happypack');
const AutoDllPlugin = require('autodll-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const hash = require("hash-sum");

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
    options: {
      minimize: true
    }
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
    chunkFilename: 'static/js/[name].[chunkhash:8].js',
    publicPath: publicPath
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  mode: 'production',
  optimization: {
    runtimeChunk: true,
    moduleIds: 'hashed',
    splitChunks: {
      chunks: "all",
      maxAsyncRequests: 10,
      maxInitialRequests: 10,
      minSize: 30000,
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'initial',
          priority: 30,
          minChunks: 2
        },
        util: {
          name: "util",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "all"
        },
        react: {
          name: "react",
          test: /[\\/]node_modules[\\/](react|redux|reselect)/,
          priority: 12,
          chunks: "all"
        },
        editor: {
          name: "editor",
          test: /[\\/]node_modules[\\/](react-ace|brace)/,
          priority: 15,
          chunks: "all"
        },
        echart: {
          name: "echart",
          test: /[\\/]node_modules[\\/](echarts|zrender)/,
          priority: 18,
          chunks: "all"
        },
        ui: {
          name: "ui",
          priority: 20,
          test: /[\\/]node_modules[\\/](antd|rc-)/,
          chunks: "all"
        },
        default: {
          name: "app",
          minChunks: 5,
          priority: -20,
          reuseExistingChunk: true,
        }
      }
    }
  },
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
        use: appETP.extract({
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
      inlineSource: /runtime..*.js|app..*.css/,
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
    new HtmlWebpackInlineSourcePlugin(),
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
    //   filename: '[name].[contenthash:8].js',
    //   path: '../build/static/js',
    //   entry: {
    //     react: ['react', 'react-dom', 'redux', 'react-redux', 'redux-saga', 'reselect', 'react-intl'],
    //     editor: ['brace/mode/javascript', 'brace/mode/json', 'brace/mode/xml', 'brace/theme/eclipse', 'brace/ext/language_tools', 'brace/ext/searchbox', 'brace/snippets/javascript', 'react-ace']
    //   }
    // }),
    new webpack.NamedChunksPlugin(chunk => {
      if (chunk.name) {
        return chunk.name;
      }
      const modules = Array.from(chunk.modulesIterable);
      if (modules.length > 1) {
        const seen = new Set();
        const nameLength = 4;
        const joinedHash = hash(modules.map(m => m.id).join("_"));
        let len = nameLength;
        while (seen.has(joinedHash.substr(0, len))) len++;
        seen.add(joinedHash.substr(0, len));
        return `chunk-${joinedHash.substr(0, len)}`;
      } else {
        return modules[0].id;
      }
    }),
    new BundleAnalyzerPlugin()
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};