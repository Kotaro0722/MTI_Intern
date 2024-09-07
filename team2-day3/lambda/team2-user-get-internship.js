const { DynamoDBClient, QueryCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
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

  const authToken = event.headers.authorization;
  const userId = event.queryStringParameters.userId; //見たいユーザのuserId

  if(!authToken){
    response.body = JSON.stringify({
      message:"ログインしてからお試しください",
    });
    return response;
  }
  if(!userId){
    response.bpdy = JSON.stringify({
      message:"リクエストが空です",
    });
    return response;
  }
  
  const authParam = {
    TableName,
    KeyConditionExpression:"userId=:uid",
    ExpressionAttributeValues: marshall({
      ":uid":userId,
    }),
  };

  //TODO: 取得対象のテーブル名と検索に使うキーをparamに宣言
  const param = {
    "TableName": TableName,
    "Key": marshall({
      "userId":userId
    })
  };

  // 指定したアイテムを取得するコマンドを用意
  const authCommand = new QueryCommand(authParam);
  const command = new GetItemCommand(param);

  try {
    //トークンチェック
    const authResult = await client.send(authCommand);
    const registeredToken = authResult.Items.length > 0 ? unmarshall(authResult.Items[0]):null;
    if(!registeredToken || registeredToken.token !== authToken){
      response.statusCode = 401;
      response.body = JSON.stringify({
        message:"無効なトークンです"
      });
    }else{
          // ユーザー検索
      const userResult = await client.send(command);
      const user = userResult.Item ? unmarshall(userResult.Item) : null;

      // パスワードとトークンを隠蔽する
      delete user.password;
      delete user.token;

      // ユーザー情報をレスポンスに設定
      response.body = JSON.stringify(user);
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
