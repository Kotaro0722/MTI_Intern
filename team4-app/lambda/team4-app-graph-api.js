const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const DiaryTableName = "Team4Diary";

// シグマの中身の計算
function calculateExpression(caffeinAmount, t, AddTime) {
    const result = (caffeinAmount / 0.6) * Math.exp((-Math.log(2) / 5) * (t - AddTime));
    return result;
}

// タイムスタンプを時間指定して、タイムスタンプとして返す
function convertTimestampToDateTime(unixTimestamp, hoursToSet) {
    const date = new Date(unixTimestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(hoursToSet).padStart(2, '0');
    
    // 日付と指定された時間を組み合わせて新しいDateオブジェクトを作成
    const dateTime = new Date(`${year}-${month}-${day}T${hours}:00:00Z`);
    return dateTime.getTime();
}

// タイムスタンプを24時間表記で返す
function convertTimestampTohours(unixTimestamp) {
    const date = new Date(unixTimestamp);
    const options = {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      hourCycle: 'h23',
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const tokyoTime = formatter.format(date);
    
    // 24時間表記で返す
    return tokyoTime;
}


exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  const userId = event.queryStringParameters.userId || null;
  
  // 昨日のタイムスタンプを生成
  const yesterdayTimestamp = new Date(Date.now());
  yesterdayTimestamp.setDate(yesterdayTimestamp.getDate() - 1);
  // 明日のタイムスタンプを生成
  const tomorrowTimestamp = new Date(Date.now());
  tomorrowTimestamp.setDate(tomorrowTimestamp.getDate() + 1);
  const startAt = convertTimestampToDateTime(yesterdayTimestamp, 4);
  const endAt = convertTimestampToDateTime(tomorrowTimestamp, 0);

  if (!userId) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "userIdを入力してください",
    });
    return response;
  }

  const params = {
    TableName: DiaryTableName,
    KeyConditionExpression: "userId = :userId AND createdAt BETWEEN :startAt AND :endAt",
    ExpressionAttributeValues: {
      ":userId": { S: userId },
      ":startAt": { N: startAt.toString() },
      ":endAt": { N: endAt.toString() },
    },
    ScanIndexForward: true, // 昇順で取得
  };

  const command = new QueryCommand(params);

  try {
    const result = await client.send(command);
    const diaries = result.Items;

    if (!diaries || diaries.length === 0) {
      throw new Error("指定された期間に該当するデータが見つかりませんでした。");
    }

    response.body = diaries.map(item => unmarshall(item));
  } catch (e) {
    if (e.message === "指定された期間に該当するデータが見つかりませんでした。") {
      response.statusCode = 404;
      response.body = JSON.stringify({ message: e.message });
    } else {
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: "予期せぬエラーが発生しました。",
        errorDetail: e.toString(),
      });
    }
    return
  }
  
  const caffeineInBloodCal=(timeCount)=>{
    let caffeineInBlood=0
    response.body.map((diary)=>{
      let caffeine=0;
      const addTime=convertTimestampTohours(diary.createdAt);
      
      if(timeCount>=addTime){
        caffeine=diary.caffeineAmount;
      }
      
      if(diary.createdAt>yesterdayTimestamp){
        const caffeineInBloodValue=calculateExpression(caffeine,timeCount,addTime)
        caffeineInBlood+=caffeineInBloodValue;
      }else{
        caffeine=diary.caffeineAmount
        const caffeineInBloodValue=calculateExpression(caffeine,timeCount,addTime-24)
        caffeineInBlood+=caffeineInBloodValue;
      }
    });
    return caffeineInBlood
  }
  
  const caffeineInBloodList=[]
  
  for(let timeCount=4;timeCount<25;timeCount++){
    caffeineInBloodList.push([timeCount+"時",caffeineInBloodCal(timeCount)])
  }
  
  response.body=JSON.stringify({result:caffeineInBloodList})
  
  return response
};