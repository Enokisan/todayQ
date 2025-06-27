<template>
  <div class="question-card" :class="{ 'ai-generated': isAiGenerated }">
    <div class="date-info">
      {{ formattedDate }}
    </div>
    
    <!-- AI生成トグルボタン -->
    <div v-if="showAiGenerator" class="ai-toggle-section">
      <button 
        @click="toggleAiSection" 
        class="ai-toggle-btn"
        :class="{ 'active': isAiSectionOpen }"
      >
        <span class="ai-mini-icon"></span>
        AI質問生成
        <span class="toggle-arrow" :class="{ 'open': isAiSectionOpen }">▼</span>
      </button>
      
      <!-- AI生成セクション（折りたたみ可能） -->
      <div v-if="isAiSectionOpen" class="ai-section">
        <!-- API状態 -->
        <div class="api-status-mini" :class="apiStatusClass">
          <span class="status-dot" :class="apiStatusIconClass"></span>
          <span class="status-text-mini">{{ apiStatusText }}</span>
        </div>
        
        <!-- 傾向分析（コンパクト） -->
        <div v-if="trendAnalysis && Object.keys(trendAnalysis).length > 0" class="trend-mini">
          <span class="trend-item-mini">
            📊 {{ trendAnalysis.memoCount }}件のメモ
          </span>
          <span class="trend-item-mini" v-if="trendAnalysis.thinkingDepth">
            🧠 {{ trendAnalysis.thinkingDepth }}
          </span>
        </div>
        
        <!-- 生成ボタン -->
        <button 
          @click="generateNewQuestion" 
          :disabled="isGenerating || !isApiReady"
          class="generate-btn-mini"
          :class="{ 'generating': isGenerating }"
        >
          <span v-if="isGenerating" class="loading-spinner-mini"></span>
          {{ isGenerating ? '生成中...' : 'AI質問を生成' }}
        </button>
        
        <!-- 生成された質問（プレビュー） -->
        <div v-if="generatedQuestion" class="generated-preview">
          <div class="preview-content">{{ generatedQuestion }}</div>
          <div class="preview-actions">
            <button @click="adoptQuestion" class="adopt-btn-mini">採用</button>
            <button @click="generateNewQuestion" class="regenerate-btn-mini">再生成</button>
          </div>
        </div>
        
        <!-- エラー表示 -->
        <div v-if="error" class="error-mini">
          ⚠️ {{ error }}
        </div>
      </div>
    </div>
    
    <div class="question-content">
      <h2 class="question-text">{{ question }}</h2>
    </div>
    <div class="question-footer">
      <span class="today-label" :class="{ 'ai-label': isAiGenerated }">
        {{ isAiGenerated ? 'AI生成質問' : '今日の問い' }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { generateQuestionFromTrends, testOpenAIConnection } from '../utils/openai.js'

const props = defineProps({
  question: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: () => new Date()
  },
  isAiGenerated: {
    type: Boolean,
    default: false
  },
  showAiGenerator: {
    type: Boolean,
    default: true
  },
  memosList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['question-generated'])

// AI機能のリアクティブデータ
const isAiSectionOpen = ref(false)
const isGenerating = ref(false)
const generatedQuestion = ref('')
const error = ref('')
const apiStatus = ref('checking')
const trendAnalysis = ref({})

// 計算されたプロパティ
const formattedDate = computed(() => {
  return props.date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

const isApiReady = computed(() => apiStatus.value === 'ready')

const apiStatusClass = computed(() => ({
  'status-ready': apiStatus.value === 'ready',
  'status-error': apiStatus.value === 'error',
  'status-checking': apiStatus.value === 'checking'
}))

const apiStatusIconClass = computed(() => ({
  'status-success': apiStatus.value === 'ready',
  'status-error': apiStatus.value === 'error',
  'status-loading': apiStatus.value === 'checking'
}))

const apiStatusText = computed(() => {
  switch (apiStatus.value) {
    case 'ready': return 'API接続OK'
    case 'error': return 'API設定が必要'
    case 'checking': return '確認中...'
    default: return '不明'
  }
})

// メソッド
const toggleAiSection = () => {
  isAiSectionOpen.value = !isAiSectionOpen.value
}

const checkApiStatus = async () => {
  try {
    const result = await testOpenAIConnection()
    apiStatus.value = result.success ? 'ready' : 'error'
    if (!result.success) {
      error.value = result.error
    }
  } catch (err) {
    apiStatus.value = 'error'
    error.value = 'API接続テストに失敗'
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

  const allMemoTexts = props.memosList.map(memo => memo.memo).join(' ')
  const avgLength = allMemoTexts.length / props.memosList.length
  const thinkingDepth = avgLength > 100 ? '深い思考を好む' : 'シンプルな思考を好む'

  trendAnalysis.value = {
    memoCount: props.memosList.length,
    thinkingDepth,
    themes: ['general'],
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
  isAiSectionOpen.value = false
}

// ライフサイクル
onMounted(async () => {
  if (props.showAiGenerator) {
    await checkApiStatus()
    analyzeTrends()
  }
})
</script>

<style scoped>
.question-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  margin: 1rem 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.question-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.question-card.ai-generated::before {
  background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
}

.question-card.ai-generated {
  border-color: rgba(79, 70, 229, 0.3);
}

.question-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.date-info {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
  font-weight: 500;
}

/* AI生成セクション */
.ai-toggle-section {
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.ai-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(79, 70, 229, 0.15);
  border: 1px solid rgba(79, 70, 229, 0.3);
  color: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: space-between;
}

.ai-toggle-btn:hover {
  background: rgba(79, 70, 229, 0.25);
  transform: translateY(-1px);
}

.ai-toggle-btn.active {
  background: rgba(79, 70, 229, 0.3);
  border-color: rgba(79, 70, 229, 0.5);
}

.ai-mini-icon {
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border-radius: 3px;
  position: relative;
}

.ai-mini-icon::before {
  content: '';
  position: absolute;
  inset: 2px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1px;
}

.toggle-arrow {
  transition: transform 0.2s ease;
  font-size: 0.75rem;
}

.toggle-arrow.open {
  transform: rotate(180deg);
}

.ai-section {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.api-status-mini {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-success {
  background: #10b981;
}

.status-error {
  background: #ef4444;
}

.status-loading {
  background: #3b82f6;
  animation: pulse 2s infinite;
}

.status-text-mini {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.trend-mini {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.trend-item-mini {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.generate-btn-mini {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.8) 0%, rgba(124, 58, 237, 0.8) 100%);
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  justify-content: center;
}

.generate-btn-mini:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.generate-btn-mini:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner-mini {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.generated-preview {
  margin-top: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-content {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
}

.adopt-btn-mini,
.regenerate-btn-mini {
  flex: 1;
  padding: 0.375rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.adopt-btn-mini {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.8) 0%, rgba(124, 58, 237, 0.8) 100%);
  color: white;
  border: none;
}

.adopt-btn-mini:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}

.regenerate-btn-mini {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.regenerate-btn-mini:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.error-mini {
  margin-top: 0.5rem;
  color: #fca5a5;
  font-size: 0.75rem;
  font-weight: 500;
}

.question-content {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.question-text {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #ffffff;
  margin: 0;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.question-footer {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.today-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.today-label.ai-label {
  background: rgba(79, 70, 229, 0.3);
  color: rgba(255, 255, 255, 0.9);
  position: relative;
}

.today-label.ai-label::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: #4f46e5;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(79, 70, 229, 0.6);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .question-card {
    padding: 1.5rem;
    margin: 0.5rem 0;
  }
  
  .question-text {
    font-size: 1.125rem;
  }
  
  .preview-actions {
    flex-direction: column;
  }
}
</style> 