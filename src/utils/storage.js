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

// メモを保存
export function saveMemo(date, memo) {
  const memos = getAllMemos();
  memos[date] = {
    memo: memo,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
}

// 特定の日付のメモを取得
export function getMemo(date) {
  const memos = getAllMemos();
  return memos[date] || null;
}

// 今日のメモを取得
export function getTodaysMemo() {
  return getMemo(getTodayString());
}

// 全てのメモを取得
export function getAllMemos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading memos:', error);
    return {};
  }
}

// メモを削除
export function deleteMemo(date) {
  const memos = getAllMemos();
  delete memos[date];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
}

// 全メモを削除
export function clearAllMemos() {
  localStorage.removeItem(STORAGE_KEY);
}

// メモのリストを日付順（新しい順）で取得
export function getMemosList() {
  const memos = getAllMemos();
  return Object.entries(memos)
    .map(([date, data]) => ({
      date,
      memo: data.memo,
      timestamp: data.timestamp
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
} 