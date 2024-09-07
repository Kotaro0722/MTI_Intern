<template>
  <div>
    <div class="ui main container">
      <!-- 成功メッセージの表示 -->
      <div v-if="successMessage" class="ui positive message">
        <div class="message-header">{{ successMessage }}</div>
      </div>

      <!-- エラーメッセージの表示 -->
      <div v-if="errorMessage" class="ui negative message">
        <div class="message-header">{{ errorMessage }}</div>
      </div>

      <!-- 基本的なコンテンツはここに記載する -->
      <div class="ui segment">
        <!-- セグメントの中身を記述する -->
        <form class="ui large form" @submit.prevent="submit">
          <div class="field">
            <div class="ui left icon input">
              <i class="user icon"></i>
              <input v-model="user.userId" type="text" placeholder="ID" required disabled>
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="lock icon"></i>
              <input v-model="user.password" type="password" placeholder="Password">
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="tag icon"></i>
              <input v-model="user.nickname" type="text" placeholder="Nickname">
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="calendar icon"></i>
              <input v-model.number="user.age" type="text" placeholder="Age">
            </div>
          </div>
          <button class="ui blue huge fluid button" type="submit" :disabled="!canSubmit">
            更新
          </button>
        </form>
      </div>
      <button @click="deleteUser" class="ui grey fluid button" type="submit">
        退会
      </button>
    </div>
  </div>
</template>

<script>
import { baseUrl } from '@/assets/config.js';

export default {
  name: 'Profile',

  data() {
    return {
      user: {
        userId: window.localStorage.getItem("userId"),
        password: '',
        nickname: '',
        age: null,
      },
      successMessage: '', // 成功メッセージ用の変数
      errorMessage: '',   // エラーメッセージ用の変数
    };
  },

  computed:{
    canSubmit() {
        return this.user.userId && this.user.userId.trim() !== '' &&
               this.user.password && this.user.password.trim() !== '' &&
               this.user.nickname && this.user.nickname.trim() !== '' &&
               this.user.age !== null;
    }
  },
  methods: {
    async submit() {
      const headers = {
        'Authorization': window.localStorage.getItem('token'),
        'Content-Type': 'application/json',
      };

      const { userId, password, nickname, age } = this.user;
      const reqBody = {
        userId,
        password,
        nickname,
        age,
      };

      try {
        const res = await fetch(baseUrl + '/user', {
          method: 'PUT',
          body: JSON.stringify(reqBody),
          headers,
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};

        if (!res.ok) {
          const errorMessage = jsonData.message ?? 'エラーメッセージがありません';
          this.errorMessage = errorMessage;
          this.successMessage = ''; // 成功メッセージをリセット
          throw new Error(errorMessage);
        }

        // 更新成功メッセージを設定
        this.successMessage = 'プロフィールが正常に更新されました。';
        this.errorMessage = ''; // エラーメッセージをリセット
      } catch (e) {
        console.error(e);
      }
    },
    async deleteUser() {
      const headers = {
        'Authorization': window.localStorage.getItem('token'),
      };

      try {
        const res = await fetch(`${baseUrl}/user?userId=${this.user.userId}`, {
          method: 'DELETE',
          headers,
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};

        if (!res.ok) {
          const errorMessage = jsonData.message ?? 'エラーメッセージがありません';
          throw new Error(errorMessage);
        }

        this.$router.push({ name: 'Login' });
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
  },
};
</script>

<style scoped>
/* メッセージのスタイルをカスタマイズ */
.message-header {
  font-size: 1.2em;
  font-weight: bold;
}
</style>