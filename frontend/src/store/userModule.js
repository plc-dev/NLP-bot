/* eslint-disable */
import axios from 'axios';

export default {
  namespaced: true,

  state: {
    token: localStorage.getItem(token) ? localStorage.getItem(token) : '',
    loggedIn: false,
    publicVapidKey: "BCcYII2g5YLqPpfsTkaGkNO_wBCqLCeKxYFCrhlWu6eA2vZu2m7n9fP1BgesdfWdDVRbj-ueuZSvXQXeloB0sLM"
  },
  mutations: {
    setLogin(state, login) {
      state.loggedIn = login;
    },
    setToken(state, token) {
      state.token = token;
    }
  },
  actions: {
    async login({ state,commit }, ) {
      const token = state.token;
        const bearerHeader = "Bearer " + token;
        try {
            const response = await axios.get('/api/salesConfig', {
              headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                "Authorization": bearerHeader
              }
            });
            commit('setProducts', products);
        } catch (err) {
            // eslint-disable-next-line
            console.log('Error: ', err);
        }
    },
    async validateSession({ commit }, authData) {
      const payload = {
        user: authData.user,
        password: authData.password
      };
      try {
        const result = await axios.post('/api/auth', {
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        commit("setLogin", result);
      } catch (err) {
        commit("setLogin", false);
      }
    },
    signOut({commit}) {
      commit("setLogin", false);
      location.reload();
    }
  }
};
