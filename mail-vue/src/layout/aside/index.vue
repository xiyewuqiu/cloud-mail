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
  border-radius: 12px;
  display: flex;
  position: relative;
  font-size: 18px;
  font-weight: 700;
  align-items: center;
  justify-content: center;
  gap: 10px;
  /* 🎨 现代邮箱品牌标题 */
  color: #2563eb;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid rgba(37, 99, 235, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.15);
    border-color: rgba(37, 99, 235, 0.2);
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
    margin: 12px 8px;
    height: 52px;
    font-size: 16px;
    gap: 8px;

    :deep(.el-icon) {
      font-size: 20px;
    }
  }

  @media (max-width: 480px) {
    margin: 10px 6px;
    height: 48px;
    font-size: 15px;
    gap: 6px;
    border-radius: 10px;

    :deep(.el-icon) {
      font-size: 18px;
    }
  }

  @media (max-width: 360px) {
    margin: 8px 4px;
    height: 44px;
    font-size: 14px;
    gap: 4px;
    border-radius: 8px;

    :deep(.el-icon) {
      font-size: 16px;
    }
  }

}


.manage-title {
  margin: 25px 0 15px 25px;
  /* 🎯 现代邮箱分组标题 */
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
    margin: 6px 10px !important;
    height: 44px;
    padding: 12px 16px !important;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    margin: 4px 8px !important;
    height: 40px;
    padding: 10px 14px !important;
    border-radius: 8px;

    .menu-name {
      font-size: 14px;
    }
  }

  @media (max-width: 360px) {
    margin: 3px 6px !important;
    height: 36px;
    padding: 8px 12px !important;
    border-radius: 6px;

    .menu-name {
      font-size: 13px;
    }
  }
}

.choose-item {
  font-weight: 600;
  /* 🎯 现代邮箱选中状态 */
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.05)) !important;
  border: 1px solid rgba(37, 99, 235, 0.2);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);

  .menu-name {
    color: #2563eb;
    font-weight: 600;
  }

  :deep(.iconify) {
    color: #2563eb;
  }
}

@media (hover: hover) {
  .el-menu-item:hover {
    /* 🎨 现代邮箱菜单悬停效果 */
    background: rgba(37, 99, 235, 0.05) !important;
    transform: translateX(2px);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
    border: 1px solid rgba(37, 99, 235, 0.1);
  }
}

.menu-name {
  user-select: none;
  font-weight: 500;
  transition: all 0.3s ease;
}


:deep(.el-scrollbar__wrap--hidden-default ) {
  /* 🎨 融洽设计 - 侧边栏背景 */
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 252, 0.9) 50%,
    rgba(241, 245, 249, 0.85) 100%
  ) !important;
  backdrop-filter: blur(20px) saturate(180%);
  border-right: 1px solid rgba(226, 232, 240, 0.4);
  position: relative;

  /* 🌟 添加右侧渐变过渡 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: -1px;
    bottom: 0;
    width: 8px;
    background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 100%
    );
    pointer-events: none;
  }
}

:deep(.el-menu-item) {
  background: transparent;
  /* 🎯 现代邮箱菜单文字颜色 */
  color: #374151;
  font-weight: 500;
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

/* 🎨 侧边栏滚动条美化 */
.scroll {
  /* 🌟 自定义滚动条样式 */
  :deep(.el-scrollbar__bar.is-vertical .el-scrollbar__thumb) {
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
    border-radius: 4px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :deep(.el-scrollbar__bar.is-vertical .el-scrollbar__thumb:hover) {
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.2) 100%
    );
    transform: scaleX(1.2);
  }

  :deep(.el-scrollbar__bar.is-vertical) {
    width: 6px;
    right: 2px;
  }

  :deep(.el-scrollbar__track.is-vertical) {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
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
