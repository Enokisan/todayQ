<template>
  <div class="question-card" :class="{ 'ai-generated': isAiGenerated }">
    <div class="date-info">
      {{ formattedDate }}
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
import { computed } from 'vue'

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
  }
})

const formattedDate = computed(() => {
  return props.date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
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

@media (max-width: 768px) {
  .question-card {
    padding: 1.5rem;
    margin: 0.5rem 0;
  }
  
  .question-text {
    font-size: 1.125rem;
  }
}
</style> 