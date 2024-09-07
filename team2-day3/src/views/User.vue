<template>
  <div>
    <div class="ui main container">
      <div class="ui segment">
        <form class="ui form">
          <div class="field">
            <label for="nickname">ユーザ名</label>
            <input for="nickname" type="text" name="nickname" placeholder="Nickname" />
          </div>
          
          <div class="field">
            <label>年齢</label>
            <div class="inline fields">
              <div class="field">
                <input v-model.number="start" type="text" name="agestart" />
                <label for="agestart">歳から</label>
              </div>
              
              <div class="field">
                <input v-model.number="end" type="text" name="ageend" />
                <label for="ageend">歳まで</label>
              </div>
            </div>
          </div>
        </form>
      </div>
      <!-- 基本的なコンテンツはここに記載する -->
      <ul class="ui three column grid">
        <template v-for="(item, index) in filteredUsers" :key="index">
          <li class="column">
            <div class="ui card fluid">
              <div class="content">
                <h2 class="header">
                  {{ item.nickname }}
                <span class="ui green label">{{ item.age }}</span>
                </h2>
                <span class="meta">{{ item.userId }}</span>
              </div>
            </div>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
// 必要なものはここでインポートする
// @は/srcの同じ意味です
// import something from '@/components/something.vue';
import { baseUrl } from '@/assets/config.js';

const headers = { 
  Authorization: window.localStorage.getItem('token'),
  userId:window.localStorage.getItem('userId'),
};

export default {
  name: 'User',

  components: {
    // 読み込んだコンポーネント名をここに記述する
  },

  data() {
    // Vue.jsで使う変数はここに記述する
    return {
      users: [],
      nickname:null,
      start:0,
      end:100,
      errorMessage :''
    };
  },


  computed: {
    // 計算した結果を変数として利用したいときはここに記述する
    filteredUsers() {
      return this.users.filter((e) => {
        // nicknameのマッチングチェック
        const matchNickname = this.nickname
          ? e.nickname?.match(this.nickname)
          : true;

        // ageの範囲チェック
        const withinAgeRange =
          (this.start ? e.age >= this.start : true) &&
          (this.end ? e.age <= this.end : true);

        return matchNickname && withinAgeRange;
      });
    },
  },

  methods: {
  },

  created: async function(){
    this.isCallApi = true;
    
    try{
      const res = await fetch(baseUrl + '/users', {
        method:'GET',
        headers
      });
      
      const text = await res.text();
      const jsonData = text ? JSON.parse(text): {}
      console.log(jsonData.users);
      
      if(!res.ok){
        const errorMessage = jsonData.message ?? 'error message is not defined';
        throw new Error(errorMessage);
      }
      
      this.users = jsonData.users ?? [];
    }catch(e){
    }
  },
};
</script>

<style scoped>
/* このコンポーネントだけに適用するCSSはここに記述する */
</style>
