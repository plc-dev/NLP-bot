const path = require("path");

module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:8088"
      }
    }
  },
  outputDir: path.resolve(__dirname, "../server/public")
};
