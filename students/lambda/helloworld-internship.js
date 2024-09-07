exports.handler = async (event, context) => {
  //レスポンスの雛形
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };

  //レスポンスボディにJSON形式の文字列を代入
  response.body = JSON.stringify({ message: "Hello World!" });
  
  // レスポンスを返す
  return response;
};
