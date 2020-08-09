const path = require("path");
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/image-tagger/' : '/',
  configureWebpack: {
    resolve: {
      alias: {
        "components": path.resolve(__dirname, "src/components"),
        "views": path.resolve(__dirname, "src/views"),
        "services": path.resolve(__dirname, "src/services"),
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
