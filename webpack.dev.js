'use strict';
var path = require('path');
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.common');

const compiler = Webpack(webpackConfig);
const devServerOptions = Object.assign({}, webpackConfig.devServer, {
  stats: {
    colors: true
  },
  contentBase: path.join(__dirname, 'modules'),
  watchContentBase: true,
  compress: true,
  historyApiFallback: true,
  disableHostCheck: true //Access Site outside VM
});
const server = new WebpackDevServer(compiler, devServerOptions);

server.listen(80, () => {
  console.log('Starting server on http://localhost:80');
});
