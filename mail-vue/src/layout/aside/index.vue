<template>
  <el-scrollbar class="scroll">
    <div>
      <div class="title" >
        <Icon icon="mdi:email-outline" width="24" height="24" />
        <div>{{settingStore.settings.title}}</div>
      </div>
      <el-menu :collapse="false" text-color="#fff" active-text-color="#fff" style="margin-top: 10px">
        <el-menu-item @click="router.push({name: 'email'})" index="email"
                      :class="route.meta.name === 'email' ? 'choose-item' : ''">
          <Icon icon="hugeicons:mailbox-01" width="20" height="20" />
          <span class="menu-name" style="margin-left: 21px">收件箱</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'send'})" index="send"
                      :class="route.meta.name === 'send' ? 'choose-item' : ''">
          <Icon icon="cil:send" width="20" height="20" />
          <span class="menu-name" style="margin-left: 21px">已发送</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'star'})" index="star"
                      :class="route.meta.name === 'star' ? 'choose-item' : ''">
          <Icon icon="solar:star-line-duotone" width="20" height="20" />
          <span class="menu-name" style="margin-left: 21px">星标邮件</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'setting'})" index="setting"
                      :class="route.meta.name === 'setting' ? 'choose-item' : ''">
          <Icon icon="fluent:settings-48-regular" width="20" height="20" />
          <span class="menu-name" style="margin-left: 21px">个人设置</span>
        </el-menu-item>
        <div class="manage-title" v-perm="['user:query','role:query','setting:query','analysis:query']">
          <div>管理</div>
        </div>
        <el-menu-item @click="router.push({name: 'analysis'})" index="analysis" v-perm="'analysis:query'"
                      :class="route.meta.name === 'analysis' ? 'choose-item' : ''">
          <Icon icon="fluent:data-pie-20-regular" width="24" height="24" />
          <span class="menu-name" style="margin-left: 18px">分析页</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'user'})" index="setting" v-perm="'user:query'"
                      :class="route.meta.name === 'user' ? 'choose-item' : ''">
          <Icon icon="si:user-alt-2-line" width="20" height="20" />
          <span class="menu-name" style="margin-left: 21px">用户列表</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'sys-email'})" index="sys-email" v-perm="'sys-email:query'"
                      :class="route.meta.name === 'sys-email' ? 'choose-item' : ''">
          <Icon icon="fluent:mail-list-28-regular" width="22" height="22" />
          <span class="menu-name" style="margin-left: 20px">邮件列表</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'role'})" index="setting" v-perm="'role:query'"
                      :class="route.meta.name === 'role' ? 'choose-item' : ''">
          <Icon icon="hugeicons:key-02" width="22" height="22" />
          <span class="menu-name" style="margin-left: 20px">权限控制</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'sys-setting'})" index="sys-setting" v-perm="'setting:query'"
                      :class="route.meta.name === 'sys-setting' ? 'choose-item' : ''">
          <Icon icon="eos-icons:system-ok-outlined" width="18" height="18" />
          <span class="menu-name" style="margin-left: 24px">系统设置</span>
        </el-menu-item>
      </el-menu>
    </div>
  </el-scrollbar>
</template>

<script setup>
import router from "@/router/index.js";
import { useRoute } from "vue-router";
import {Icon} from "@iconify/vue";
import {useSettingStore} from "@/store/setting.js";

const settingStore = useSettingStore();
const route = useRoute();

</script>

<style lang="scss" scoped>

.title {
  margin: 20px 15px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  position: relative;
  font-size: 18px;
  font-weight: 700;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: all 0.4s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
  }

  :deep(.el-icon) {
    font-size: 24px;
  }

  .user-right-icon {
    align-self: center;
    position: absolute;
    font-size: 12px;
    right: 12px;
    color: #ffffff;
  }

  @media (max-width: 768px) {
    margin: 15px 10px;
    height: 50px;
    font-size: 16px;
    gap: 6px;

    :deep(.el-icon) {
      font-size: 20px;
    }
  }

  @media (max-width: 480px) {
    margin: 12px 8px;
    height: 45px;
    font-size: 14px;
    gap: 4px;
    border-radius: 12px;

    :deep(.el-icon) {
      font-size: 18px;
    }
  }

}


.manage-title {
  margin: 25px 0 15px 25px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.el-menu-item {
  margin: 8px 15px !important;
  border-radius: 12px;
  height: 44px;
  padding: 12px 16px !important;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  @media (max-width: 768px) {
    margin: 6px 12px !important;
    height: 40px;
    padding: 10px 14px !important;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    margin: 4px 8px !important;
    height: 36px;
    padding: 8px 12px !important;
    border-radius: 8px;

    .menu-name {
      font-size: 13px;
    }
  }
}

.choose-item {
  font-weight: 700;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2)) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);

  .menu-name {
    color: #ffffff;
  }
}

@media (hover: hover) {
  .el-menu-item:hover {
    background: rgba(255, 255, 255, 0.12) !important;
    transform: translateX(4px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
}

.menu-name {
  user-select: none;
  font-weight: 500;
  transition: all 0.3s ease;
}


:deep(.el-scrollbar__wrap--hidden-default ) {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
}

:deep(.el-menu-item) {
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
}

:deep(.el-menu) {
  background: transparent;
  border-right: none;
}

.el-menu {
  border-right: 0;
  width: 280px;
  padding: 0 10px;

  @media (max-width: 1199px) {
    width: 260px;
  }

  @media (max-width: 768px) {
    width: 240px;
    padding: 0 8px;
  }

  @media (max-width: 480px) {
    width: 220px;
    padding: 0 6px;
  }
}

:deep(.el-divider__text) {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
}

.scroll {

}

.github {
  position: absolute;
  width: 100%;
  bottom: 10px;
  display: flex;
  justify-content: center;
  a{
    color: #fff;
  }
}
</style>
