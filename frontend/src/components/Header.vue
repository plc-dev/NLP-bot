<template>
  <header>
    <nav>
      <div>How to Use</div>
      <div>Monitor</div>
      <div>Logout</div>
      <router-link to="/tutorial">Tutorial</router-link>|
      <router-link to="/monitor">Monitor</router-link>|
      <router-link to="/login">Logout</router-link>
    </nav>
  </header>
</template>

<script>
export default {
  name: "Header"
};
</script>

<style>
</style>
