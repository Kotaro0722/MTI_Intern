const { DynamoDBClient, PutItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "User";
const crypto = require("crypto");

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

  const reqfield = ["userId", "age", "nickname", "password"];
  const check = reqfield.filter(field => !body[field]);
  if (check.length > 0) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なリクエストです。必須パラメータが不足しています",
    });
    return response;
  }
  
  // 正規表現によるバリデーション
  const userIdPattern = /^[a-zA-Z0-9_]{3,20}$/;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  const nicknamePattern = /^[a-zA-Z0-9\s]{1,30}$/;
  const agePattern = /^(?:[1-9][0-9]?|1[01][0-9]|120)$/;

  if (!userIdPattern.test(body.userId)) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なuserIdです。3〜20文字の英数字とアンダースコアのみ許可されます。",
    });
    return response;
  }

  if (!passwordPattern.test(body.password)) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なpasswordです。8〜20文字の大文字、小文字、数字、特殊文字を含める必要があります。",
    });
    return response;
  }

  if (!nicknamePattern.test(body.nickname)) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なnicknameです。1〜30文字の英数字とスペースのみ許可されます。",
    });
    return response;
  }

  if (!agePattern.test(body.age)) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なageです。0〜120の範囲で整数を入力してください。",
    });
    return response;
  }
  
  const userSearch = {
    TableName,
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: marshall({
      ":uid": body.userId,
    }),
  };
  const registered = new QueryCommand(userSearch);

  try {
    const registeredResult = await client.send(registered);
    if (registeredResult.Count > 0) {
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: "既に使用されているユーザIDです"
      });
    } else {
      // パスワードのハッシュ化
      const salt = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHmac("sha512", salt)
                         .update(body.password)
                         .digest("hex");
      const saltedhash = salt + hash;

      // ユーザートークンの生成
      const tokenSalt = crypto.randomBytes(16).toString("hex");
      const userToken = crypto.createHmac("sha256", tokenSalt)
                              .update(body.userId)
                              .digest("hex");

      const param = {
        TableName: TableName,
        Item: marshall({
          userId: body.userId,
          password: saltedhash,
          nickname: body.nickname,
          age: body.age,
          token: userToken
        })
      };

      const command = new PutItemCommand(param);
      await client.send(command);

      // 正しく生成されたトークンをレスポンスヘッダーに設定
      response.body = JSON.stringify({
        userId: body.userId,
        nickname: body.nickname,
        age: body.age,
        token: userToken,
      });
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