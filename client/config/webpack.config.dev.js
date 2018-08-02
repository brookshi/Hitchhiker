'use strict';

const path = require('path');
const webpack = require('webpack');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');

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
    require.resolve('react-dev-utils/webpackHotDevClient'),
    require.resolve('./polyfills'),
    paths.appIndexJs
  ],
  output: {
    path: paths.appBuild,
    pathinfo: true,
    filename: 'static/js/bundle.js',
    publicPath: publicPath
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {}
  },
  mode: 'development',
  module: {
    noParse: /[\/\\]node_modules[\/\\]localforage[\/\\]dist[\/\\]localforage\.js$/,
    rules: [
      // {
      //   test: /\.(ts|tsx)$/,
      //   use: [{
      //     loader: 'tslint-loader',
      //     options: {
      //       enforce: 'pre'
      //     }
      //   }],
      //   include: paths.appSrc,
      // },
      // {
      //   exclude: [
      //     /\.html$/,
      //     /\.(js|jsx)(\?.*)?$/,
      //     /\.(ts|tsx)(\?.*)?$/,
      //     /\.less$/,
      //     /\.css$/,
      //     /\.json$/,
      //     /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      //     /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      //     /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      //     /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      //     /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      //   ],
      //   use: [getUrlLoader()],
      // },
      {
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
      },
      {
        test: /\.css$/,
        use: commonCssETP.extract({
          fallback: 'style-loader',
          use: [
            cssLoader,
            postcssLoader
          ]
        })
      },
      {
        test: /\.less$/,
        exclude: paths.appSrc,
        use: commonLessETP.extract({
          fallback: 'style-loader',
          use: [
            cssLoader,
            postcssLoader,
            commonLessLoader
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
      },
      // {
      //   test: /\.json$/,
      //   use: 'json-loader'
      // },
      // "file" loader for svg
      // {
      //   test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      //   use: [getUrlLoader('image/svg+xml')]
      // },
      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        use: [getUrlLoader('application/font-woff')]
      },
      // {
      //   test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      //   use: [getUrlLoader('application/octet-stream')]
      // },
      // {
      //   test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      //   use: [getUrlLoader('application/vnd.ms-fontobject')]
      // }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    //new InterpolateHtmlPlugin(env.raw),
    //commonCssETP,
    //commonLessETP,
    appETP,
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    new DllReferencePlugin({
      manifest: require(path.join(__dirname, '../build/static/js/react.manifest.json'))
    }),
    new DllReferencePlugin({
      manifest: require(path.join(__dirname, '../build/static/js/echart.manifest.json'))
    }),
    new DllReferencePlugin({
      manifest: require(path.join(__dirname, '../build/static/js/editor.manifest.json'))
    }),
    new DllReferencePlugin({
      manifest: require(path.join(__dirname, '../build/static/js/antd.manifest.json'))
    }),
    new DllReferencePlugin({
      manifest: require(path.join(__dirname, '../build/static/js/utils.manifest.json'))
    })
    //new BundleAnalyzerPlugin()
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};