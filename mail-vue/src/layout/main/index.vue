<template>
  <div :class="accountShow && hasPerm('account:query') ? 'main-box-show' : 'main-box-hide'">
    <div :class="accountShow && hasPerm('account:query') ? 'block-show' : 'block-hide'" @click="uiStore.accountShow = false"></div>
    <account  :class="accountShow && hasPerm('account:query') ? 'show' : 'hide'" />
    <router-view class="main-view" v-slot="{ Component,route }">
      <keep-alive :include="['email','sys-email','send','sys-setting','star','user','role','analysis']">
        <component :is="Component" :key="route.name"/>
      </keep-alive>
    </router-view>
  </div>
</template>
<script setup>
import account from '@/layout/account/index.vue'
import {useUiStore} from "@/store/ui.js";
import {useSettingStore} from "@/store/setting.js";
import {computed, onBeforeUnmount, onMounted} from "vue";
import { useRoute } from 'vue-router'
import hasPerm from "@/utils/perm.js";

const props = defineProps({
  openSend: Function
})

const settingStore = useSettingStore()
const uiStore = useUiStore();
const route = useRoute()
let  innerWidth =  window.innerWidth

const accountShow = computed(() => {
  return uiStore.accountShow && settingStore.settings.manyEmail === 0
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (['content','email','send'].includes(route.meta.name)) {
    if (innerWidth !==  window.innerWidth) {
      innerWidth = window.innerWidth;
      uiStore.accountShow = window.innerWidth >= 767;
    }
  }
}

</script>

<style lang="scss" scoped>

/* 🎭 遮罩层优化 - 现代毛玻璃效果 */
.block-show {
  position: fixed;

  @media (max-width: 767px) {
    position: absolute;
    right: 0;
    border: 0;
    height: 100%;
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px) saturate(180%);
    opacity: 1;
    z-index: 10;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.block-hide {
  position: fixed;
  pointer-events: none;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 🎭 账户面板动画优化 */
.show {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(0);
  opacity: 1;

  @media (max-width: 767px) {
    position: fixed;
    z-index: 100;
    width: 250px;
    box-shadow:
      0 25px 50px rgba(0, 0, 0, 0.15),
      0 10px 20px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px) saturate(180%);
    border-radius: 0 12px 12px 0;
  }
}

.hide {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: fixed;
  transform: translateX(-100%);
  opacity: 0;

  @media (max-width: 1024px) {
    width: 250px;
    z-index: 100;
  }
}


.main-box-show {
  display: grid;
  grid-template-columns: 260px  1fr;
  height: calc(100% - 60px);
  @media (max-width: 1200px) {
    grid-template-columns: 250px  1fr;
  }
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.main-box-hide {
  display: grid;
  grid-template-columns: 1fr;
  height: calc(100% - 60px);
}


/* 🎨 主视图区域美化 */
.main-view {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(248, 250, 252, 0.95) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.05),
    0 4px 10px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* 🌟 添加微妙的背景纹理 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.02) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.02) 0%, transparent 50%);
    pointer-events: none;
    border-radius: inherit;
  }

  @media (max-width: 768px) {
    border-radius: 8px;
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(248, 250, 252, 0.92) 100%
    );
  }

  @media (max-width: 480px) {
    border-radius: 6px;
  }
}


.navigation {
  height: 30px;
  border-bottom: solid 1px var(--el-menu-border-color);
  display: inline-flex;
  justify-items: center;
  align-items: center;
  width: 100%;
  .tag {
    background: #FFFFFF;
    margin-left: 5px;
  }
}
</style>
