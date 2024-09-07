const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "Team4Diary";

// カフェイン量を計算する関数
function calculateCaffeine(drinkType, drinkAmount) {
  const caffeineContent = {
    コーヒー: 0.6,
    玉露: 1.6,
    紅茶: 0.3,
    せん茶: 0.2,
    ほうじ茶: 0.2,
  };

  // 飲み物の種類が不明な場合は0を返す
  return (caffeineContent[drinkType] || 0) * drinkAmount;
}

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  // リクエストボディの解析
  const body = event.body ? JSON.parse(event.body) : null;
  if (!body || !body.userId || !body.drinkType || !body.drinkAmount || !body.createdAt) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message:
        "無効なリクエストです。request bodyに必須パラメータがセットされていません。",
    });
    return response;
  }

  const { userId, drinkType, drinkAmount, createdAt } = body;

  // カフェイン量を計算
  const caffeineAmount = calculateCaffeine(drinkType, drinkAmount);
  // const createdAt = Date.now();

  // DynamoDBに登録するためのパラメータを準備
  const param = {
    TableName,
    Item: {
      userId: { S: userId }, // 文字列型
      createdAt: { N: createdAt.toString() }, // 数値型 (UNIXタイムスタンプを文字列化)
      drinkType: { S: drinkType }, // 文字列型
      drinkAmount: { N: drinkAmount.toString() }, // 数値型
      caffeineAmount: { N: caffeineAmount.toString() }, // 数値型
    },
  };

  const command = new PutItemCommand(param);

  try {
    // DBにデータを登録
    await client.send(command);
    // 成功時のレスポンス設定
    response.statusCode = 201;
    response.body = JSON.stringify({
      drinkType,
      drinkAmount,
      createdAt,
      userId,
      caffeineAmount,
    });
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
