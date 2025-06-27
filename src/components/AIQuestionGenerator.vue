<template>
  <div class="ai-question-generator">
    <div class="generator-header">
      <h3 class="generator-title">
        <span class="ai-icon">🤖</span>
        AI質問ジェネレーター
      </h3>
      <p class="generator-description">
        あなたの過去の回答から傾向を分析し、新しい問いを生成します
      </p>
    </div>

    <div class="generator-content">
      <!-- API設定状態 -->
      <div class="api-status" :class="apiStatusClass">
        <span class="status-icon">{{ apiStatusIcon }}</span>
        <span class="status-text">{{ apiStatusText }}</span>
      </div>

      <!-- 傾向分析結果 -->
      <div v-if="trendAnalysis && Object.keys(trendAnalysis).length > 0" class="trend-analysis">
        <h4>あなたの思考傾向</h4>
        <div class="trend-items">
          <div class="trend-item">
            <span class="trend-label">メモ数:</span>
            <span class="trend-value">{{ trendAnalysis.memoCount }}件</span>
          </div>
          <div class="trend-item">
            <span class="trend-label">思考スタイル:</span>
            <span class="trend-value">{{ trendAnalysis.thinkingDepth }}</span>
          </div>
          <div v-if="trendAnalysis.themes.length > 0" class="trend-item">
            <span class="trend-label">関心テーマ:</span>
            <span class="trend-value">{{ trendAnalysis.themes.join(', ') }}</span>
          </div>
        </div>
      </div>

      <!-- 質問生成ボタン -->
      <div class="generator-actions">
        <button 
          @click="generateNewQuestion" 
          :disabled="isGenerating || !isApiReady"
          class="generate-btn"
          :class="{ 'generating': isGenerating }"
        >
          <span v-if="isGenerating" class="loading-spinner"></span>
          {{ isGenerating ? '生成中...' : 'AI質問を生成' }}
        </button>
      </div>

      <!-- 生成された質問 -->
      <div v-if="generatedQuestion" class="generated-question">
        <h4>🎯 AI生成質問</h4>
        <div class="question-content">
          {{ generatedQuestion }}
        </div>
        <div class="question-actions">
          <button @click="adoptQuestion" class="adopt-btn">
            この質問を今日の問いにする
          </button>
          <button @click="generateNewQuestion" class="regenerate-btn">
            別の質問を生成
          </button>
        </div>
      </div>

      <!-- エラー表示 -->
      <div v-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { generateQuestionFromTrends, testOpenAIConnection } from '../utils/openai.js'

const props = defineProps({
  memosList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['question-generated'])

// リアクティブデータ
const isGenerating = ref(false)
const generatedQuestion = ref('')
const error = ref('')
const apiStatus = ref('checking') // 'checking', 'ready', 'error'
const trendAnalysis = ref({})

// 計算されたプロパティ
const isApiReady = computed(() => apiStatus.value === 'ready')

const apiStatusClass = computed(() => ({
  'status-ready': apiStatus.value === 'ready',
  'status-error': apiStatus.value === 'error',
  'status-checking': apiStatus.value === 'checking'
}))

const apiStatusIcon = computed(() => {
  switch (apiStatus.value) {
    case 'ready': return '✅'
    case 'error': return '❌'
    case 'checking': return '🔄'
    default: return '❓'
  }
})

const apiStatusText = computed(() => {
  switch (apiStatus.value) {
    case 'ready': return 'OpenAI API 接続OK'
    case 'error': return 'API設定が必要です (.envファイルにVITE_OPENAI_API_KEY を設定)'
    case 'checking': return 'API接続を確認中...'
    default: return '不明な状態'
  }
})

// メソッド
const checkApiStatus = async () => {
  try {
    const result = await testOpenAIConnection()
    apiStatus.value = result.success ? 'ready' : 'error'
    if (!result.success) {
      error.value = result.error
    }
  } catch (err) {
    apiStatus.value = 'error'
    error.value = 'API接続テストに失敗しました'
  }
}

const analyzeTrends = () => {
  if (!props.memosList || props.memosList.length === 0) {
    trendAnalysis.value = {
      memoCount: 0,
      thinkingDepth: '新規ユーザー',
      themes: []
    }
    return
  }

  // 簡単な傾向分析
  const allMemoTexts = props.memosList.map(memo => memo.memo).join(' ')
  const themes = []
  const keywords = [
    { word: '仕事', category: 'work' },
    { word: '人間関係', category: 'relationships' },
    { word: '成長', category: 'growth' },
    { word: '学習', category: 'learning' },
    { word: '健康', category: 'health' },
    { word: '創造', category: 'creativity' },
    { word: '目標', category: 'goals' },
    { word: '価値観', category: 'values' },
    { word: '感情', category: 'emotions' },
    { word: '時間', category: 'time' }
  ]

  keywords.forEach(keyword => {
    if (allMemoTexts.includes(keyword.word)) {
      themes.push(keyword.category)
    }
  })

  const avgLength = allMemoTexts.length / props.memosList.length
  const thinkingDepth = avgLength > 100 ? '深い思考を好む' : 'シンプルな思考を好む'

  trendAnalysis.value = {
    memoCount: props.memosList.length,
    thinkingDepth,
    themes: themes.length > 0 ? themes : ['general'],
    recentTopics: props.memosList.slice(0, 3).map(memo => memo.memo.substring(0, 50))
  }
}

const generateNewQuestion = async () => {
  if (!isApiReady.value) {
    error.value = 'OpenAI APIが設定されていません'
    return
  }

  isGenerating.value = true
  error.value = ''
  generatedQuestion.value = ''

  try {
    const question = await generateQuestionFromTrends(props.memosList)
    generatedQuestion.value = question
  } catch (err) {
    error.value = err.message || '質問生成に失敗しました'
  } finally {
    isGenerating.value = false
  }
}

const adoptQuestion = () => {
  emit('question-generated', generatedQuestion.value)
  generatedQuestion.value = ''
}

// ライフサイクル
onMounted(async () => {
  await checkApiStatus()
  analyzeTrends()
})
</script>

<style scoped>
.ai-question-generator {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.generator-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.generator-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4f46e5;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.ai-icon {
  font-size: 1.5rem;
}

.generator-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.api-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.status-ready {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.status-checking {
  background: #fefce8;
  color: #a16207;
  border: 1px solid #fef3c7;
}

.trend-analysis {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.trend-analysis h4 {
  margin: 0 0 0.75rem;
  color: #374151;
  font-size: 1rem;
}

.trend-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.trend-label {
  font-weight: 500;
  color: #6b7280;
  min-width: 100px;
}

.trend-value {
  color: #374151;
  font-weight: 600;
}

.generator-actions {
  text-align: center;
  margin: 1rem 0;
}

.generate-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.generate-btn.generating {
  background: #6b7280;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.generated-question {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.generated-question h4 {
  margin: 0 0 1rem;
  color: #0c4a6e;
  font-size: 1rem;
}

.question-content {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e0f2fe;
  font-weight: 500;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.question-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.adopt-btn {
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  flex: 1;
}

.adopt-btn:hover {
  background: #047857;
}

.regenerate-btn {
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  flex: 1;
}

.regenerate-btn:hover {
  background: #4b5563;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.75rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .ai-question-generator {
    padding: 1rem;
  }
  
  .question-actions {
    flex-direction: column;
  }
  
  .adopt-btn,
  .regenerate-btn {
    flex: none;
  }
}
</style> 