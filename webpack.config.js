module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules(?!\/quill-image-drop-module|quill-image-resize-module)/,
      loader: 'babel-loader',
      query: {...}
    }
  ]
}
plugins: [
  new webpack.ProvidePlugin({
    'window.Quill': 'quill'
  })
]

const { paths } = require('react-app-rewired');
// require normalized overrides
const overrides = require('react-app-rewired/config-overrides');
const config = require(paths.scriptVersion + '/config/webpack.config.dev');

module.exports = overrides.webpack(config, process.env.NODE_ENV);
