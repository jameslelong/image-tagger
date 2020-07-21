import Vue from "vue";
// Global Styles
import "normalize.css";
// View
import Home from "views/home/home.vue";

Vue.config.productionTip = false;

new Vue({
  render: h => h(Home)
}).$mount("#app");
