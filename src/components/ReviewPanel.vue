<template>
  <div class="review-panel">
    <div class="review-header">
      <h3>過去の振り返り</h3>
      <span class="memo-count">{{ memosList.length }}日分の記録</span>
    </div>
    
    <div v-if="memosList.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p>まだ記録がありません</p>
      <p class="empty-subtitle">今日から思考の記録を始めてみましょう</p>
    </div>
    
    <div v-else class="memos-list">
      <div
        v-for="memo in displayedMemos"
        :key="memo.date"
        class="memo-item"
      >
        <div class="memo-date">
          <span class="date-text">{{ formatDisplayDate(memo.date) }}</span>
          <span class="days-ago">{{ getDaysAgo(memo.date) }}</span>
        </div>
        <div class="memo-content">
          <p class="memo-text">{{ memo.memo }}</p>
        </div>
        <div class="memo-actions">
          <button 
            @click="showQuestion(memo.date)"
            class="btn-link"
            title="その日の問いを見る"
          >
            問いを見る
          </button>
          <button 
            @click="deleteMemo(memo.date)"
            class="btn-delete"
            title="削除"
          >
            削除
          </button>
        </div>
      </div>
      
      <div v-if="memosList.length > displayLimit" class="load-more">
        <button @click="loadMore" class="btn btn-secondary">
          もっと見る ({{ memosList.length - displayedMemos.length }}件)
        </button>
      </div>
    </div>
    
    <!-- 問い表示モーダル -->
    <div v-if="showingQuestion" class="modal-overlay" @click="closeQuestionModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>{{ formatDisplayDate(selectedDate) }}の問い</h4>
          <button @click="closeQuestionModal" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <p class="question-text">{{ selectedQuestion }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getQuestionForDate } from '../data/questions.js'

const props = defineProps({
  memosList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['delete-memo'])

const displayLimit = ref(5)
const showingQuestion = ref(false)
const selectedDate = ref('')
const selectedQuestion = ref('')

const displayedMemos = computed(() => {
  return props.memosList.slice(0, displayLimit.value)
})

const formatDisplayDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  })
}

const getDaysAgo = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = today - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今日'
  if (diffDays === 1) return '昨日'
  if (diffDays < 7) return `${diffDays}日前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`
  return `${Math.floor(diffDays / 365)}年前`
}

const loadMore = () => {
  displayLimit.value += 5
}

const deleteMemo = (date) => {
  if (confirm('この記録を削除しますか？')) {
    emit('delete-memo', date)
  }
}

const showQuestion = (dateString) => {
  const date = new Date(dateString)
  selectedDate.value = dateString
  selectedQuestion.value = getQuestionForDate(date)
  showingQuestion.value = true
}

const closeQuestionModal = () => {
  showingQuestion.value = false
  selectedDate.value = ''
  selectedQuestion.value = ''
}
</script>

<style scoped>
.review-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.review-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 600;
}

.memo-count {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-subtitle {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.memos-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.memo-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.memo-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.memo-date {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.date-text {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.875rem;
}

.days-ago {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.memo-content {
  margin-bottom: 0.75rem;
}

.memo-text {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin: 0;
  font-size: 0.9rem;
}

.memo-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-link {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #7c8aed;
}

.btn-delete {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-delete:hover {
  background: rgba(245, 101, 101, 0.1);
  color: #fc8181;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h4 {
  margin: 0;
  color: #ffffff;
  font-size: 1.125rem;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.modal-body {
  padding: 1.5rem;
}

.question-text {
  color: #ffffff;
  line-height: 1.6;
  margin: 0;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .review-panel {
    padding: 1rem;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .memo-date {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .memo-actions {
    justify-content: flex-start;
  }
  
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
}
</style> 