const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "User";

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  // TODO: リクエストボディの中身をJavaScriptオブジェクトに変換し、1つ、あるいは複数の変数に代入する
  const body = event.body ? JSON.parse(event.body) : null;
  if (!body || !body.userId || !body.password) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message:
        "無効なリクエストです。request bodyに必須パラメータがセットされていません。",
    });
    return response;
  }

  // TODO: query()に渡すパラムを宣言
  const param = {
    TableName,
    //キー、インデックスによる検索の定義
    KeyConditionExpression: "userId=:uid",
    //プライマリーキー以外の属性でのフィルタ
    FilterExpression: "password=:pkey",
    //検索値のプレースホルダの定義
    ExpressionAttributeValues: marshall({
      ":uid": body.userId,
      ":pkey": body.password,
    }),
  };

  // userIdとpasswordが一致するデータを検索するコマンドを用意
  const command = new QueryCommand(param);
  try {
    // client.send()の実行でuserIdとpasswordが一致するデータの検索
    const res = await client.send(command);

    //TODO: 該当するデータが見つからない場合の処理を記述(ヒント：resの中には個数のプロパティが入っています。)
    const foundCount = res.Count;
    if (foundCount == 0) {
      throw new Error("userIdまたはpasswordが一致しません");
    }
    response.body = JSON.stringify({ token: "mtiToken" });
    //TODO: 認証が成功した場合のレスポンスボディを設定する。
  } catch (e) {
    if (e.message == "userIdまたはpasswordが一致しません") {
      response.statusCode = 401;
      response.body = JSON.stringify({ message: e.message });
    } else {
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: "予期せぬエラーが発生しました。",
        errorDetail: e.toString(),
      });
    }
  }

  return response;
};
