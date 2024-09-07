const {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  const userId = event.queryStringParameters ? event.queryStringParameters.userId : undefined;
  const token = event.headers.authorization;

  if (!userId) {
    const scanParam = {
      TableName:"Article",
      Limit: 100  // スキャンの件数制限
    };
    const scanCommand = new ScanCommand(scanParam);

    try {
      const articles = (await client.send(scanCommand)).Items;
      response.body = JSON.stringify({
        articles: articles.map(item => unmarshall(item))
      });
    } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: "全件取得中にエラーが発生しました",
        errorDetail: e.toString(),
      });
    }

    return response;
  }

  // ユーザー認証
  const userValidated = await validateUser(userId, token);
  if (!userValidated) {
    response.statusCode = 401;
    response.body = JSON.stringify({ message: "無効なユーザーIDまたは認証情報です。" });
    return response;
  }
  
  // 認証が成功したら、記事データを取得
  const command = await fetchArticles(userId, event.queryStringParameters);
  try{
    const result = await client.send(command);
    response.body = JSON.stringify({
      articles: result.Items.map(item => unmarshall(item)),
    });
  }catch(e){
    console.error(e);
  }
  return response;
};

// ユーザー認証関数
async function validateUser(userId, token) {
  const param = {
    TableName: "User",
    Key: {
      "userId": { S: userId }
    },
  };
  const command = new GetItemCommand(param);
  try {
    
    const { Item } = await client.send(command);
    if (!Item) return false; // ユーザーが見つからない場合
    return Item?.token?.S === token; // トークンが一致するか確認
  } catch (error) {
    console.error('Error validating user:', error);
    return false; // エラーが発生した場合は認証失敗
  }
}

// 記事の取得関数
async function fetchArticles(userId, params) {
  const { start, end, category } = params;
  const param = {
    TableName: "Article",
    KeyConditionExpression: "userId = :userId and #ts BETWEEN :start AND :end",
    ExpressionAttributeNames: {
      "#ts": "timestamp",
    }, // timestampのプレースホルダを追加
    ExpressionAttributeValues: {
      ":userId": userId,
      ":start": Number.isNaN(parseInt(start)) ? 0 : parseInt(start),
      ":end": Number.isNaN(parseInt(end)) ? Date.now() : parseInt(end),
    },
  };

  if (category) {
    param.FilterExpression = "category = :category";
    param.ExpressionAttributeValues[":category"] = category;
  }

  param.ExpressionAttributeValues = marshall(param.ExpressionAttributeValues)
  
  const command = new QueryCommand(param);
  
  return command;
}