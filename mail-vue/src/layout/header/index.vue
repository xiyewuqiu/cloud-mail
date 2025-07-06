<template>
  <div class="header">
    <div class="header-btn">
      <hanburger @click="changeAside"></hanburger>
      <span class="breadcrumb-item">{{ route.meta.title }}</span>
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
import {computed, ref} from "vue";
import {useSettingStore} from "@/store/setting.js";
import hasPerm from "@/utils/perm.js";
import screenfull from "screenfull";

const route = useRoute();
const settingStore = useSettingStore();
const userStore = useUserStore();
const uiStore = useUiStore();
const logoutLoading = ref(false)

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
  width: 250px;
  font-size: 14px;
  color: #333;
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  .user-name {
    font-weight: bold;
    margin-top: 10px;
    padding-left: 20px;
    padding-right: 20px;
    width: 250px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
  }
  .detail-user-type {
    margin-top: 10px;
  }

  .action-info {
    width: 100%;
    display: grid;
    grid-template-columns: auto auto;
    margin-top: 10px;
    >div:first-child {
      display: grid;
      align-items: center;
      gap: 10px;
    }
    >div:last-child {
      display: grid;
      gap: 10px;
      text-align: center;
      >div {
        display: flex;
        align-items: center;
      }
    }
  }

  .detail-email {
    padding-left: 20px;
    padding-right: 20px;
    width: 250px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
    color: #5c5958;
  }
  .logout {
    margin-top: 20px;
    width: 100%;
    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 10px;
    .el-button {
      border-radius: 6px;
      height: 28px;
      width: 100%;
    }
  }
  .details-avatar {
    margin-top: 20px;
    height: 40px;
    width: 40px;
    border: 1px solid #ccc;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
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
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid var(--neutral-200) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  backdrop-filter: blur(20px) !important;
  background: rgba(255, 255, 255, 0.95) !important;
}
</style>
