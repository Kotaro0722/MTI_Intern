<template>
  <div></div>
</template>

<script>
import { baseUrl } from "@/assets/config.js";

export default {
  name: "Template",

  data() {
    return {};
  },

  computed: {},

  methods: {
    async deleteRequestTemplate() {
      // headerを指定する
      const headers = { Authorization: "mtiToken" };

      const queryParam1Value = "value1";

      try {
        /* global fetch */
        const res = await fetch(`${baseUrl}/test?$param1=${queryParam1Value}`, {
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
      } catch (e) {
        console.error(e);
        // エラー時の処理
      }
    },
  },
};
</script>

<style scoped></style>
