<template>
  <div class="header">
    <div class="header-btn">
      <hanburger @click="changeAside"></hanburger>
      <span class="breadcrumb-item">{{ route.meta.title }}</span>
    </div>
    <!-- 🔍 快速搜索入口 -->
    <div class="quick-search" v-if="!isMobile">
      <el-input
        v-model="quickSearchKeyword"
        placeholder="快速搜索邮件..."
        class="search-input"
        clearable
        @keyup.enter="handleQuickSearch"
        @focus="handleSearchFocus"
      >
        <template #prefix>
          <Icon icon="material-symbols:search" width="16" height="16" />
        </template>
      </el-input>
    </div>
    
    <!-- 📱 移动端头部简化 - 写邮件按钮移至悬浮位置 -->
    <div class="toolbar">
      <div class="email">
        <span>{{ userStore.user.email }}</span>
      </div>
      <el-dropdown :teleported="true" popper-class="detail-dropdown" >
        <div class="avatar">
          <div class="avatar-text">
            <div>{{ formatName(userStore.user.email) }}</div>
          </div>
          <Icon class="setting-icon" icon="mingcute:down-small-fill" width="24" height="24" />
        </div>
        <template #dropdown>
          <div class="user-details">
            <div class="details-avatar">
              {{ formatName(userStore.user.email) }}
            </div>
            <div class="user-name">
              {{userStore.user.name}}
            </div>
            <div class="detail-email">
              {{ userStore.user.email }}
            </div>
            <div class="detail-user-type">
              <el-tag >{{userStore.user.role.name}}</el-tag>
            </div>
            <div class="action-info">
              <div>
                <span style="margin-right: 10px">邮件发送 :</span>
                <span style="margin-right: 10px">邮箱添加 :</span>
              </div>
              <div>
                <div>
                  <span v-if="sendCount" style="margin-right: 5px" >{{  sendCount }}</span>
                  <el-tag v-if="!hasPerm('email:send')" >{{sendType}}</el-tag>
                  <el-tag v-else >{{sendType}}</el-tag>
                </div>
                <div>
                  <el-tag v-if="settingStore.settings.manyEmail || settingStore.settings.addEmail" >已关闭</el-tag>
                  <span v-else-if="accountCount && hasPerm('account:add')" style="margin-right: 5px">{{  accountCount }}个</span>
                  <el-tag v-else-if="!accountCount && hasPerm('account:add')" >无限制</el-tag>
                  <el-tag v-else-if="!hasPerm('account:add')" >无权限</el-tag>
                </div>
              </div>
            </div>
            <div class="logout">
              <el-button type="primary" :loading="logoutLoading" @click="clickLogout">退出</el-button>
            </div>
          </div>
        </template>
      </el-dropdown>
      <div class="full" @click="full">
        <Icon icon="iconamoon:screen-full-light" width="22" height="22" />
      </div>
    </div>
  </div>
</template>

<script setup>
import router from "@/router";
import hanburger from '@/components/hamburger/index.vue'
import { logout} from "@/request/login.js";
import {Icon} from "@iconify/vue";
import {useUiStore} from "@/store/ui.js";
import {useUserStore} from "@/store/user.js";
import { useRoute } from "vue-router";
import {computed, ref, onMounted, onBeforeUnmount} from "vue";
import {useSettingStore} from "@/store/setting.js";
import hasPerm from "@/utils/perm.js";
import screenfull from "screenfull";

const route = useRoute();
const settingStore = useSettingStore();
const userStore = useUserStore();
const uiStore = useUiStore();
const logoutLoading = ref(false)

// 🔍 搜索相关状态
const quickSearchKeyword = ref('')
const isMobile = ref(window.innerWidth < 768)

// 🔍 处理窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

// 🔍 快速搜索处理
function handleQuickSearch() {
  if (quickSearchKeyword.value.trim()) {
    router.push({
      name: 'search',
      query: { q: quickSearchKeyword.value.trim() }
    })
  }
}

// 🔍 搜索框获得焦点时的处理
function handleSearchFocus() {
  // 如果当前不在搜索页面，可以直接跳转到搜索页面
  if (route.name !== 'search') {
    router.push({ name: 'search' })
  }
}

const accountCount = computed(() => {
  return userStore.user.role.accountCount
})

const sendType = computed(() => {

  if (!hasPerm('email:send')) {
    return '无权限'
  }

  if (userStore.user.role.sendCount === 0) {
    return '无限制'
  }

  if (userStore.user.role.sendType === 'day') {
    return '每天'
  }
  if (userStore.user.role.sendType === 'count') {
    return '次数'
  }
})

const sendCount = computed(() => {

  if (!hasPerm('email:send')) {
    return null
  }

  if (!userStore.user.role.sendCount) {
    return null
  }
  return userStore.user.sendCount + '/' + userStore.user.role.sendCount
})

function openSend() {
  uiStore.writerRef.open()
}

function changeAside() {
  uiStore.asideShow = !uiStore.asideShow
}

function clickLogout() {
  logoutLoading.value = true
  logout().then(() => {
    localStorage.removeItem("token")
    router.replace('/login')
  }).finally(() => {
    logoutLoading.value = false
  })
}

function formatName(email) {
  return email[0]?.toUpperCase() || ''
}

function full() {
  screenfull.toggle();
}

</script>

<style lang="scss" scoped>

.breadcrumb-item {
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
  color: var(--neutral-800);

  @media (max-width: 768px) {
    /* 📱 移动端标题优化 */
    font-size: 18px;
    font-weight: 600;
    color: var(--neutral-900);
  }

  @media (max-width: 480px) {
    font-size: 17px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

:deep(.el-popper.is-pure) {
  border-radius: 6px;
}

.user-details {
  width: 280px;
  font-size: 14px;
  color: var(--neutral-700);
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  /* 🎨 现代化用户面板背景 */
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 24px 20px;
  box-shadow:
    0 20px 25px rgba(0, 0, 0, 0.1),
    0 10px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(226, 232, 240, 0.8);
  .user-name {
    font-weight: 600;
    font-size: 18px;
    margin-top: 12px;
    color: var(--neutral-900);
    text-align: center;
    max-width: 240px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .detail-user-type {
    margin-top: 16px;

    .el-tag {
      background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
      color: white;
      border: none;
      border-radius: 20px;
      padding: 6px 16px;
      font-weight: 500;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
  }

  .action-info {
    width: 100%;
    margin-top: 20px;
    padding: 16px;
    background: rgba(37, 99, 235, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(37, 99, 235, 0.1);

    display: grid;
    grid-template-columns: auto auto;
    gap: 16px;

    >div:first-child {
      display: grid;
      gap: 8px;
      font-size: 13px;
      color: var(--neutral-600);
      font-weight: 500;
    }
    >div:last-child {
      display: grid;
      gap: 8px;
      text-align: right;

      >div {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;

        .el-tag {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 500;
        }
      }
    }
  }

  .detail-email {
    margin-top: 4px;
    font-size: 13px;
    color: var(--neutral-500);
    text-align: center;
    max-width: 240px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    background: var(--neutral-100);
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--neutral-200);
  }
  .logout {
    margin-top: 24px;
    width: 100%;

    .el-button {
      width: 100%;
      height: 44px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border: none;
      color: white;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: linear-gradient(135deg, #dc2626, #b91c1c);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
  .details-avatar {
    margin-top: 0;
    height: 64px;
    width: 64px;
    background: var(--gradient-primary);
    color: white;
    font-size: 24px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow:
      0 8px 16px rgba(37, 99, 235, 0.3),
      0 0 0 1px rgba(37, 99, 235, 0.1);
  }
}



.header {
  text-align: right;
  font-size: 12px;
  display: grid;
  height: 100%;
  gap: 10px;
  grid-template-columns: auto 1fr auto;
  padding: 0 20px;
  align-items: center;

  @media (max-width: 768px) {
    /* 📱 移动端头部优化 - 标准56px高度 */
    height: 56px;
    gap: 12px;
    font-size: 14px;
    padding: 0 16px;
    grid-template-columns: auto 1fr auto;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  }

  @media (max-width: 480px) {
    height: 56px;
    gap: 8px;
    font-size: 14px;
    padding: 0 12px;
    grid-template-columns: auto 1fr auto;
  }
}

/* 🔍 快速搜索样式 */
.quick-search {
  flex: 1;
  max-width: 400px;
  margin: 0 20px;

  .search-input {
    :deep(.el-input__inner) {
      height: 36px;
      border-radius: 18px;
      border: 1px solid #e2e8f0;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      font-size: 14px;

      &:focus {
        border-color: var(--el-color-primary);
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
        background: rgba(255, 255, 255, 1);
      }

      &::placeholder {
        color: #94a3b8;
        font-size: 13px;
      }
    }

    :deep(.el-input__prefix) {
      left: 12px;
      color: #64748b;
    }

    :deep(.el-input__suffix) {
      right: 8px;
    }
  }

  @media (max-width: 1024px) {
    max-width: 300px;
    margin: 0 16px;
  }

  @media (max-width: 768px) {
    display: none; /* 移动端隐藏，使用侧边栏搜索 */
  }
}

/* 📱 写邮件按钮样式已移至悬浮组件 */

.header-btn {
  display: inline-flex;
  align-items: center;
  height: 100%;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 6px;
  }

  @media (max-width: 480px) {
    gap: 4px;
  }
}



.toolbar {
  display: grid;
  grid-template-columns: 1fr auto auto;
  margin-left: auto;
  align-items: center;
  gap: 8px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr auto;
  }

  @media (max-width: 768px) {
    gap: 6px;
    grid-template-columns: auto auto;
  }

  @media (max-width: 480px) {
    gap: 4px;
    grid-template-columns: auto;
  }
  .full {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 20px;
    cursor: pointer;
    @media (max-width: 1024px) {
      display: none;
    }
  }
  .email {
    align-self: center;
    font-size: 14px;
    margin-right: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: bold;
    width: 100%;

    @media (max-width: 768px) {
      font-size: 12px;
      margin-right: 8px;
      max-width: 120px;
    }

    @media (max-width: 480px) {
      display: none; /* 超小屏幕隐藏邮箱地址 */
    }
  }

  .avatar {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-left: 10px;

    .avatar-text {
      height: 32px;
      width: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      border: 2px solid var(--primary-blue);
      background: var(--gradient-primary);
      color: white;
      font-weight: 600;
      font-size: 14px;

      @media (max-width: 768px) {
        height: 36px;
        width: 36px;
        font-size: 15px;
      }
    }

    .setting-icon {
      margin-left: 4px;
      color: var(--neutral-600);
      transition: all 0.2s ease;

      @media (max-width: 768px) {
        margin-left: 6px;
      }
    }

    &:hover .setting-icon {
      color: var(--primary-blue);
    }
  }

}
.el-tooltip__trigger:first-child:focus-visible {
  outline: unset;
}

/* 🎯 修复个人信息面板层级问题 */
:deep(.detail-dropdown) {
  z-index: 9999 !important;
  box-shadow:
    0 20px 25px rgba(0, 0, 0, 0.1),
    0 10px 10px rgba(0, 0, 0, 0.04) !important;
  border: none !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  backdrop-filter: blur(20px) !important;
  background: transparent !important;
  padding: 0 !important;

  /* 🎭 进入动画 */
  animation: dropdownSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 🎨 用户信息面板额外美化 */
.user-details {
  /* 添加微妙的渐变边框 */
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--gradient-primary);
    border-radius: 16px 16px 0 0;
  }

  /* 添加底部装饰线 */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background: var(--neutral-200);
    border-radius: 2px;
  }
}
</style>
