<template>
  <div class="ui secondary pointing brown inverted massive menu">
    <router-link active-class="active" class="item" exact to="/"
      >Home</router-link
    >
    <router-link active-class="active" class="item" to="/concierge"
      >Concierge</router-link
    >
    <router-link active-class="active" class="item" to="/profile"
      >Profile</router-link
    >
    <div class="right menu">
      <a @click="logout" class="item">Logout</a>
    </div>
  </div>
</template>
<script>
export default {
  name: "Menu",
  computed: {},
  methods: {
    logout() {
      window.localStorage.clear();
      this.$router.push({ name: "Login" });
    },
  },
};
</script>
<style scoped></style>
