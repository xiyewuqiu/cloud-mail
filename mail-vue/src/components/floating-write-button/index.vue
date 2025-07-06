<template>
  <div class="floating-write-button" @click="openSend">
    <div class="fab-button">
      <Icon icon="material-symbols:edit-outline-sharp" class="fab-icon" />
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { useUiStore } from '@/store/ui.js'

const uiStore = useUiStore()

function openSend() {
  uiStore.writerRef.open()
}
</script>

<style lang="scss" scoped>
.floating-write-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  
  /* 📱 移动端优化 */
  @media (max-width: 768px) {
    bottom: 24px;
    right: 16px;
  }
  
  @media (max-width: 480px) {
    bottom: 20px;
    right: 16px;
  }
}

.fab-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 6px 16px rgba(37, 99, 235, 0.4),
    0 3px 6px rgba(0, 0, 0, 0.12);
  
  /* 🎨 悬浮效果 */
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 
      0 8px 25px rgba(37, 99, 235, 0.5),
      0 5px 10px rgba(0, 0, 0, 0.15);
    background: var(--primary-blue-dark);
  }
  
  /* 📱 移动端触摸优化 */
  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    
    /* 移动端禁用hover效果，使用active */
    &:hover {
      transform: none;
      box-shadow: 
        0 6px 16px rgba(37, 99, 235, 0.4),
        0 3px 6px rgba(0, 0, 0, 0.12);
      background: var(--gradient-primary);
    }
    
    &:active {
      transform: scale(0.95);
      box-shadow: 
        0 4px 12px rgba(37, 99, 235, 0.3),
        0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
  
  @media (max-width: 480px) {
    width: 52px;
    height: 52px;
  }
}

.fab-icon {
  font-size: 24px;
  transition: all 0.2s ease;
  
  @media (max-width: 480px) {
    font-size: 22px;
  }
}

/* 🎭 进入动画 */
.floating-write-button {
  animation: fabSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fabSlideIn {
  from {
    transform: translateY(100px) scale(0);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* 🌊 脉冲动画（可选，突出写邮件功能） */
.fab-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: var(--primary-blue);
  opacity: 0;
  transform: scale(1);
  animation: fabPulse 2s infinite;
}

@keyframes fabPulse {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* 🎯 确保按钮在所有内容之上 */
.floating-write-button {
  /* 确保在侧边栏之上 */
  z-index: 1001;
}

/* 📱 安全区域适配（iPhone X等） */
@supports (bottom: env(safe-area-inset-bottom)) {
  .floating-write-button {
    bottom: calc(20px + env(safe-area-inset-bottom));
    
    @media (max-width: 768px) {
      bottom: calc(24px + env(safe-area-inset-bottom));
    }
  }
}
</style>
