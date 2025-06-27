// ローカルストレージのキー
const STORAGE_KEY = 'todayq_memos';

// 日付を YYYY-MM-DD 形式の文字列に変換
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// 今日の日付文字列を取得
export function getTodayString() {
  return formatDate(new Date());
}

// メモを保存（1日に複数メモ対応）
export function saveMemo(date, memo) {
  const memos = getAllMemos();
  
  // その日のメモがない場合は配列を初期化
  if (!memos[date]) {
    memos[date] = [];
  }
  
  // 新しいメモを配列に追加
  const newMemo = {
    id: Date.now(), // ユニークなIDを生成
    memo: memo,
    timestamp: new Date().toISOString()
  };
  
  memos[date].push(newMemo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
  
  return newMemo.id; // 保存したメモのIDを返す
}

// 特定の日付のメモを取得（配列で返す）
export function getMemo(date) {
  const memos = getAllMemos();
  return memos[date] || [];
}

// 今日のメモを取得（配列で返す）
export function getTodaysMemo() {
  return getMemo(getTodayString());
}

// 全てのメモを取得
export function getAllMemos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const memos = stored ? JSON.parse(stored) : {};
    
    // 古いフォーマット（オブジェクト）を新しいフォーマット（配列）に変換
    Object.keys(memos).forEach(date => {
      if (memos[date] && !Array.isArray(memos[date])) {
        // 古いフォーマットを新しいフォーマットに変換
        const oldMemo = memos[date];
        memos[date] = [{
          id: Date.now(),
          memo: oldMemo.memo,
          timestamp: oldMemo.timestamp
        }];
      }
    });
    
    return memos;
  } catch (error) {
    console.error('Error loading memos:', error);
    return {};
  }
}

// 特定のメモを削除（メモIDで削除）
export function deleteMemoById(date, memoId) {
  const memos = getAllMemos();
  if (memos[date]) {
    memos[date] = memos[date].filter(memo => memo.id !== memoId);
    if (memos[date].length === 0) {
      delete memos[date]; // その日のメモがすべてなくなったら日付ごと削除
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
  }
}

// メモを削除（その日のメモを全て削除）
export function deleteMemo(date) {
  const memos = getAllMemos();
  delete memos[date];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
}

// 全メモを削除
export function clearAllMemos() {
  localStorage.removeItem(STORAGE_KEY);
}

// メモのリストを日付順（新しい順）で取得（フラット化）
export function getMemosList() {
  const memos = getAllMemos();
  const result = [];
  
  Object.entries(memos).forEach(([date, dayMemos]) => {
    if (Array.isArray(dayMemos)) {
      dayMemos.forEach(memo => {
        result.push({
          date,
          id: memo.id,
          memo: memo.memo,
          timestamp: memo.timestamp
        });
      });
    }
  });
  
  // タイムスタンプ順（新しい順）でソート
  return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// 日付ごとにグループ化されたメモのリストを取得
export function getMemosListGroupedByDate() {
  const memos = getAllMemos();
  const result = [];
  
  Object.entries(memos).forEach(([date, dayMemos]) => {
    if (Array.isArray(dayMemos) && dayMemos.length > 0) {
      result.push({
        date,
        memos: dayMemos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
        count: dayMemos.length
      });
    }
  });
  
  // 日付順（新しい順）でソート
  return result.sort((a, b) => new Date(b.date) - new Date(a.date));
} 