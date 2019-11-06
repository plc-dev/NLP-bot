<template>
  <div class="login">
    <img alt="Vue logo" src="img/icons/android-chrome-512x512.png" />
    <div id="login">
      <input type="text" />
      <input type="password" />
      <button id="submit" class="button">Login</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "login"
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
