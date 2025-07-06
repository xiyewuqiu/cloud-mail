<template>
  <div id="login-box">
    <div id="background-wrap" v-if="!settingStore.settings.background">
      <div class="x1 cloud"></div>
      <div class="x2 cloud"></div>
      <div class="x3 cloud"></div>
      <div class="x4 cloud"></div>
      <div class="x5 cloud"></div>
    </div>
    <div v-else :style="background"></div>
    <div class="form-wrapper">
        <div class="container">
          <span class="form-title">{{settingStore.settings.title}}</span>
          <span class="form-desc" v-if="show === 'login'">请输入账号信息以开始使用邮箱系统</span>
          <span class="form-desc" v-else>请输入账号密码以开始注册邮箱系统</span>
          <div v-if="show === 'login'">
            <el-input class="email-input" v-model="form.email" type="text" placeholder="邮箱" autocomplete="off">
              <template #append>
                <div @click.stop="openSelect">
                  <el-select
                      ref="mySelect"
                      v-model="suffix"
                      placeholder="请选择"
                      class="select"
                  >
                    <el-option
                        v-for="item in domainList"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                  </el-select>
                  <div style="color: #333">
                    <span>{{ suffix }}</span>
                    <Icon class="setting-icon" icon="mingcute:down-small-fill" width="20" height="20"/>
                  </div>
                </div>
              </template>
            </el-input>
            <el-input v-model="form.password" placeholder="密码" type="password" autocomplete="off">
            </el-input>
            <el-button class="btn" type="primary" @click="submit" :loading="loginLoading"
            >登录
            </el-button>
          </div>
          <div v-else>
            <el-input class="email-input" v-model="registerForm.email" type="text" placeholder="邮箱" autocomplete="off">
              <template #append>
                <div @click.stop="openSelect">
                  <el-select
                      ref="mySelect"
                      v-model="suffix"
                      placeholder="请选择"
                      class="select"
                  >
                    <el-option
                        v-for="item in domainList"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                  </el-select>
                  <div style="color: #333">
                    <span>{{ suffix }}</span>
                    <Icon class="setting-icon" icon="mingcute:down-small-fill" width="20" height="20"/>
                  </div>
                </div>
              </template>
            </el-input>
            <el-input v-model="registerForm.password" placeholder="密码" type="password" autocomplete="off" />
            <el-input v-model="registerForm.confirmPassword" placeholder="确认密码" type="password" autocomplete="off" />
            <div v-show="verifyShow"
                class="register-turnstile"
                :data-sitekey="settingStore.settings.siteKey"
                data-callback="onTurnstileSuccess"
            ></div>
            <el-button class="btn" type="primary" @click="submitRegister" :loading="registerLoading"
            >注册
            </el-button>
          </div>
          <template v-if="settingStore.settings.register === 0">
            <div class="switch" @click="show = 'register'" v-if="show === 'login'">还没有账号? <span>创建账号</span></div>
            <div class="switch" @click="show = 'login'" v-else>已有账号? <span>去登录</span></div>
          </template>
        </div>
    </div>
  </div>
</template>

<script setup>
import router from "@/router";
import {computed, nextTick, reactive, ref} from "vue";
import {login} from "@/request/login.js";
import {register} from "@/request/login.js";
import {isEmail} from "@/utils/verify-utils.js";
import {useSettingStore} from "@/store/setting.js";
import {useAccountStore} from "@/store/account.js";
import {useUserStore} from "@/store/user.js";
import {Icon} from "@iconify/vue";
import {cvtR2Url} from "@/utils/convert.js";
import {loginUserInfo} from "@/request/my.js";
import {permsToRouter} from "@/utils/perm.js";

const accountStore = useAccountStore();
const userStore = useUserStore();
const settingStore = useSettingStore();
const loginLoading = ref(false)
const show = ref('login')
const form = reactive({
  email: '',
  password: '',

});
const mySelect = ref()
const suffix = ref('')
const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})
const domainList = settingStore.domainList;
const registerLoading = ref(false)
suffix.value = domainList[0]
const verifyShow = ref(false)
let verifyToken = ''
let turnstileId = null


window.onTurnstileSuccess = (token) => {
  verifyToken = token;
  setTimeout(() => {
    verifyShow.value = false
  }, 2000)
};


const loginOpacity = computed(() => {
  return `rgba(255, 255, 255, ${settingStore.settings.loginOpacity})`
})

const background = computed(() => {

  return settingStore.settings.background ? {
    'background-image': `url(${cvtR2Url(settingStore.settings.background)})`,
    'background-repeat': 'no-repeat',
    'background-size': 'cover',
    'background-position': 'center'
  } : ''
})


const openSelect = () => {
  mySelect.value.toggleMenu()
}


const submit = () => {

  if (!form.email) {
    ElMessage({
      message: '邮箱不能为空',
      type: 'error',
      plain: true,
    })
    return
  }

  if (!isEmail(form.email + suffix.value)) {
    ElMessage({
      message: '输入的邮箱不合法',
      type: 'error',
      plain: true,
    })
    return
  }

  if (!form.password) {
    ElMessage({
      message: '密码不能为空',
      type: 'error',
      plain: true,
    })
    return
  }

  loginLoading.value = true
  login(form.email + suffix.value, form.password).then(async data => {
    localStorage.setItem('token', data.token)
    const user = await loginUserInfo();
    accountStore.currentAccountId = user.accountId;
    userStore.user = user;
    const routers = permsToRouter(user.permKeys);
    routers.forEach(routerData => {
      router.addRoute('layout', routerData);
    });
    await router.replace({name: 'layout'})
  }).finally(() => {
    loginLoading.value = false
  })
}


function submitRegister() {

  if (!registerForm.email) {
    ElMessage({
      message: '邮箱不能为空',
      type: 'error',
      plain: true,
    })
    return
  }

  if (!isEmail(registerForm.email + suffix.value)) {
    ElMessage({
      message: '输入的邮箱不合法',
      type: 'error',
      plain: true,
    })
    return
  }

  if (!registerForm.password) {
    ElMessage({
      message: '密码不能为空',
      type: 'error',
      plain: true,
    })
    return
  }

  if (registerForm.password.length < 6) {
    ElMessage({
      message: '密码最少六位',
      type: 'error',
      plain: true,
    })
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {

    ElMessage({
      message: '两次密码输入不一致',
      type: 'error',
      plain: true,
    })
    return
  }

  if (!verifyToken && settingStore.settings.registerVerify === 0) {
    verifyShow.value = true
    if (!turnstileId) {
      nextTick(() => {
        turnstileId = window.turnstile.render('.register-turnstile')
      })
    } else {
      nextTick(() => {
        window.turnstile.reset(turnstileId);
      })
    }
    return;
  }

  registerLoading.value = true
  register({email: registerForm.email + suffix.value, password: registerForm.password, token: verifyToken}).then(() => {
    show.value = 'login'
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    registerLoading.value = false
    turnstileId = null
    verifyToken = ''
    ElMessage({
      message: '注册成功',
      type: 'success',
      plain: true,
    })
  }).catch(res => {
    if (res.code === 400) {
      verifyToken = ''
      window.turnstile.reset(turnstileId)
      verifyShow.value = true
    }
    registerLoading.value = false
  });
}

</script>


<style>
.el-select-dropdown__item {
  padding: 0 15px;
}

.no-autofill-pwd {
  .el-input__inner {
    -webkit-text-security: disc !important;
  }
}
</style>

<style lang="scss" scoped>

/* 🎭 表单容器优化 */
.form-wrapper {
  position: fixed;
  right: 0;
  height: 100%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: floatIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;

  @media (max-width: 767px) {
    width: 100%;
    left: 0;
    right: 0;
    padding: 0 12px;
  }
}

/* 🎨 超现代化登录容器 */
.container {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(248, 250, 252, 0.95) 50%,
    rgba(241, 245, 249, 0.92) 100%
  );
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 480px;
  min-height: 600px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.12),
    0 16px 32px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 0 0 1px rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;

  /* 🌟 微妙的内部纹理 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.02) 0%, transparent 50%);
    border-radius: inherit;
    pointer-events: none;
  }

  /* 🎭 顶部装饰条 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #f5576c 75%,
      #4facfe 100%
    );
    border-radius: 28px 28px 0 0;
    animation: shimmer 3s ease-in-out infinite;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow:
      0 40px 80px rgba(0, 0, 0, 0.15),
      0 20px 40px rgba(0, 0, 0, 0.1),
      0 10px 20px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      0 0 0 1px rgba(255, 255, 255, 0.4);
  }

  @media (max-width: 1024px) {
    padding: 40px 30px;
    width: 420px;
    margin-left: 18px;
    border-radius: 20px;
  }

  @media (max-width: 768px) {
    padding: 24px 20px;
    border-radius: 16px;
    min-height: auto;
    width: calc(100% - 24px);
    margin: 12px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 480px) {
    padding: 20px 16px;
    border-radius: 12px;
    width: calc(100% - 16px);
    margin: 8px;

    .form-title {
      font-size: 24px !important;
    }

    .form-desc {
      font-size: 14px;
      margin-bottom: 24px;
    }
  }

  @media (max-width: 360px) {
    padding: 16px 12px;

    .form-title {
      font-size: 20px !important;
    }

    .btn {
      height: 44px;
      font-size: 15px;
    }

    .el-input {
      height: 44px;

      :deep(.el-input__inner) {
        height: 40px;
        font-size: 14px;
      }
    }
  }
  /* 🎨 超现代化按钮设计 */
  .btn {
    height: 52px;
    width: 100%;
    border-radius: 16px;
    background: linear-gradient(135deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #f5576c 75%,
      #4facfe 100%
    );
    border: none;
    color: white;
    font-weight: 700;
    font-size: 16px;
    letter-spacing: 0.5px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow:
      0 8px 16px rgba(102, 126, 234, 0.3),
      0 4px 8px rgba(102, 126, 234, 0.2);

    &:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow:
        0 16px 32px rgba(102, 126, 234, 0.4),
        0 8px 16px rgba(102, 126, 234, 0.3),
        0 4px 8px rgba(102, 126, 234, 0.2);
    }

    &:active {
      transform: translateY(-1px) scale(1.01);
      transition: all 0.1s ease;
    }

    /* 🌟 光泽效果 */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      transition: left 0.6s ease;
    }

    &:hover::before {
      left: 100%;
    }

    /* 🎭 内部高光 */
    &::after {
      content: '';
      position: absolute;
      top: 1px;
      left: 1px;
      right: 1px;
      height: 50%;
      background: linear-gradient(180deg,
        rgba(255, 255, 255, 0.2) 0%,
        transparent 100%
      );
      border-radius: 15px 15px 0 0;
      pointer-events: none;
    }
  }

  .form-desc {
    margin-top: 8px;
    margin-bottom: 32px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.5;
  }

  /* 🎨 超现代化标题设计 */
  .form-title {
    font-weight: 800;
    font-size: 36px !important;
    background: linear-gradient(135deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #f5576c 75%,
      #4facfe 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 12px;
    text-align: center;
    letter-spacing: -0.02em;
    line-height: 1.2;
    position: relative;

    /* 🌟 文字阴影效果 */
    filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.2));

    /* 🎭 动画效果 */
    animation: titleGlow 4s ease-in-out infinite;
  }

  .switch {
    margin-top: 24px;
    text-align: center;
    span {
      color: #667eea;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        color: #764ba2;
        text-decoration: underline;
      }
    }
  }

  /* 🎨 超现代化输入框设计 */
  :deep(.el-input__wrapper) {
    border-radius: 16px;
    border: 2px solid rgba(226, 232, 240, 0.6);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(248, 250, 252, 0.8) 100%
    );
    backdrop-filter: blur(10px);
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.02),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);

    &:hover {
      border-color: rgba(99, 102, 241, 0.4);
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.95) 0%,
        rgba(248, 250, 252, 0.9) 100%
      );
      box-shadow:
        0 4px 8px rgba(99, 102, 241, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      transform: translateY(-1px);
    }

    &.is-focus {
      border-color: rgba(99, 102, 241, 0.6);
      box-shadow:
        0 0 0 4px rgba(99, 102, 241, 0.1),
        0 8px 16px rgba(99, 102, 241, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 1);
      background: rgba(255, 255, 255, 1);
      transform: translateY(-2px);
    }
  }

  .email-input :deep(.el-input__wrapper){
    border-radius: 12px 0 0 12px;
  }

  .el-input {
    height: 48px;
    width: 100%;
    margin-bottom: 20px;
    :deep(.el-input__inner) {
      height: 44px;
      font-size: 15px;
      color: #374151;

      &::placeholder {
        color: #9ca3af;
      }
    }
  }
}

:deep(.el-select-dropdown__item) {
  padding: 0 10px;
}

.setting-icon {
  position: relative;
  top: 6px;
}

:deep(.el-input-group__append) {
  padding: 0 !important;
  padding-left: 8px !important;
  padding-right: 4px !important;
  background: #FFFFFF;
  border-radius: 0 8px 8px 0;
}

.register-turnstile {
  margin-bottom: 18px;
}

.select {
  position: absolute;
  right: 30px;
  width: 100px;
  opacity: 0;
  pointer-events: none;
}

.custom-style {
  margin-bottom: 10px;
}

.custom-style .el-segmented {
  --el-border-radius-base: 6px;
  width: 180px;
}



/* 🎨 超现代化登录背景 */
#login-box {
  background: linear-gradient(135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #f5576c 75%,
    #4facfe 100%
  );
  color: #333;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: 1fr;
  position: relative;

  /* 🌟 动态背景纹理 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.4) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 60% 70%, rgba(16, 185, 129, 0.2) 0%, transparent 40%);
    animation: gradientShift 12s ease-in-out infinite;
    z-index: 1;
  }

  /* 🎭 添加微妙的几何图案 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 60px 60px, 40px 40px;
    animation: patternMove 20s linear infinite;
    z-index: 1;
  }
}

/* 🎭 动画效果优化 */
@keyframes gradientShift {
  0%, 100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  33% {
    opacity: 0.8;
    transform: scale(1.05) rotate(1deg);
  }
  66% {
    opacity: 0.9;
    transform: scale(0.95) rotate(-1deg);
  }
}

@keyframes patternMove {
  0% {
    background-position: 0% 0%, 0% 0%;
  }
  100% {
    background-position: 100% 100%, -100% -100%;
  }
}

/* 🎭 新增动画效果 */
@keyframes shimmer {
  0%, 100% {
    opacity: 1;
    transform: translateX(-100%);
  }
  50% {
    opacity: 0.8;
    transform: translateX(100%);
  }
}

@keyframes titleGlow {
  0%, 100% {
    filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.2));
  }
  50% {
    filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.4));
  }
}

@keyframes floatIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}


#background-wrap {
  height: 100%;
  z-index: 0;
}

@keyframes animateCloud {
  0% {
    margin-left: -500px;
  }

  100% {
    margin-left: 100%;
  }
}

.x1 {
  animation: animateCloud 30s linear infinite;
  transform: scale(0.65);
}

.x2 {
  animation: animateCloud 15s linear infinite;
  transform: scale(0.3);
}

.x3 {
  animation: animateCloud 25s linear infinite;
  transform: scale(0.5);
}

.x4 {
  animation: animateCloud 13s linear infinite;
  transform: scale(0.4);
}

.x5 {
  animation: animateCloud 20s linear infinite;
  transform: scale(0.55);
}

/* 🌟 现代化云朵设计 */
.cloud {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 250, 252, 0.8) 50%,
    rgba(241, 245, 249, 0.7) 100%
  );
  backdrop-filter: blur(10px);
  border-radius: 100px;
  box-shadow:
    0 16px 32px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  height: 120px;
  width: 350px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 🌟 云朵装饰元素优化 */
.cloud:after,
.cloud:before {
  content: "";
  position: absolute;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 252, 0.9) 100%
  );
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  z-index: -1;
}

.cloud:after {
  border-radius: 100px;
  height: 100px;
  left: 50px;
  top: -50px;
  width: 100px;
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.cloud:before {
  border-radius: 200px;
  height: 180px;
  width: 180px;
  right: 50px;
  top: -90px;
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

</style>
