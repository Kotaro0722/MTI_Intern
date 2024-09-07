<template>
  <div class="ui main container">
    <div class="ui three stackable cards">
      <template v-for="(sleep, index) in sleeps" :key="index">
        <div class="card">
          <div class="content">
            <div class="header">{{ formatTimestamps(sleep.createdAt) }}</div>

            <div class="description">
              <p class="bold-text">
                何時間寝れましたか？:{{ sleep.sleepTime }}時間
              </p>
              <p class="bold-text">
                就寝時間: {{ formatTimestamp(sleep.sleepAt * 1000) }}
              </p>
              <p class="bold-text">
                睡眠の質: {{ formatQuality(sleep.quarity) }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
// 必要なものはここでインポートする
// @は/srcの同じ意味です
// import something from '@/components/something.vue';
import { baseUrl } from "@/assets/config.js";
export default {
  name: "SleepView",
  data() {
    // Vue.jsで使う変数はここに記述する
    return {
      user: {
        userId: window.localStorage.getItem("userId"),
        password: null,
        nickname: null,
        age: null,
      },

      sleep: {
        sleepTime: null,
        sleepAt: null,
        quarity: null,
        createdAt: null,
      },
      sleeps: [],

      errors: {
        sleepTime: null,
        sleepAt: null,
        quality: null,
      },
    };
  },
  computed: {},

  methods: {
    async fetchSleepData() {
      try {
        const res = await fetch(baseUrl + `/sleep?userId=${this.user.userId}`, {
          method: "GET",
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : [];

        if (!res.ok) {
          const errorMessage =
            jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }
        // 新しいデータを配列に追加
        if (Array.isArray(jsonData)) {
          this.sleeps = jsonData; // 複数のデータを一度に取得する場合
        } else {
          this.sleeps.push(jsonData); // 単一のデータを取得する場合
        }
      } catch (e) {
        console.error(e);
      }
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours}時${minutes}分`;
    },
    formatTimestamps(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 月は0から始まるので+1する
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}年${month}月${day}日`;
    },
    formatQuality(quarity) {
      switch (quarity) {
        case 1:
          return "悪かった";
        case 2:
          return "普通";
        case 3:
          return "快眠";
        default:
          return "不明";
      }
    },
  },
  created: async function () {
    if (!window.localStorage.getItem("token")) {
      this.$router.push({ name: "Login" });
    }

    this.fetchSleepData(); // コンポーネント作成時にデータを取得
  },
};
</script>

<style scoped>
.bold-text {
  font-weight: bold;
}
</style>
