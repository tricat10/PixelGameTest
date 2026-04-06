const SHEET_NAME_QUESTIONS = "題目";
const SHEET_NAME_ANSWERS = "回答";

function doOptions(e) {
  // 處理 CORS Preflight 請求
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return HtmlService.createHtmlOutput("")
    .setHeaders(headers);
}

function doGet(e) {
  const count = parseInt(e.parameter.count) || 5;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_QUESTIONS);
  if (!sheet) {
    return createJsonResponse({ error: "找不到「題目」工作表" });
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return createJsonResponse({ error: "題目不足" });
  }

  // 第一列是 Title
  const headers = data[0]; // 題號, 題目, A, B, C, D, 解答
  const rows = data.slice(1);

  // 整理題目陣列
  let questions = rows.map(r => {
    return {
      id: r[0],
      text: r[1],
      options: {
        A: r[2],
        B: r[3],
        C: r[4],
        D: r[5]
      },
      answer: r[6]
    };
  });

  // 隨機打亂並抽取 N 題
  questions = shuffleArray(questions).slice(0, count);

  // 回傳時不要包含答案，以免被前端直接看到
  const responseQuestions = questions.map(q => ({
    id: q.id,
    text: q.text,
    options: q.options
  }));

  // 為了等等 POST 時好對答案，我們也可以考慮緩存，但這是一個無狀態簡單系統，
  // 所以我們稍微調整：前端必須傳回答案跟 ID，我們在 POST 內再重查一次解答核對。

  return createJsonResponse({ questions: responseQuestions });
}

function doPost(e) {
  try {
    let payload;
    // 當 Content-Type 是 text/plain 時，資料會在 postData.contents 內
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }

    const { userId, answers } = payload; 
    // answers 格式預期為 [{ id: "1", answer: "A" }, ...]

    if (!userId || !answers || !Array.isArray(answers)) {
      return createJsonResponse({ error: "參數錯誤" });
    }

    // 核對答案
    const qSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_QUESTIONS);
    const qData = qSheet.getDataRange().getValues();
    const qMap = {};
    for (let i = 1; i < qData.length; i++) {
        qMap[qData[i][0]] = qData[i][6]; // id -> 解答
    }

    let score = 0;
    answers.forEach(ans => {
       if (qMap[ans.id] && qMap[ans.id].toString() === ans.answer.toString()) {
         score++;
       }
    });

    // 處理「回答」工作表
    const aSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ANSWERS);
    let aData = aSheet.getDataRange().getValues();
    
    // 找看看有沒有這個 ID
    let rowIndex = -1;
    for (let i = 1; i < aData.length; i++) {
       if (aData[i][0].toString() === userId.toString()) {
           rowIndex = i + 1; // getRange 是 1-indexed，且我們跳過第一列的 header
           break;
       }
    }

    const now = new Date();
    // 欄位：ID, 闖關次數, 總分, 最高分, 第一次通關分數, 花了幾次通關, 最近遊玩時間
    const passThreshold = parseInt(e.parameter.threshold) || 3; // 預設 3，也可考慮前端傳過來
    const isPass = score >= passThreshold;

    if (rowIndex === -1) {
       // 新玩家
       // 花了幾次通關：如果有通關就是 1，沒通關就留空 (或 0)
       const passCount = isPass ? 1 : "";
       const firstPassScore = isPass ? score : "";
       aSheet.appendRow([userId, 1, score, score, firstPassScore, passCount, now]);
    } else {
       // 既有玩家
       const rowData = aData[rowIndex - 1]; // 陣列索引是 rowIndex - 1
       const playCount = parseInt(rowData[1] || 0) + 1;
       const totalScore = parseInt(rowData[2] || 0) + score;
       let maxScore = parseInt(rowData[3] || 0);
       maxScore = score > maxScore ? score : maxScore;
       
       let firstPassScore = rowData[4];
       let triesToPass = rowData[5];

       if (!firstPassScore && isPass) {
          firstPassScore = score;
          triesToPass = playCount;
       }

       // 更新該列
       aSheet.getRange(rowIndex, 2, 1, 6).setValues([[
          playCount, totalScore, maxScore, firstPassScore, triesToPass, now
       ]]);
    }

    return createJsonResponse({
        success: true,
        score: score,
        isPass: isPass
    });

  } catch(err) {
    return createJsonResponse({ error: err.toString() });
  }
}

// 輔助函數：建立回傳 JSON 以及 CORS Header
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// 輔助函數：隨機打亂陣列 (Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
