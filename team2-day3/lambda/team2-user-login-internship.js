const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "User";
const crypto = require('crypto');

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  const body = event.body ? JSON.parse(event.body) : null;

  if (!body) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なリクエストです。リクエスト内容が空です",
    });
    return response;
  }

  const reqfield = ["userId", "password"];
  const check = reqfield.filter(field => !body[field]);
  if (check.length > 0) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なリクエストです。必須パラメータが不足しています",
    });
    return response;
  }

  const param = {
    TableName,
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: marshall({
      ":uid": body.userId,
    }),
  };

  const command = new QueryCommand(param);
  try {
    const res = await client.send(command);

    if (res.Count === 0) {
      response.statusCode = 401;
      response.body = JSON.stringify({ message: "userIdが存在しません" });
    } else {
      const item = unmarshall(res.Items[0]);
      const storedPassword = item.password;

      // 保存されたパスワードからソルトとハッシュを分割
      const salt = storedPassword.slice(0, 64);  // ソルトは最初の64文字（32バイトの16進数表現）
      const storedHash = storedPassword.slice(64);  // 残りがハッシュ

      // ユーザーが入力したパスワードを同じソルトでハッシュ化
      const hash = crypto.createHmac('sha512', salt)
                         .update(body.password)
                         .digest('hex');

      if (hash === storedHash) {
        response.body = JSON.stringify({ 
          message: "ログインに成功しました",
          userId: body.userId,
          token: item.token,
        });
      } else {
        response.statusCode = 401;
        response.body = JSON.stringify({ message: "userIdまたはpasswordが一致しません" });
      }
    }
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};