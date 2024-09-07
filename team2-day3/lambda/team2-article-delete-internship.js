const {DynamoDBClient,QueryCommand,DeleteItemCommand,} = require("@aws-sdk/client-dynamodb");
const { marshall,unmarshall } = require("@aws-sdk/util-dynamodb");
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

  const authToken = event.headers.authorization;
  const userId = event.queryStringParameters?.userId;
  const timestamp = parseInt(event.queryStringParameters?.timestamp);
   
  
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
  
  if(!timestamp){
    response.body = JSON.stringify({
      message: "timestamp is empty "
    });
  }
  
  
  const authParam = {
    TableName,
    KeyConditionExpression:"userId=:uid",
    ExpressionAttributeValues: marshall({
      ":uid":userId,
    }),
  };

  // TODO: 削除対象のテーブル名と削除したいデータのkeyをparamに設定
  const param = {
    TableName,
    Key: marshall({
      userId,
      timestamp,
    })
  };

  // データを削除するコマンドを用意
  const authCommand = new QueryCommand(authParam);
  const deleteCommand = new DeleteItemCommand(param);

  try {
    //トークンチェック
    const authResult = await client.send(authCommand);
    const user = authResult.Items.length > 0 ? unmarshall(authResult.Items[0]) : null;
    if(!user || !timestamp || user.token !== authToken){
      response.statusCode = 401;
      response.body = JSON.stringify({
        message:"無効なトークンです"
      });
    }else{
      // client.send()を用いてデータを削除するコマンドを実行
      await client.send(deleteCommand);
      // TODO: 成功後の処理を記載(status codeを指定する。)
      response.statusCode = 204;
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
