const path = require("path");

module.exports = {
  lintOnSave: false,
  devServer: {
    https: false,
    proxy: {
      "/api/": {
        target: "http://192.168.0.155:3000",
        logLevel: 'debug'
      },
    }
  }
};
