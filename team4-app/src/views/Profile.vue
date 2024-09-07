<template>
  <div>
    <div class="ui main container">
      <!-- 基本的なコンテンツはここに記載する -->
      <div class="ui segment">
        <form class="ui large form" @submit.prevent="submit">
          <div class="field">
            <div class="ui left icon input">
              <i class="user icon"></i>
              <input
                type="text"
                placeholder="ID"
                v-model="user.userId"
                required
                disabled
              />
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="lock icon"></i>
              <input
                type="password"
                placeholder="password"
                v-model="user.password"
              />
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="tag icon"></i>
              <input
                type="text"
                placeholder="Nickname"
                v-model="user.nickname"
              />
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="calendar icon"></i>
              <input type="text" placeholder="age" v-model.number="user.age" />
            </div>
          </div>

          <button
            class="ui fluid green huge button"
            type="submit"
            :disabled="isButtonDisable"
          >
            更新
          </button>
        </form>
      </div>
      <button
        @click="deleteUser"
        class="ui huge gray fluid button"
        type="submit"
      >
        退会
      </button>
    </div>
  </div>
</template>

<script>
// 必要なものはここでインポートする
// @は/srcの同じ意味です
// import something from '@/components/something.vue';
import { baseUrl } from "@/assets/config.js";

export default {
  name: "Profile",

  components: {
    // 読み込んだコンポーネント名をここに記述する
  },

  data() {
    // Vue.jsで使う変数はここに記述する
    return {
      user: {
        userId: window.localStorage.getItem("userId"),
        password: null,
        nickname: null,
        age: null,
      },
    };
  },

  computed: {
    // 計算した結果を変数として利用したいときはここに記述する
    isButtonDisable() {
      return !this.user.password || !this.user.nickname || !this.user.age;
    },
  },

  methods: {
    // Vue.jsで使う関数はここで記述する
    async submit() {
      const headers = { Authorization: "mtiToken" };
      // リクエストボディを指定する
      const { userId, password, nickname, age } = this.user;
      const requestBody = {
        userId,
        password,
        nickname,
        age,
      };

      try {
        /* global fetch */
        const res = await fetch(baseUrl + "/user", {
          method: "PUT",
          body: JSON.stringify(requestBody),
          headers,
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage =
            jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }

        // 成功時の処理
      } catch (e) {
        console.error(e);
        // エラー時の処理
      }
    },
    async deleteUser() {
      const headers = { Authorization: "mtiToken" };

      try {
        /* global fetch */
        const res = await fetch(baseUrl + `/user?userId=${this.user.userId}`, {
          method: "DELETE",
          headers,
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage =
            jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }

        // 成功時の処理
        this.$router.push({ name: "Login" });
        window.localStorage.clear();
      } catch (e) {
        console.error(e);
        // エラー時の処理
      }
    },
  },

  created: async function () {
    if (!window.localStorage.getItem("token")) {
      this.$router.push({ name: "Login" });
    }

    const headers = { Authorization: "mtiToken" };

    try {
      /* global fetch */
      const res = await fetch(baseUrl + `/user?userId=${this.user.userId}`, {
        method: "GET",
        headers,
      });

      const text = await res.text();
      const jsonData = text ? JSON.parse(text) : {};

      // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
      if (!res.ok) {
        const errorMessage = jsonData.message ?? "エラーメッセージがありません";
        throw new Error(errorMessage);
      }

      // 成功時の処理
      this.user.nickname = jsonData.nickname;
      this.user.age = jsonData.age;
    } catch (e) {
      console.error(e);
      // エラー時の処理
    }
  },
};
</script>

<style scoped>
/* このコンポーネントだけに適用するCSSはここに記述する */
</style>
