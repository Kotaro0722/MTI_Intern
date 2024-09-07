exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };
  
  //TODO: 任意の変数にクエリストリングのnameに該当する値を代入してください。

  //TODO: responseオブジェクトのbodyプロパティに↑の変数を文字列に変換した上で代入してください。
  
  return response;
};
