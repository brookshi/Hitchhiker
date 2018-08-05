'use strict';

var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
var InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
var paths = require('./paths');
var getClientEnvironment = require('./env');
var shortId = require('shortid');


var publicPath = paths.servedPath;
var shouldUseRelativeAssetPaths = publicPath === './';
var publicUrl = publicPath.slice(0, -1);
var env = getClientEnvironment(publicUrl);

if (env.stringified['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.');
}

const cssFilename = 'static/css/[name].[contenthash:8].css';
var hash = shortId.generate();

var theme = require(paths.appPackageJson).theme;
if (theme['@icon-url']) {
  theme['@icon-url'] = theme['@icon-url'].replace('{hash}', hash)
}

const extractTextPluginOptions = shouldUseRelativeAssetPaths ? {
    publicPath: Array(cssFilename.split('/').length).join('../')
  } :
  undefined;

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
    fallback: paths.nodePaths,
    extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', ''],
    alias: {}
  },

  module: {
    preLoaders: [{
      test: /\.(ts|tsx)$/,
      loader: 'tslint',
      include: paths.appSrc,
    }],
    loaders: [
      // ** ADDING/UPDATING LOADERS **
      // The "url" loader handles all assets unless explicitly excluded.
      // The `exclude` list *must* be updated with every change to loader extensions.
      // When adding a new loader, you must add its `test`
      // as a new entry in the `exclude` list in the "url" loader.

      // "url" loader embeds assets smaller than specified size as data URLs to avoid requests.
      // Otherwise, it acts like the "file" loader.
      {
        exclude: [
          /\.html$/,
          /\.(js|jsx)$/,
          /\.(ts|tsx)$/,
          /\.less$/,
          /\.css$/,
          /\.json$/,
          /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        ],
        loader: 'url',
        query: {
          limit: 10000,
          name: `static/media/[name].${hash}.[ext]`
        }
      },
      // Compile .tsx?
      {
        test: /\.(ts|tsx)$/,
        include: paths.appSrc,
        loader: 'babel!ts'
      },
      // The notation here is somewhat confusing.
      // "postcss" loader applies autoprefixer to our CSS.
      // "css" loader resolves paths in CSS and adds assets as dependencies.
      // "style" loader normally turns CSS into JS modules injecting <style>,
      // but unlike in development configuration, we do something different.
      // `ExtractTextPlugin` first applies the "postcss" and "css" loaders
      // (second argument), then grabs the result CSS and puts it into a
      // separate file in our build process. This way we actually ship
      // a single CSS file in production instead of JS code injecting <style>
      // tags. If you use code splitting, however, any async bundles will still
      // use the "style" loader inside the async code so CSS from them won't be
      // in the main CSS file.
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          'style',
          'css?importLoaders=1!postcss',
          extractTextPluginOptions
        )
        // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
      },
      {
        test: /\.less$/,
        include: paths.appSrc,
        loader: 'style!css!postcss!less?strictMath=true'
      },
      {
        test: /\.less$/,
        exclude: paths.appSrc,
        loader: ExtractTextPlugin.extract(
          `${require.resolve('css-loader')}?` +
          `sourceMap&modules` +
          `${require.resolve('postcss-loader')}!` +
          `${require.resolve('less-loader')}?` +
          `{"sourceMap":true,"modifyVars":${JSON.stringify(theme)}}`
        )
      },
      // JSON is not enabled by default in Webpack but both Node and Browserify
      // allow it implicitly so we also enable it.
      {
        test: /\.json$/,
        loader: 'json'
      },
      // "file" loader for svg
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: `${require.resolve('url-loader')}?` +
          `limit=10000&minetype=image/svg+xml`,
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: `${require.resolve('url-loader')}?` +
          `limit=10000&name=static/fonts/[name].[ext]&minetype=application/font-woff`,
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: `${require.resolve('url-loader')}?` +
          `limit=10000&minetype=application/font-woff`,
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: `${require.resolve('url-loader')}?` +
          `limit=10000&minetype=application/octet-stream`,
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: `url-loader?limit=10000&minetype=application/vnd.ms-fontobject`,
      },
      // ** STOP ** Are you adding a new loader?
      // Remember to add the new extension(s) to the "url" loader exclusion list.
    ]
  },
  // We use PostCSS for autoprefixing only.
  postcss: function () {
    return [
      autoprefixer({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9', // React doesn't support IE8 anyway
        ]
      }),
    ];
  },
  plugins: [
    // Makes some environment variables available in index.html.
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In production, it will be an empty string unless you specify "homepage"
    // in `package.json`, in which case it will be the pathname of that URL.
    new InterpolateHtmlPlugin(env.raw),
    // Generates an `index.html` file with the <script> injected.
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
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    // It is absolutely essential that NODE_ENV was set to production here.
    // Otherwise React will be compiled in the very slow development mode.
    new webpack.DefinePlugin(env.stringified),
    // This helps ensure the builds are consistent if source hasn't changed:
    new webpack.optimize.OccurrenceOrderPlugin(),
    // Try to dedupe duplicated modules, if any:
    new webpack.optimize.DedupePlugin(),
    // Minify the code.
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true, // React doesn't support IE8
        warnings: false
      },
      mangle: {
        screw_ie8: true
      },
      output: {
        comments: false,
        screw_ie8: true
      }
    }),
    // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
    new ExtractTextPlugin(cssFilename),
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.
    new ManifestPlugin({
      fileName: 'asset-manifest.json'
    })
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};