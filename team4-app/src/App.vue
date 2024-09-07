<template>
  <div id="app">
    <Menu v-if="isHiddenPath" />
    <router-view />
  </div>
</template>
<script>
import { RouterView } from "vue-router";
import Menu from "@/components/Menu.vue";

export default {
  name: "App",
  components: {
    Menu,
  },
  computed: {
    isHiddenPath() {
      return this.$route.path !== "/login";
    },
  },
};
</script>
