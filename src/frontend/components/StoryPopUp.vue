<template>
  <Transition name="fade">
    <div v-if="show" class="story-popup-overlay" @click="closePopup">
      <div class="story-popup" @click.stop>
        <div class="story-content">
          <p class="story-text">{{ currentStory }}</p>
          <button class="close-button" @click="closePopup">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import storyData from '../../story-filled.json';

const props = defineProps({
  level: {
    type: Number,
    required: true
  }
});

const show = ref(false);
const currentStory = ref('');

// Surveille les changements de niveau
watch(() => props.level, (newLevel) => {
  const story = storyData.unlocks.find(s => s.level === newLevel);
  if (story) {
    currentStory.value = story.description;
    show.value = true;
  }
}, { immediate: true });

const closePopup = () => {
  show.value = false;
};
</script>

<style scoped>
.story-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.story-popup {
  background: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.story-content {
  overflow-y: auto;
  max-height: calc(80vh - 60px);
  padding-right: 10px;
}

h2 {
  margin-top: 0;
  color: #333;
  margin-bottom: 20px;
}

.story-text {
  line-height: 1.6;
  white-space: pre-line;
  color: #444;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 5px;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 