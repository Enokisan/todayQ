<template>
  <div class="memo-input">
    <div class="memo-header">
      <h3>今日の思考を記録</h3>
      <span class="char-count" :class="{ 'over-limit': isOverLimit }">
        {{ currentLength }}/140
      </span>
    </div>
    
    <div class="input-container">
      <textarea
        v-model="localMemo"
        placeholder="今日の問いについて、あなたの考えを140文字以内で記録してください..."
        maxlength="140"
        @input="updateCharCount"
        ref="textareaRef"
        class="memo-textarea"
      ></textarea>
    </div>
    
    <div class="memo-actions">
      <button 
        @click="clearMemo" 
        class="btn btn-secondary"
        :disabled="!localMemo.trim()"
      >
        クリア
      </button>
      <button 
        @click="saveMemo" 
        class="btn btn-primary"
        :disabled="!localMemo.trim() || isOverLimit"
      >
        保存
      </button>
    </div>
    
    <div v-if="saveStatus" class="save-status" :class="saveStatus.type">
      {{ saveStatus.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'clear'])

const localMemo = ref(props.modelValue)
const textareaRef = ref(null)
const saveStatus = ref(null)

const currentLength = computed(() => localMemo.value.length)
const isOverLimit = computed(() => currentLength.value > 140)

watch(() => props.modelValue, (newValue) => {
  localMemo.value = newValue
})

const updateCharCount = () => {
  emit('update:modelValue', localMemo.value)
}

const saveMemo = async () => {
  if (!localMemo.value.trim() || isOverLimit.value) return
  
  try {
    emit('save', localMemo.value.trim())
    showSaveStatus('保存しました！', 'success')
  } catch (error) {
    showSaveStatus('保存に失敗しました', 'error')
  }
}

const clearMemo = () => {
  localMemo.value = ''
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const showSaveStatus = (message, type) => {
  saveStatus.value = { message, type }
  setTimeout(() => {
    saveStatus.value = null
  }, 3000)
}
</script>

<style scoped>
.memo-input {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.memo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.memo-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 600;
}

.char-count {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  transition: color 0.2s ease;
}

.char-count.over-limit {
  color: #ff6b6b;
}

.input-container {
  margin-bottom: 1rem;
}

.memo-textarea {
  width: 100%;
  min-height: 120px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  color: #ffffff;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: inherit;
}

.memo-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.memo-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.memo-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-status {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.save-status.success {
  background: rgba(72, 187, 120, 0.2);
  color: #68d391;
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.save-status.error {
  background: rgba(245, 101, 101, 0.2);
  color: #fc8181;
  border: 1px solid rgba(245, 101, 101, 0.3);
}

@media (max-width: 768px) {
  .memo-input {
    padding: 1rem;
  }
  
  .memo-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn {
    width: 100%;
  }
}
</style> 