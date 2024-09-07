<template>
  <div>
    <div class="ui main container">
      <!-- 基本的なコンテンツはここに記載する -->
      <div v-if="errorMessage" class="ui error message">
        <p>{{ errorMessage }}</p>
      </div>
      <div class="ui segment">
        <form class="ui large form" @submit.prevent="submit">
          <div class="field">
            <div class="ui left icon input">
              <i class="user icon"></i>
              <input v-model="user.userId" type="text" placeholder="ID">
            </div>
          </div>
          
          <div class="field">
            <div class="ui left icon input">
              <i class="lock icon"></i>
              <input v-model="user.password" type="password" placeholder="Password">
            </div>
          </div>
            
          <div class="field" v-if="!isLogin">
            <div class="ui left icon input">
              <i class="tag icon"></i>
              <input v-model="user.nickname" type="text" placeholder="Nickname">
            </div>
          </div>
            
          <div class="field" v-if="!isLogin">
            <div class="ui left icon input">
              <i class="calendar icon"></i>
              <input v-model.number="user.age" type="text" placeholder="Age">
            </div>
          </div>
          <button class="ui blue huge fluid button" type="submit" :disabled="!canSubmit">
            {{ submitText }}
          </button>
        </form>
      </div>
      <button @click="toggleMode" class="ui grey fluid button" type="button">
        {{ toggleText }}
      </button>
    </div>
        <div v-if="isLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> ロード中...
    </div>
  </div>
</template>

<script>
import { baseUrl } from '@/assets/config.js';

export default {
  name: 'Login',

  data() {
    return {
      isLogin: true,
      isLoading: false,
      user: {
        userId: '',
        password: '',
        nickname: '',
        age: null,
      },
      errorMessage:''
    };
  },

  computed: {
    submitText() {
      return this.isLogin ? 'ログイン' : '新規登録';
    },
    toggleText() {
      return this.isLogin ? '新規登録' : 'ログイン';
    },
    canSubmit() {
      // モードに応じて必要なフィールドが全て入力されているかチェック
      if (this.isLogin) {
        return this.user.userId && this.user.userId.trim() !== '' &&
               this.user.password && this.user.password.trim() !== '';
      } else {
        return this.user.userId && this.user.userId.trim() !== '' &&
               this.user.password && this.user.password.trim() !== '' &&
               this.user.nickname && this.user.nickname.trim() !== '' &&
               this.user.age !== null;
      }
    }
  },

  methods: {
    toggleMode() {
      this.isLogin = !this.isLogin;
    },

    async submit() {
      this.isLoading = true;
      const endpoint = this.isLogin ? '/user/login' : '/user/signup';
      const requestBody = { ...this.user };

      try {
        const res = await fetch(baseUrl + endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};

        if (!res.ok) {
          const errorMessage = jsonData.message ?? 'エラーメッセージがありません';
          throw new Error(errorMessage);
        }

        // トークンとユーザーIDをローカルストレージに保存
        window.localStorage.setItem('token', jsonData.token);
        window.localStorage.setItem('userId', this.user.userId);

        // ログインまたは新規登録後にホームにリダイレクト
        this.$router.push({ name: 'Home' });
      } catch (e) {
        this.errorMessage = e.message;
      }finally{
        this.isLoading=false;
      }
    }
  },
};
</script>

<style scoped>
/* このコンポーネントだけに適用するCSSはここに記述する */
</style>