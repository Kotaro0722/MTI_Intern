<template>
  <div id="app">
    <!-- 現在のルートが 'Login' ではない場合にのみメニューバーを表示 -->
    <Menu v-if="!isLoginPage" />
    <router-view />
  </div>
</template>

<script>
  import {RouterView} from 'vue-router'
  import Menu from '@/components/Menu.vue';
  
  export default {
    components: {
      Menu,
    },
    computed: {
      isLoginPage() {
        // 現在のルートが 'Login' かどうかを判定
        return this.$route.name === 'Login';
      },
    },
    mounted() {
      this.checkAuthToken();
    },
    methods: {
      checkAuthToken() {
        const token = window.localStorage.getItem('token');
        if (!token && this.$route.name !== 'Login') {
          // トークンが存在しない場合、ログインページにリダイレクト
          this.$router.push({ name: 'Login' });
        }
      },
    },
  };
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>