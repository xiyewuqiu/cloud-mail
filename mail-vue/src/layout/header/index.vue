<template>
  <div class="header">
    <div class="header-btn">
      <hanburger @click="changeAside"></hanburger>
      <span class="breadcrumb-item">{{ route.meta.title }}</span>
    </div>
    <div class="writer-box" @click="openSend">
      <div class="writer" >
        <Icon icon="material-symbols:edit-outline-sharp" width="22" height="22" />
      </div>
    </div>
    <div class="toolbar">
      <div class="email">
        <span>{{ userStore.user.email }}</span>
      </div>
      <el-dropdown :teleported="false" popper-class="detail-dropdown" >
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
  font-weight: bold;
  font-size: 14px;
  white-space: nowrap;
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
  grid-template-columns: auto auto 1fr;

  @media (max-width: 768px) {
    gap: 8px;
    font-size: 11px;
  }

  @media (max-width: 480px) {
    gap: 6px;
    font-size: 10px;
    grid-template-columns: auto 1fr;
  }
}

.writer-box {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  .writer {
    width:  40px;
    height: 40px;
    border-radius: 10px;
    color: #ffffff;
    /* 🎨 现代写邮件按钮 */
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
    }

    @media (max-width: 768px) {
      width: 36px;
      height: 36px;
      border-radius: 10px;
    }

    @media (max-width: 480px) {
      width: 32px;
      height: 32px;
      border-radius: 8px;

      &:hover {
        transform: none;
      }
    }
    .writer-text {
      margin-left: 15px;
      font-size: 14px;
      font-weight: bold;
    }
  }
}

.header-btn {
  display: inline-flex;
  align-items: center;
  height: 100%;
}



.toolbar {
  display: grid;
  grid-template-columns: 1fr auto auto;
  margin-left: auto;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr auto;
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
  }

  .avatar {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-left: 10px;
    .avatar-text {
      height: 30px;
      width: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 8px;
      border: 1px solid #ccc;
    }

    .setting-icon {
      position: relative;
      top: 0;
      margin-right: 5px;
      bottom: 10px;
      @media (max-width: 1024px) {
        margin-right: 10px;
      }
    }
  }

}
.el-tooltip__trigger:first-child:focus-visible {
  outline: unset;
}
</style>
