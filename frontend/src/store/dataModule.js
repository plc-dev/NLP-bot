/* eslint-disable */
import axios from 'axios';

export default {
    namespaced: true,
  
    state: {
      logHistory: []
    },
    getters: {
        getLogHistory: state => {
            return state.logHistory
          }
    },
    mutations: {
      setLogHistory(state, logHistory) {
        state.logHistory = logHistory;
      }
    },
    actions: {
      async fetchLogHistory({ commit }) {
        const response = await axios.get('/api/subscribe', {});
        console.log(response.body);
        commit("setLogHistory", true);
      }
    }
  };
  