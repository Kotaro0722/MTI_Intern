<template>
  <div>
    <div class="ui main container">
      <!-- 基本的なコンテンツはここに記載する -->
      <LineChart />
      
      <div class="ui segment">
        <form class="ui form" @submit.prevent="postArticle">
          <h3 class="ui dividing header">カフェイン コレクション</h3>

          <div>
            <label for="dropdown">カフェイン飲料の種類:</label>
            <select v-model="diary.drinkType" id="dropdown" style="width: 50%">
              <option
                v-for="option in options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.text }}
              </option>
            </select>
          </div>

          <label>カフェイン飲料の摂取量:</label>
          <div class="field">
            <div class="ui left icon input">
              <i class="coffee icon"></i>
              <input
                v-model="diary.drinkAmount"
                type="number"
                name="intake"
                placeholder="摂取量(ml)"
                style="width: 50%"
              />
            </div>
          </div>
           <div class="inline field">

            <label for="article-category">何時に飲みましたか？</label>
            <input v-model="diary.createdAt" type="datetime-local" required>
          
      
      </div>

          <div class="right-align">
            <button
              class="ui orange button"
              v-bind:disabled="isPostButtonDisabled"
              type="submit"
            >
              記入
            </button>
          </div>
        </form>
      </div>

      <h3 class="ui dividing header">カフェイン コレクション一覧</h3>
      <div class="ui three stackable cards">
        <template v-for="(diaries, index) in diary" :key="index">
          <div class="card">
            <div class="content">
              <div class="header">日時: {{ formatTimestamps(diaries.createdAt) }}</div>
              <div class="description">
                <p class="bold-text">カフェイン飲料 : {{ diaries.drinkType }}</p>
                <p class="bold-text">摂取量 : {{ diaries.drinkAmount }}mL</p>
                <p class="bold-text">カフェイン量 : {{ diaries.caffeineAmount }}mg</p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
// 必要なものはここでインポートする
// @は/srcと同じ意味です

// import something from '@/components/something.vue';


import LineChart from "@/components/LineChart.vue";
import { baseUrl } from "@/assets/config.js";

// const headers = {'Authorization' : 'mtiToken'};

export default {
  name: "Home",

  components: {

   
    LineChart,

    // 読み込んだコンポーネント名をここに記述する
  },

  data() {
    // Vue.jsで使う変数はここに記述する
    return {
      post: {
        text: null,
        category: null,
      },
      search: {
        userId: null,
        category: null,
        start: null,
        end: null,
      },

      //追加
      user: {
        userId: window.localStorage.getItem("userId"),
        password: null,
        nickname: null,
        age: null,
      },
      diary:[],
      
      diaries: {
        drinkType: null,
        drinkAmount: null,
        caffeineAmount: null,
        createdAt: null,
      },
      

      articles: [],
      iam: null,

      selectedOption: "",
      options: [
        { value: "コーヒー", text: "コーヒー" },

        { value: "玉露", text: "玉露" },
        { value: "紅茶", text: "紅茶" },
        { value: "せん茶", text: "せん茶" },
        { value: "ほうじ茶", text: "ほうじ茶" },

      ],
    };
  },
  computed: {
    // 計算した結果を変数として利用したいときはここに記述する
  },


  created:

    // apiからarticleを取得する
    async function () {
      try {
        /* global fetch */
        const res = await fetch(
          baseUrl + `/diaries?userId=${this.user.userId}`,
          {
            method: "GET",
          },
        );

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};
        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage =
            jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }
        if (Array.isArray(jsonData)) {
          this.diary = jsonData; // 複数のデータを一度に取得する場合
        } else {
          this.diary.push(jsonData); // 単一のデータを取得する場合
        }

        // 成功時の処理
        //this.users = jsonData.users ?? [];
        
      } catch (e) {
        console.error(e);
        // エラー時の処理
      }
    }, // 記事一覧を取得する

  methods: {
  
    // Vue.jsで使う関数はここで記述する
    // isMyArticle(id) {}, // 自分の記事かどうかを判定する
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
    // 記事一覧を取得する
    formatTimestamps(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 月は0から始まるので+1する
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${year}年${month}月${day}日 ${hours}時${minutes}分`;
  },

    


    async postArticle() {
      const date = new Date(this.diary.createdAt);
      const timestamp = date.getTime();
      if (this.isCallingApi) {
        return;
      }
      this.isCallingApi = true;
      const [hour, minute] = this.diary.createdAt.split(":").map(Number);
      

      // Dateオブジェクトをタイムスタンプに変換する
      

      const reqBody = {
        userId: this.user.userId,
        drinkType: this.diary.drinkType,
        drinkAmount: this.diary.drinkAmount,
        createdAt:timestamp
      };
      try {
        /* global fetch */
        const res = await fetch(baseUrl + "/diary", {
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

        this.successMsg = "記事が投稿されました！";
        this.diary.drinkType = "";
        this.diary.drinkAmount = "";
        window.location.reload();
      } catch (e) {
        console.error(e);
        this.errorMsg = e;
      }
    }, // 記事を作成する
    // async getSearchedArticles() {}, // 記事を検索する
    // async deleteArticle(article) {}, // 記事を削除する
    // convertToLocaleString(timestamp) {} // timestampをLocaleDateStringに変換する

    // ドロップダウンの表示/非表示を切り替え
    toggleDropdown() {
      // ドロップダウンの表示/非表示を切り替え
      this.isDropdownVisible = !this.isDropdownVisible;
    },
    selectOption(option) {
      // 選択されたオプションを設定し、ドロップダウンを閉じる
      this.selectedOption = option;
      this.isDropdownVisible = false;
    },
  },
};
</script>


<style scoped>
.bold-text {
  font-weight: bold;
}
</style>

