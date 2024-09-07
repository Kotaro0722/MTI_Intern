const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "User";

exports.handler = async (event, context) => {
  //レスポンスの雛形
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  if (event.headers.authorization !== "mtiToken") {
    response.statusCode = 401;
    response.body = JSON.stringify({
      message: "ログインしてください",
    });
    return response;
  }

  const userId = event.queryStringParameters.userId || null; //見たいユーザのuserId

  if (!userId) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "userIdを入力してください",
    });
    return response;
  }

  //TODO: 取得対象のテーブル名と検索に使うキーをparamに宣言
  const param = {
    TableName,
    Key: marshall({
      userId,
    }),
  };

  // 指定したアイテムを取得するコマンドを用意
  const command = new GetItemCommand(param);

  try {
    //client.send()の実行でDBからデータを取得
    const user = (await client.send(command)).Item;

    if (!user) {
      throw new Error("userIdに合致するユーザが存在しません。");
    }

    //TODO: 条件に該当するデータがあればパスワードを隠蔽をする処理を記述
    delete user?.password;

    //TODO: レスポンスボディに取得したUserの情報を設定する
    response.body = JSON.stringify(unmarshall(user));
  } catch (e) {
    if (e.message == "userIdに合致するユーザが存在しません。") {
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
