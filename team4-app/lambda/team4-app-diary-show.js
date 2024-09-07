const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
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

  const params = {
    TableName,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": { S: userId },
    },
    ScanIndexForward: false, // 降順で取得
    Limit: 1, // 最新の1件を取得
  };

  const command = new QueryCommand(params);

  try {
    const result = await client.send(command);
    const diary = result.Items;

    if (!diary || diary.length === 0) {
      throw new Error("userIdに合致するユーザが存在しません。");
    }

    response.body = JSON.stringify(unmarshall(diary[0]));
  } catch (e) {
    if (e.message === "userIdに合致するユーザが存在しません。") {
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
