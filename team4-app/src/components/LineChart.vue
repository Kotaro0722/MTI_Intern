<template>
  <div>
    <GChart
      type="LineChart"
      :data="chartData"
      :options="chartOptions"
      :settings="chartSettings"
      style="width: 100%; height: 400px;"
    />
  </div>
</template>

<script>
import { GChart } from "vue-google-charts";
import { baseUrl } from "@/assets/config.js";

export default {
  components: {
    GChart,
  },
  data() {
    return {
    user: {
        userId: window.localStorage.getItem("userId"),
        password: null,
        nickname: null,
        age: null,
      },
      diary: [],
      
      chartData: null,
      chartOptions: {
        title: '今日の血中カフェイン濃度',
        legend: { position: 'bottom' },
        hAxis:{
          title:"Hour"
        },
        vAxis:{
          title:"Caffeine"
        },
        series: {
          0: { curveType: 'none', color: '#0000FF' },  // カフェインレベルのグラフ
          1: { type: 'line', color: '#FF0000', lineWidth: 2 }  // 垂直線としてのグラフ
        },
      },
      chartSettings: {
        packages: ['corechart'],
      },
    };
  },
  created:

    // apiからarticleを取得する
    async function () {
      try {
        /* global fetch */
        const res = await fetch(
          baseUrl + `/graph?userId=${this.user.userId}`,
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
        // const fetchedData = jsonData.map(item => [item[0], item[1]]);

        // chartDataを動的に更新
        const result=jsonData.result;
        // result.unshift(['hour', 'caffeine']);
        
        // 既存のコード
        const verticalLineHour = 23;  // 垂直線を引く時間
        const maxValue = Math.max(...result.map(item => item[1]));
        
        // グラフのデータ形式を整える
        const chartData = [['Hour', 'Caffeine Level', 'Sleep Time']];
        result.forEach(item => {
          const hour = parseInt(item[0], 10);  // 時間を取得
          const caffeineLevel = item[1];
          const verticalLine = hour === verticalLineHour ? maxValue : null; // 最高値までの線を描く
          chartData.push([hour, caffeineLevel, verticalLine]);
        });
        
        // 23時で始まり0から最大値までの線を描く
        chartData.push([verticalLineHour, null, 0]);
        chartData.push([verticalLineHour, null, maxValue]);
        
        this.chartData = chartData;
        // console.log(jsonData);
      } catch (e) {
        console.error(e);
        // エラー時の処理
      }
    }, // 記事一覧を取得する

};
</script>
