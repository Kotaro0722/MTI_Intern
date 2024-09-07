<template>
  <div>
    <div class="ui main container">
      <!-- 基本的なコンテンツはここに記載する -->
      <InputSleep />
      <SleepView />
      
    </div>
  </div>
</template>

<script>
// 必要なものはここでインポートする
// @は/srcの同じ意味です
import InputSleep from "@/components/InputSleep.vue";
import SleepView from "@/components/SleepView.vue";
import { baseUrl } from "@/assets/config.js";

export default {
  name: "Concierge",

  components: {
    SleepView,
    InputSleep
    // 読み込んだコンポーネント名をここに記述する
  },

  data() {
    // Vue.jsで使う変数はここに記述する
    return {
      users: [],
      nickname: "",
      start: 0,
      end: 100,
    };
  },

  computed: {
    // 計算した結果を変数として利用したいときはここに記述する
    filteredUsers() {
      return this.users.filter((e) => {
        const matchNickname = this.nickname
          ? e.nickname?.match(this.nickname)
          : true;

        const withinAgeRange =
          (this.start ? e.age >= this.start : true) &&
          (this.end ? e.age <= this.end : true);

        return matchNickname && withinAgeRange;
      });
    },
  },

  methods: {
    // Vue.jsで使う関数はここで記述する
  },

  };
</script>

<style scoped>
/* このコンポーネントだけに適用するCSSはここに記述する */
</style>
