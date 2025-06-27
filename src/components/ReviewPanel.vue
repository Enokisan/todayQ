<template>
  <div class="review-panel">
    <div class="review-header">
      <h3>過去の振り返り</h3>
      <span class="memo-count">{{ memosList.length }}件の記録</span>
    </div>
    
    <div v-if="memosList.length === 0" class="empty-state">
      <div class="empty-icon"></div>
      <p>まだ記録がありません</p>
      <p class="empty-subtitle">今日から思考の記録を始めてみましょう</p>
    </div>
    
    <div v-else class="memos-list">
      <div
        v-for="memo in displayedMemos"
        :key="`${memo.date}-${memo.id}`"
        class="memo-item"
      >
        <div class="memo-date">
          <span class="date-text">{{ formatDisplayDate(memo.date) }}</span>
          <span class="days-ago">{{ getDaysAgo(memo.date) }}</span>
          <span class="memo-time">{{ formatTime(memo.timestamp) }}</span>
        </div>
        <div class="memo-content">
          <div v-if="memo.question" class="memo-question">
            <span class="question-label">
              <span class="label-icon" :class="memo.isAiGenerated ? 'ai-icon' : 'question-icon'"></span>
              {{ memo.isAiGenerated ? 'AI生成質問' : '今日の問い' }}
            </span>
            <p class="question-text">{{ memo.question }}</p>
          </div>
          <div class="memo-answer">
            <span class="answer-label">
              <span class="label-icon thought-icon"></span>
              あなたの思考
            </span>
            <p class="memo-text">{{ memo.memo }}</p>
          </div>
        </div>
        <div class="memo-actions">
          <button 
            @click="deleteMemo(memo.id, memo.date)"
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
    

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  memosList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['delete-memo'])

const displayLimit = ref(5)

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

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
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

const deleteMemo = (memoId, date) => {
  if (confirm('この記録を削除しますか？')) {
    emit('delete-memo', { id: memoId, date: date })
  }
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
  width: 48px;
  height: 48px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  margin: 0 auto 1rem;
  position: relative;
}

.empty-icon::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
}

.empty-icon::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  background: repeating-linear-gradient(
    transparent,
    transparent 3px,
    rgba(255, 255, 255, 0.2) 3px,
    rgba(255, 255, 255, 0.2) 4px
  );
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
  flex-wrap: wrap;
  gap: 0.5rem;
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

.memo-time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 8px;
  margin-left: auto;
}

.memo-content {
  margin-bottom: 0.75rem;
}

.memo-question {
  background: rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.memo-answer {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
}

.question-label,
.answer-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-icon {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  position: relative;
}

.question-icon {
  background: rgba(102, 126, 234, 0.6);
}

.ai-icon {
  background: rgba(79, 70, 229, 0.6);
  position: relative;
}

.ai-icon::before {
  content: '';
  position: absolute;
  inset: 2px;
  background: rgba(79, 70, 229, 0.8);
  border-radius: 1px;
}

.thought-icon {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
}

.thought-icon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
}

.question-text {
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.5;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.memo-text {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin: 0;
  font-size: 0.9rem;
}

.memo-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-delete {
  padding: 0.375rem 0.75rem;
  background: rgba(245, 101, 101, 0.2);
  border: 1px solid rgba(245, 101, 101, 0.3);
  color: #fc8181;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete:hover {
  background: rgba(245, 101, 101, 0.3);
  border-color: rgba(245, 101, 101, 0.5);
}

.load-more {
  text-align: center;
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