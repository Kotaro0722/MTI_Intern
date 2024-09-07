const {
  DynamoDBClient,
  GetItemCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });

exports.handler = async (event, context) => {
  //レスポンスの雛形
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  // if(event.headers.authorization!=="mtiToken"){
  //   response.statusCode=401;
  //   response.body=JSON.stringify({
  //     message:"ログインしてください",
  //   });
  //   return response;
  // }

  const userId = event.queryStringParameters.userId || null; //見たいユーザのuserId

  if (!userId) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "userIdを入力してください",
    });
    return response;
  }

  //TODO: 取得対象のテーブル名と検索に使うキーをparamに宣言
  let param = {
    TableName: "Team4Sleep",
    FilterExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": { S: userId },
    },
  };

  // 指定したアイテムを取得するコマンドを用意
  let command = new ScanCommand(param);

  try {
    //client.send()の実行でDBからデータを取得
    const sleep = (await client.send(command)).Items;

    if (!sleep) {
      throw new Error("Sleep:userIdに合致するユーザが存在しません。");
    }

    //TODO: レスポンスボディに取得したUserの情報を設定する
    response.body = sleep.map((item) => unmarshall(item));
  } catch (e) {
    if (e.message == "Sleep:userIdに合致するユーザが存在しません。") {
      response.statusCode = 401;
      response.body = JSON.stringify({ message: e.message });
    } else {
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: "Sleepで予期せぬエラーが発生しました。",
        errorDetail: e.toString(),
      });
    }
  }

  const diaryResponse = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  param = {
    TableName: "Team4Diary",
    FilterExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": { S: userId },
    },
  };

  command = new ScanCommand(param);

  try {
    const diary = (await client.send(command)).Items;

    if (!diary) {
      throw new Error("Diary:userIdに合致するユーザが存在しません。");
    }

    //TODO: レスポンスボディに取得したUserの情報を設定する
    diaryResponse.body = diary.map((item) => unmarshall(item));
  } catch (e) {
    if (e.message == "Diary:userIdに合致するユーザが存在しません。") {
      response.statusCode = 401;
      response.body = JSON.stringify({ message: e.message });
    } else {
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: "Diaryで予期せぬエラーが発生しました。",
        errorDetail: e.toString(),
      });
    }
  }

  const groupedByDate = diaryResponse.body.reduce((acc, diary) => {
    const date = new Date(diary.createdAt).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(diary.caffeineAmount);
    return acc;
  }, {});

  console.log(groupedByDate);

  const dayCaffeine = {};
  Object.entries(groupedByDate).forEach(([date, caffeine]) => {
    const caffeineSum = caffeine.reduce((sum, element) => {
      return sum + element;
    }, 0);
    dayCaffeine[date] = caffeineSum;
  });

  console.log(dayCaffeine);

  response.body?.map((res) => {
    const responseDate = new Date(res.sleepAt).toISOString().split("T")[0];
    const caffeine = dayCaffeine[responseDate];
    if (caffeine) {
      res.dayCaffeine = caffeine;
    } else {
      res.dayCaffeine = 0;
    }
    return res;
  });

  response.body = JSON.stringify(response.body);

  return response;
};
