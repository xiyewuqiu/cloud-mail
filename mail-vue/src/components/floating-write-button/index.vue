<template>
  <!-- 💌 智能隐藏：当邮件撰写界面打开时自动隐藏悬浮按钮 -->
  <Transition name="fab-fade" mode="out-in">
    <div
      v-show="!uiStore.isWriterOpen"
      class="floating-write-button"
      @click="openSend"
    >
      <div class="fab-button">
        <Icon icon="material-symbols:edit-outline-sharp" class="fab-icon" />
      </div>
    </div>
  </Transition>
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
  /* 🎨 融洽设计 - 毛玻璃悬浮按钮 */
  background: linear-gradient(135deg,
    rgba(37, 99, 235, 0.9) 0%,
    rgba(29, 78, 216, 0.95) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 8px 20px rgba(37, 99, 235, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  /* 🎨 融洽悬浮效果 */
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow:
      0 12px 30px rgba(37, 99, 235, 0.4),
      0 6px 12px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    background: linear-gradient(135deg,
      rgba(29, 78, 216, 0.95) 0%,
      rgba(30, 64, 175, 1) 100%
    );
    backdrop-filter: blur(25px) saturate(200%);
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

/* 🌊 融洽脉冲动画 - 更柔和的呼吸效果 */
.fab-button::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg,
    rgba(37, 99, 235, 0.3) 0%,
    rgba(16, 185, 129, 0.2) 100%
  );
  opacity: 0;
  transform: scale(1);
  animation: fabPulse 3s infinite ease-in-out;
}

@keyframes fabPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.4;
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

/* 💫 智能隐藏过渡动画 */
.fab-fade-enter-active,
.fab-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.fab-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}
</style>
