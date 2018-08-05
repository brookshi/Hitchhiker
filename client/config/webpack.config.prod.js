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

const commonCssETP = new ExtractTextPlugin('static/css/common.css', {
  disable: false,
  allChunks: true,
});
const commonLessETP = new ExtractTextPlugin('static/css/common.css', {
  disable: false,
  allChunks: true,
});
const appETP = new ExtractTextPlugin('static/css/app.css', {
  disable: false,
  allChunks: true,
});

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
  devtool: 'cheap-module-source-map',
  entry: [
    paths.appIndexJs,
    require.resolve('react-dev-utils/webpackHotDevClient'),
    require.resolve('./polyfills')
  ],
  output: {
    path: paths.appBuild,
    pathinfo: true,
    filename: 'static/js/bundle.js',
    publicPath: publicPath
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      antd: path.resolve(__dirname, '../node_modules/antd/dist/antd.js')
    }
  },
  mode: 'development',
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
        use: //'happypack/loader?id=ts'
          [{
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                "react",
                "es2015"
              ],
              babelrc: false
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
        use: commonCssETP.extract({
          fallback: 'style-loader',
          use: cssLoader
        })
      },
      // {
      //   test: /\.less$/,
      //   exclude: paths.appSrc,
      //   use: commonLessETP.extract({
      //     fallback: 'style-loader',
      //     use: 'happypack/loader?id=commonless'
      //     // use: [cssLoader,
      //     //   //postcssLoader,
      //     //   commonLessLoader
      //     // ]
      //   })
      // },
      {
        test: /\.less$/,
        include: paths.appSrc,
        use: appETP.extract({
          fallback: 'style-loader',
          use: 'happypack/loader?id=appless'
          // use: [cssLoader,
          //   //postcssLoader,
          //   appLessLoader
          // ]
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
      template: paths.appDevHtml,
    }),
    commonCssETP,
    // commonLessETP,
    appETP,
    new HappyPack({
      id: 'appless',
      threads: 2,
      loaders: [
        cssLoader,
        //postcssLoader,
        appLessLoader
      ]
    }),
    // new HappyPack({
    //   id: 'commonless',
    //   threads: 4,
    //   loaders: [
    //     cssLoader,
    //     //postcssLoader,
    //     commonLessLoader
    //   ]
    // }),
    // new HappyPack({
    //   id: 'ts',
    //   threads: 2,
    //   loaders: [{
    //     loader: 'babel-loader',
    //     options: {
    //       cacheDirectory: true,
    //       presets: [
    //         "react",
    //         "es2015"
    //       ],
    //       babelrc: false
    //     }
    //   }, {
    //     loader: 'ts-loader',
    //     options: {
    //       transpileOnly: true,
    //       onlyCompileBundledFiles: true,
    //       happyPackMode: true
    //     }
    //   }]
    // }),
    //new HardSourceWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    // new WebpackBar({
    //   profile: true
    // }),
    new DllReferencePlugin({
      manifest: require(path.join(__dirname, '../build/static/js/react.manifest.json'))
    }),
    // new AutoDllPlugin({
    //   inject: true,
    //   filename: '[name].js',
    //   entry: {
    //     react: [
    //       'react',
    //       'react-dom',
    //     ],
    //     polyfills: [
    //       'promise/lib/rejection-tracking',
    //       'promise/lib/es6-extensions.js',
    //       'whatwg-fetch',
    //       'object-assign',
    //       'react-dev-utils/webpackHotDevClient',
    //     ],
    //     antd: [
    //       'antd'
    //     ],
    //     editor: ['brace', 'react-ace'],
    //     utils: ['diff', 'diff2html', 'highlight.js', 'httpsnippet', 'react-copy-to-clipboard', 'react-intl', 'react-json-tree', 'react-perfect-scrollbar', 'react-sortable-hoc', 'react-syntax-highlighter', 'reflect-metadata', 'shellwords', 'shortid', 'uuid', 'lodash']
    //   }
    // })
    new DllReferencePlugin({
      manifest: require(path.join(__dirname, '../build/static/js/echart.manifest.json'))
    }),
    new DllReferencePlugin({
      manifest: require(path.join(__dirname, '../build/static/js/editor.manifest.json'))
    }),
    // new DllReferencePlugin({
    //   manifest: require(path.join(__dirname, '../build/static/js/antd.manifest.json'))
    // }),
    new DllReferencePlugin({
      manifest: require(path.join(__dirname, '../build/static/js/utils.manifest.json'))
    }),
    new DllReferencePlugin({
      manifest: require(path.join(__dirname, '../build/static/js/polyfill.manifest.json'))
    }),
    //new BundleAnalyzerPlugin()
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};