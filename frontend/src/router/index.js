import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../views/Login.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "landing",
    meta: { loggedIn: true },
    component: () => import(/* webpackChunkName: "about" */ "../views/Landing.vue")
  },
  {
    path: "/login",
    name: "login",
    meta: { loggedIn: false },
    component: Login
  },
  {
    path: "/monitor",
    name: "monitor",
    meta: { loggedIn: true },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ "../views/Monitor.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
