exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

try {
    // トークンがヘッダーに存在するか確認
    const token = event.headers.Authorization || event.headers.authorization;
    if (!token) {
      response.statusCode = 401;
      return response;
    }
    //リクエストボディをJavaScriptオブジェクトに変換
    const body = JSON.parse(event.body);
    
    //userIdとtextが存在するか確認
    if (!body.userId || !body.text) {
      response.statusCode = 400;
      return response;
    }
  　//タイムスタンプ作成
    const timestamp = Date.now();
    
    //登録した記事の内容(userId, timestamp, text, category)をレスポンスと して返す
    const resbody = {
      userId: body.userId,
      time: timestamp,
      text: body.text,
      category: body.category
    };
   //responseオブジェクトのbodyプロパティに文字列に変換した上で代入
    response.body = JSON.stringify({resbody});
  }catch(e){
    response.statusCode = 500;
  }
  
  return response;
};
