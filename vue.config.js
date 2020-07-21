const path = require("path");
module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        "components": path.resolve(__dirname, "src/components"),
        "views": path.resolve(__dirname, "src/views"),
        "assets": path.resolve(__dirname, "src/assets"),
        "types": path.resolve(__dirname, "src/types")
      }
    }
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: "@import 'src/assets/styles/main.scss';"
      }
    }
  }
};
