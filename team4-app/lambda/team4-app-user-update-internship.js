const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "User";

/*** 通常版の解答例(発展課題を含む最終版は下にあります。) ***/
exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  // { varName }のような形式を分割代入と呼び、右側のオブジェクトの中からvarNameプロパティを変数varNameとして切り出すことができる
  // (https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
  if (event.headers.authorization !== "mtiToken") {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "ログインしてください",
    });
    return response;
  }

  const body = event.body ? JSON.parse(event.body) : null;

  if (!body || !body.userId || !body.age || !body.nickname || !body.password) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message:
        "無効なリクエストです。request bodyに必須パラメータがセットされていません。",
    });
    return response;
  }

  const { userId, age, nickname, password } = body;
  const param = {
    // ↓プロパティ名と変数名が同一の場合は、値の指定を省略できる。
    TableName, // TableName: TableNameと同じ意味
    Item: marshall({
      userId, // userId: userIdと同じ意味
      age, // age: ageと同じ意味
      nickname, // nickname: nicknameと同じ意味
      password, // password: passwordと同じ意味
    }),
  };

  const command = new PutItemCommand(param);

  try {
    await client.send(command);
    response.body = JSON.stringify({ userId, age, nickname });
  } catch (e) {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};
