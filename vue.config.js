const path = require("path");

module.exports = {
  lintOnSave: false,
  devServer: {
    https: false,
    proxy: {
      "/api/": {
        target: "http://localhost:3000",
        logLevel: 'debug'
      },
    }
  }
};