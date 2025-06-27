<template>
  <div id="app" class="app-container">
    <!-- ヘッダー -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <span class="title-main">todayQ</span>
          <span class="title-sub">今日の問いジェネレーター</span>
        </h1>
        <p class="app-description">毎日ひとつの「問い」で、思考を深める習慣を</p>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <main class="main-content">
      <div class="content-container">
        <!-- 今日の問いカード -->
        <QuestionCard 
          :question="currentQuestion" 
          :date="today"
          :is-ai-generated="isAiGeneratedQuestion"
        />

        <!-- AI質問ジェネレーター -->
        <AIQuestionGenerator 
          :memos-list="memosList"
          @question-generated="handleAiQuestionGenerated"
        />

        <!-- メモ入力フォーム -->
        <MemoInput 
          v-model="currentMemo"
          @save="handleSaveMemo"
          @clear="handleClearMemo"
        />

        <!-- 振り返りパネル -->
        <ReviewPanel 
          :memos-list="memosList"
          @delete-memo="handleDeleteMemo"
        />
      </div>
    </main>

    <!-- フッター -->
    <footer class="app-footer">
      <p>&copy; 2025 todayQ - Enokisan</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import QuestionCard from './components/QuestionCard.vue'
import MemoInput from './components/MemoInput.vue'
import ReviewPanel from './components/ReviewPanel.vue'
import AIQuestionGenerator from './components/AIQuestionGenerator.vue'
import { getTodaysQuestion } from './data/questions.js'
import { 
  saveMemo, 
  getTodaysMemo, 
  getMemosList, 
  deleteMemo,
  deleteMemoById, 
  getTodayString 
} from './utils/storage.js'

// リアクティブデータ
const today = ref(new Date())
const currentMemo = ref('')
const memosList = ref([])
const aiGeneratedQuestion = ref('')
const isAiGeneratedQuestion = ref(false)

// 計算されたプロパティ
const todaysQuestion = computed(() => getTodaysQuestion())
const currentQuestion = computed(() => 
  isAiGeneratedQuestion.value ? aiGeneratedQuestion.value : todaysQuestion.value
)

// メソッド
const loadTodaysMemo = () => {
  // 新しい複数メモ対応で配列が返されるので、最新のメモを取得
  const memos = getTodaysMemo()
  currentMemo.value = ''
}

const loadMemosList = () => {
  memosList.value = getMemosList()
}

const handleSaveMemo = (memo) => {
  const todayString = getTodayString()
  // 現在の質問を取得（AI生成質問またはデフォルト質問）
  const currentQuestionText = currentQuestion.value
  // 質問と回答をセットで保存
  saveMemo(todayString, memo, currentQuestionText, isAiGeneratedQuestion.value)
  loadMemosList()
  // メモを保存後、入力フィールドをクリア
  currentMemo.value = ''
}

const handleClearMemo = () => {
  currentMemo.value = ''
}

const handleDeleteMemo = (memoData) => {
  if (memoData.id) {
    // 個別のメモを削除
    deleteMemoById(memoData.date, memoData.id)
  } else {
    // 日付ごとの削除（後方互換性のため）
    deleteMemo(memoData.date || memoData)
  }
  loadMemosList()
  
  // 今日のメモが削除された場合、現在のメモもクリア
  if ((memoData.date || memoData) === getTodayString()) {
    currentMemo.value = ''
  }
}

const handleAiQuestionGenerated = (question) => {
  aiGeneratedQuestion.value = question
  isAiGeneratedQuestion.value = true
  // 新しい質問になったので、現在のメモをクリア
  currentMemo.value = ''
}

// ライフサイクル
onMounted(() => {
  loadTodaysMemo()
  loadMemosList()
  
  // 日付が変わった時の処理（24時間ごとにチェック）
  setInterval(() => {
    const newToday = new Date()
    if (newToday.toDateString() !== today.value.toDateString()) {
      today.value = newToday
      loadTodaysMemo()
      // 日付が変わったらAI生成質問をリセット
      isAiGeneratedQuestion.value = false
      aiGeneratedQuestion.value = ''
    }
  }, 60000) // 1分ごとにチェック
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
  position: relative;
  overflow-x: hidden;
}

.app-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

.app-header {
  text-align: center;
  padding: 3rem 1rem 2rem;
  position: relative;
  z-index: 1;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.app-title {
  margin: 0 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.title-main {
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.02em;
}

.title-sub {
  font-size: 1.125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.1em;
}

.app-description {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
  font-weight: 400;
}

.main-content {
  position: relative;
  z-index: 1;
  padding: 0 1rem 2rem;
}

.content-container {
  max-width: 800px;
  margin: 0 auto;
}

.app-footer {
  text-align: center;
  padding: 2rem 1rem;
  position: relative;
  z-index: 1;
}

.app-footer p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .app-header {
    padding: 2rem 1rem 1rem;
  }
  
  .title-main {
    font-size: 2.5rem;
  }
  
  .title-sub {
    font-size: 1rem;
  }
  
  .app-description {
    font-size: 1rem;
  }
  
  .main-content {
    padding: 0 0.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .title-main {
    font-size: 2rem;
  }
  
  .app-title {
    gap: 0.25rem;
  }
}
</style> 