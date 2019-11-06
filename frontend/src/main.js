import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

store.dispatch("user/validateSession", { user: "", password: "" });

router.beforeEach((to, from, next) => {
  if (to.meta.loggedIn === true) {
    if (store.state.user.loggedIn) {
      next();
    } else {
      next("/login");
    }
  } else if (to.meta.loggedIn === false) {
    if (!store.state.user.loggedIn) {
      next();
    } else {
      next("/monitor");
    }
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
