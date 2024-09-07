const { DynamoDBClient, GetItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
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
  const userId = event.headers.userid;

  if (!authToken || !userId) {
    response.statusCode = 401;
    response.body = JSON.stringify({
      message: "ログインしてからお試しください",
    });
    return response;
  }

  const authParam = {
    TableName,
    Key: {
      "userId": { S: userId },
    },
  };

  try {
    // トークンチェック
    const authCommand = new GetItemCommand(authParam);
    const authResult = await client.send(authCommand);
    const user = authResult.Item ? unmarshall(authResult.Item) : null;

    if (!user || user.token !== authToken) {
      response.statusCode = 401;
      response.body = JSON.stringify({
        message: "無効なトークンです"
      });
      return response;
    }

    // 全ユーザー情報を取得
    const usersCommand = new ScanCommand({ TableName });
    const usersResult = await client.send(usersCommand);
    const users = usersResult.Items.map(item => {
      const user = unmarshall(item);
      delete user.password;
      delete user.token;
      return user;
    });

    if (users.length === 0) {
      response.statusCode = 404;
      response.body = JSON.stringify({
        message: "ユーザーが見つかりませんでした"
      });
    } else {
      response.body = JSON.stringify({ users });
    }

  } catch (e) {
    console.error("Error:", e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};