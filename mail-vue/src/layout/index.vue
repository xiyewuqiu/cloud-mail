<template>
  <el-container class="layout">
    <el-aside
        class="aside"
        :class="uiStore.asideShow ? 'aside-show' : 'el-aside-hide'">
      <Aside />
    </el-aside>
    <div
        :class="(uiStore.asideShow && isMobile)? 'overlay-show':'overlay-hide'"
        @click="uiStore.asideShow = false"
    ></div>
    <el-container class="main-container">
      <el-main>
        <el-header>
            <Header />
        </el-header>
        <Main />
      </el-main>
    </el-container>
  </el-container>
  <writer ref="writerRef" />
  <!-- 📱 悬浮写邮件按钮 -->
  <floating-write-button />
</template>

<script setup>
import Aside from '@/layout/aside/index.vue'
import Header from '@/layout/header/index.vue'
import Main from '@/layout/main/index.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {useUiStore} from "@/store/ui.js";
import writer from '@/layout/write/index.vue'
import FloatingWriteButton from '@/components/floating-write-button/index.vue'

const uiStore = useUiStore();
const writerRef = ref({})
const isMobile = ref(window.innerWidth < 1025)
const handleResize = () => {
  isMobile.value = window.innerWidth < 1025
  uiStore.asideShow = window.innerWidth > 1024;
}

onMounted(() => {

  uiStore.writerRef = writerRef

  window.addEventListener('resize', handleResize)
  handleResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
/* 🎭 侧边栏动画优化 - 流畅过渡 */
.el-aside-hide {
  position: fixed;
  left: 0;
  height: 100%;
  z-index: 100;
  transform: translateX(-100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
}

.aside-show {
  box-shadow:
    0 25px 50px rgba(0, 21, 41, 0.15),
    0 10px 20px rgba(0, 21, 41, 0.1),
    3px 0 15px rgba(99, 102, 241, 0.1);
  transform: translateX(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  z-index: 101;

  @media (max-width: 1025px) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 101;
    height: 100%;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px) saturate(180%);
    border-right: 1px solid rgba(226, 232, 240, 0.3);
  }
}

.el-aside {
  width: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.layout {
  height: 100%;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
  /* 🎨 融洽设计 - 和谐渐变背景 */
  background: linear-gradient(135deg,
    #f8fafc 0%,
    #f1f5f9 25%,
    #e2e8f0 50%,
    #cbd5e1 75%,
    #b4bcc9 100%
  );
  /* 🌟 增强纹理效果，提升融洽感 */
  background-image:
    radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.06) 0%, transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.04) 0%, transparent 40%),
    radial-gradient(circle at 50% 10%, rgba(245, 158, 11, 0.03) 0%, transparent 30%);
  /* 🎭 添加动态效果 */
  animation: backgroundShift 20s ease-in-out infinite;
}

/* 🎨 全局滚动条美化 - 现代化设计 */
:deep(*::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(*::-webkit-scrollbar-track) {
  background: rgba(241, 245, 249, 0.3);
  border-radius: 3px;
}

:deep(*::-webkit-scrollbar-thumb) {
  background: linear-gradient(135deg,
    rgba(99, 102, 241, 0.4) 0%,
    rgba(139, 92, 246, 0.4) 100%
  );
  border-radius: 3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(*::-webkit-scrollbar-thumb:hover) {
  background: linear-gradient(135deg,
    rgba(99, 102, 241, 0.7) 0%,
    rgba(139, 92, 246, 0.7) 100%
  );
  transform: scale(1.1);
}

:deep(*::-webkit-scrollbar-corner) {
  background: transparent;
}

@keyframes backgroundShift {
  0%, 100% {
    background-position: 0% 0%, 100% 100%, 50% 0%;
  }
  50% {
    background-position: 100% 100%, 0% 0%, 50% 100%;
  }
}

.main-container {
  min-height: 100%;
  /* 🎨 融洽设计 - 渐变背景主容器 */
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 252, 0.9) 50%,
    rgba(241, 245, 249, 0.85) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  margin: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 20px 25px rgba(0, 0, 0, 0.08),
    0 10px 10px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;

  /* 🌟 添加微妙的背景纹理 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 25% 25%, rgba(37, 99, 235, 0.02) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.02) 0%, transparent 50%);
    pointer-events: none;
    border-radius: inherit;
  }

  @media (max-width: 768px) {
    margin: 8px;
    border-radius: 12px;
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.92) 0%,
      rgba(248, 250, 252, 0.88) 100%
    );
  }

  @media (max-width: 480px) {
    margin: 6px;
    border-radius: 10px;
  }
}

.el-main {
  padding: 20px;
  /* 🎨 融洽设计 - 内容区域过渡 */
  position: relative;

  /* 🌟 顶部柔和过渡 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 20px;
    background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 100%
    );
    pointer-events: none;
    z-index: 1;
  }

  @media (max-width: 768px) {
    padding: 12px;

    &::before {
      height: 16px;
    }
  }

  @media (max-width: 480px) {
    padding: 8px;

    &::before {
      height: 12px;
    }
  }

  @media (max-width: 360px) {
    padding: 6px;

    &::before {
      height: 10px;
    }
  }
}

.el-header {
  /* 🎨 融洽设计 - 毛玻璃头部 */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
  border-radius: 16px 16px 0 0;
  padding: 0;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.03);
  position: relative;
  height: 64px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* 🌟 柔和的顶部高光 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent,
      rgba(37, 99, 235, 0.2),
      rgba(16, 185, 129, 0.1),
      transparent
    );
  }

  /* 🎭 底部渐变过渡 */
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 8px;
    background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 100%
    );
    pointer-events: none;
  }

  @media (max-width: 768px) {
    /* 📱 移动端融洽设计 */
    height: 56px;
    border-radius: 12px 12px 0 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid rgba(226, 232, 240, 0.2);
  }

  @media (max-width: 480px) {
    height: 56px;
    border-radius: 10px 10px 0 0;
  }
}

/* 🎭 遮罩层优化 - 现代毛玻璃效果 */
.overlay-show {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px) saturate(180%);
  z-index: 99;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
}

.overlay-hide {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
