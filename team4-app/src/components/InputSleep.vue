<template>
  <div class="ui segment">
    <form class="ui form" @submit.prevent="PostSleep">
      <div class="inline field">
        <label for="article-category">何時間寝ることができましたか？</label>
        <div class="ui left icon input">
          <i class="clock icon"></i>
          <input
            v-model="sleep.sleepTime"
            placeholder="時間(h)"
            type="number"
            name="article-content"
            min="0"
            required
          />
        </div>

      </div>

      <div class="inline field">
        <label for="article-category">何時に就寝しましたか？</label>

        <select v-model="sleep.sleepAt" required>
          <option v-for="time in timeOptions" :key="time" :value="time">
            {{ time }}
          </option>
        </select>
      </div>
      <div class="inline field">
        <label for="article-category">睡眠の質</label>
        <select id="dropdown" v-model="sleep.quality" required>
          <option value="1">悪かった</option>
          <option value="2">普通</option>
          <option value="3">快眠</option>
        </select>
      </div>

      <div class="right-align">
        <button
          class="ui orange button"
          type="submit"
        >
          投稿
        </button>
      </div>
    </form>
  </div>
</template>

<script>
// 必要なものはここでインポートする
// @は/srcの同じ意味です
// import something from '@/components/something.vue';
import { baseUrl } from "@/assets/config.js";
export default {
  name: "InputSleep",
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
        quality: null,
        createdAt: null,
      },
      timeOptions: this.generateTimeOptions(),
      errors: {
        sleepTime: null,
        sleepAt: null,
        quality: null,
      },
    };
  },
  computed: {},

  methods: {
    // Vue.jsで使う関数はここで記述する
    // isMyArticle(id) {}, // 自分の記事かどうかを判定する
    // async getArticles() {}, // 記事一覧を取得する
    generateTimeOptions() {
      const options = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 10) {
          const formattedTime = this.formatTime(hour, minute);
          options.push(formattedTime);
        }
      }
      return options;
    },
    formatTime(hour, minute) {
      const formattedHour = String(hour).padStart(2, "0");
      const formattedMinute = String(minute).padStart(2, "0");
      return `${formattedHour}:${formattedMinute}`;
    },

    validateFields() {
      this.errors.sleepTime = this.sleep.sleepTime ? null : "入力してください";
      this.errors.sleepAt = this.sleep.sleepAt ? null : "入力してください";
      this.errors.quality = this.sleep.quality ? null : "入力してください";

      return (
        !this.errors.sleepTime && !this.errors.sleepAt && !this.errors.quality
      );
    },


    async PostSleep() {
      const [hour, minute] = this.sleep.sleepAt.split(":").map(Number);
      const now = new Date();
      now.setHours(hour);
      now.setMinutes(minute);
      now.setSeconds(0);

      // Dateオブジェクトをタイムスタンプに変換する
      const sleepAtTimestamp = Math.floor(now.getTime() / 1000);

      const reqBody = {
        userId: this.user.userId,
        sleepTime: this.sleep.sleepTime,
        sleepAt: sleepAtTimestamp, // 変換されたタイムスタンプを使用
        quarity: this.sleep.quality,

      };

      try {
        const res = await fetch(baseUrl + "/sleep", {
          method: "POST",
          body: JSON.stringify(reqBody),
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage =
            jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }

        this.$router.go(0);
        // 成功時の処理
      } catch (e) {
        console.error(e);
        console.log("このエラーはバックエンドとの連携で解消されます");
      }

      return;
    },
  },
};
</script>

<style scoped>
/* このコンポーネントだけに適用するCSSはここに記述する */
</style>
