module.exports = function (api) {
  api.cache(true);

  const presets = [];
  const plugins = ['babel-plugin-react-compiler'];

  return {
    presets,
    plugins
  };
}