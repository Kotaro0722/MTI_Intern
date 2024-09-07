const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "Team4Diary";

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  const userId = event.queryStringParameters.userId || null;

  if (!userId) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "userIdを入力してください",
    });
    return response;
  }

  // ScanCommand用のパラメータを設定
  const params = {
    TableName,
    FilterExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": { S: userId },
    },
  };

  const command = new ScanCommand(params);

  try {
    // DynamoDBからスキャンを実行してデータを取得
    const result = await client.send(command);
    const diaries = result.Items;

    if (!diaries || diaries.length === 0) {
      throw new Error("userIdに合致するデータが存在しません。");
    }

    // 取得したデータをレスポンスボディに設定
    response.body = JSON.stringify(diaries.map((item) => unmarshall(item)));
  } catch (e) {
    if (e.message === "userIdに合致するデータが存在しません。") {
      response.statusCode = 404;
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
