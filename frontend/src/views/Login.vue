<template>
  <div class="login">
    <div class="error" v-if="error">Login failed!</div>
    <div id="login">
      <input v-model="username" placeholder="User" type="text" />
      <input v-model="password" placeholder="Password" type="password" />
      <button id="submit" @click.prevent="submitForm" class="button">Login</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      username: "",
      password: "",
      error: false
    };
  },
  methods: {
    async submitForm() {
      if (await this.$store.dispatch("user/signIn", { username: this.username, password: this.password })) {
        this.error = false;
        this.$router.push("/");
      } else {
        this.error = true;
      }
    }
  }
};
</script>

<style>
#login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#login input {
  width: 30vw;
}

#submit {
  width: 30vw;
}
</style>
