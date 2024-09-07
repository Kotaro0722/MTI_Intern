const { DynamoDBClient, PutItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
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

 const authToken = event.headers.authorization;
  // リクエストボディの中身をJavaScriptオブジェクトに変換
  const body = JSON.parse(event.body);

  if(!authToken){
    response.body = JSON.stringify({
      message:"ログインしてからお試しください",
    });
    return response;
  }
  if(!body){
    response.bpdy = JSON.stringify({
      message:"リクエストが空です",
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
  
  const authParam = {
    TableName,
    KeyConditionExpression:"userId=:uid",
    ExpressionAttributeValues: marshall({
      ":uid":body.userId,
    }),
  };
  // paramに更新対象のテーブル名と更新内容を記述
  const param = {
    TableName,
    Item: marshall(body),
  };

  const authCommand = new QueryCommand(authParam);

  try {
    const authResult = await client.send(authCommand);
    const registeredToken = authResult.Items.length > 0 ? unmarshall(authResult.Items[0]):null;
    if(!registeredToken || registeredToken.token !== authToken){
      response.statusCode = 401;
      response.body = JSON.stringify({
        message:"無効なトークンです"
      });
    }else{
      let saltedhash =registeredToken.password;
      if(body.password !== registeredToken.password){
        const salt = crypto.randomBytes(32).toString("hex");
        const hash = crypto.createHmac("sha512", salt)
                           .update(body.password)
                           .digest("hex");
         saltedhash = salt + hash;
      }
      let newToken = registeredToken.token;
      // userIdが更新される場合はトークンも更新
      if(body.userId !== registeredToken.userId){
        const tokenSalt = crypto.randomBytes(16).toString("hex");
        newToken = crypto.createHmac("sha256", tokenSalt)
                         .update(body.userId)
                         .digest("hex");
      }
      // paramに更新対象のテーブル名と更新内容を記述
      const param = {
        TableName: TableName,
        Item: marshall({
          userId: body.userId,
          password: saltedhash,
          nickname: body.nickname,
          age: body.age,
          token: newToken
        })
      };
      const command = new PutItemCommand(param);
      await client.send(command);
      // パスワードを隠蔽したオブジェクトを作成
      const reply = JSON.stringify({
        userId: body.userId,
        nickname: body.nickname,
        age: body.age,
        token:newToken,
      });
      // 更新に成功した場合の処理を記述
      response.body = reply;
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