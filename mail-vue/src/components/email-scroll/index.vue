<template>
  <div class="email-container">
    <div class="header-actions">
      <el-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          :disabled="!emailList.length"
          @change="handleCheckAllChange"
      >
      </el-checkbox>
      <div class="header-left" :style="'padding-left:' + actionLeft">

        <slot name="first"></slot>
        <Icon class="icon" icon="ion:reload" width="18" height="18" @click="refresh"/>
        <Icon v-perm="'email:delete'" class="icon" icon="uiw:delete" width="16" height="16"
              v-if="getSelectedMailsIds().length > 0"
              @click="handleDelete"/>
      </div>

      <div class="header-right">
        <!-- 🔢 新增：选择数量显示 -->
        <span class="selected-count" v-if="getSelectedMailsIds().length > 0">
          已选择 {{ getSelectedMailsIds().length }} 封
        </span>
        <span class="email-count" v-if="total && getSelectedMailsIds().length === 0">共 {{ total }} 封</span>
        <Icon v-if="showAccountIcon" class="more-icon icon" width="16" height="16" icon="akar-icons:dot-grid-fill"
              @click="changeAccountShow"/>
      </div>
    </div>

    <div ref="scroll" class="scroll">
      <el-scrollbar ref="scrollbarRef" @scroll="handleScroll">
        <div class="scroll-box" :infinite-scroll-immediate="false" v-infinite-scroll="loadData"
             infinite-scroll-distance="600">
          <div v-for="item in emailList" :key="item.emailId">
            <div class="email-row"
                 :data-checked="item.checked"
                 :class="{
                   'unread': !item.isRead,
                   'important': item.isImportant
                 }"
                 @click="jumpDetails(item)"
            >
              <el-checkbox v-model="item.checked" @click.stop></el-checkbox>
              <div @click.stop="starChange(item)" class="pc-star" v-if="showStar">
                <Icon v-if="item.isStar" icon="fluent-color:star-16" width="20" height="20"/>
                <Icon v-else icon="solar:star-line-duotone" width="18" height="18"/>
              </div>
              <div v-if="!showStar"></div>
              <div class="title" :class="accountShow ? 'title-column' : 'title-column'">

                <div class="email-sender" :style=" showStatus ? 'gap: 10px;' : ''">
                  <div class="email-status" v-if="showStatus">
                    <el-tooltip v-if="item.status ===  0"
                                effect="dark"
                                content="已接收"
                    >
                      <Icon icon="ic:round-mark-email-read" style="color: #67C23A" width="20" height="20"/>
                      />

                    </el-tooltip>
                    <el-tooltip v-if="item.status ===  1"
                                effect="dark"
                                content="已发送"
                    >
                      <Icon icon="bi:send-arrow-up" style="color: #67C23A" width="20" height="20"
                      />

                    </el-tooltip>
                    <el-tooltip v-if="item.status ===  2"
                                effect="dark"
                                content="发送成功"
                    >
                      <Icon icon="bi:send-check-fill" style="color: #67C23A" width="20"
                            height="20"/>

                    </el-tooltip>
                    <el-tooltip v-if="item.status ===  3"
                                effect="dark"
                                content="发送失败"
                    >
                      <Icon icon="bi:send-x-fill" style="color: #F56C6C" width="20"
                            height="20"/>

                    </el-tooltip>
                    <el-tooltip v-if="item.status ===  4"
                                effect="dark"
                                content="被标记垃圾邮件"
                    >
                      <Icon icon="bi:send-exclamation-fill" style="color:#FBBD08" width="20"
                            height="20"/>

                    </el-tooltip>
                    <el-tooltip v-if="item.status ===  5"
                                effect="dark"
                                content="发送延迟"
                    >
                      <Icon icon="quill:send-later" style="color:#FBBD08" width="20"
                            height="20"/>

                    </el-tooltip>
                    <el-tooltip v-if="item.status ===  7"
                                effect="dark"
                                content="无人收件"
                    >
                      <Icon icon="ic:round-mark-email-read" style="color:#FBBD08" width="20"
                            height="20"/>

                    </el-tooltip>
                  </div>
                  <div v-else></div>
                  <span class="name">
                    <span>{{ item.name }}</span>
                    <span>
                      <Icon v-if="item.isStar" icon="fluent-color:star-16" width="18" height="18"/>
                    </span>
                  </span>
                  <span class="phone-time">{{ fromNow(item.createTime) }}</span>
                </div>
                <div>
                  <div class="email-text">
                    <div class="email-subject">{{ item.subject }}</div>
                    <!-- 🔍 新增：邮件预览功能 -->
                    <div class="email-preview" v-if="getEmailPreview(item)">
                      {{ getEmailPreview(item) }}
                    </div>
                    <div class="email-content" v-else>{{ htmlToText(item) }}</div>
                  </div>
                  <div class="user-info" v-if="showUserInfo">
                    <div class="user">
                      <span>
                        <Icon icon="mynaui:user" width="20" height="20"/>
                      </span>
                      <span>{{ item.userEmail }}</span>
                    </div>
                    <div class="account">
                      <span>
                        <Icon icon="mdi-light:email" width="20" height="20"/>
                      </span>
                      <span>{{ item.type === 0 ? item.toEmail : item.sendEmail }}</span>
                    </div>
                    <div class="del-status" v-if="item.isDel">
                      <el-tag type="info" size="small">已删除</el-tag>
                    </div>
                  </div>
                </div>
              </div>
              <div class="email-right" :style="showUserInfo ? 'align-self: start;':''">
                <span class="email-time">{{ fromNow(item.createTime) }}</span>
              </div>
            </div>
          </div>
          <div class="loading" :class="loading ? 'loading-show' : 'loading-hide'">
            <Loading/>
          </div>
          <div class="follow-loading" v-if="followLoading">
            <Loading/>
          </div>
          <div class="noLoading" v-if="noLoading && emailList.length > 0">
            <div>没有更多数据了</div>
          </div>
          <div class="empty" v-if="noLoading && emailList.length === 0">
            <el-empty :image-size="isMobile ? 120 : 0" description="没有任何邮件"/>
          </div>
        </div>
      </el-scrollbar>

    </div>
  </div>
</template>

<script setup>
import Loading from "@/components/loading/index.vue";
import {Icon} from "@iconify/vue";
import {computed, onActivated, reactive, ref, watch} from "vue";
import {onBeforeRouteLeave} from "vue-router";
import {useEmailStore} from "@/store/email.js";
import {useUiStore} from "@/store/ui.js";
import {useSettingStore} from "@/store/setting.js";
import {fromNow} from "@/utils/day.js";
// 🛡️ 新增：Element Plus 组件导入
import {ElMessage, ElMessageBox} from 'element-plus';

const props = defineProps({
  getEmailList: Function,
  emailDelete: Function,
  starAdd: Function,
  starCancel: Function,
  cancelSuccess: Function,
  starSuccess: Function,
  actionLeft: {
    type: String,
    default: '0'
  },
  timeSort: {
    type: Number,
    default: 0,
  },
  showStatus: {
    type: Boolean,
    default: false
  },
  showAccountIcon: {
    type: Boolean,
    default: true,
  },
  showUserInfo: {
    type: Boolean,
    default: false
  },
  showStar: {
    type: Boolean,
    default: true
  },
  allowStar: {
    type: Boolean,
    default: true
  }
})


const emit = defineEmits(['jump', 'refresh-before'])

const settingStore = useSettingStore()
const uiStore = useUiStore();
const emailStore = useEmailStore();
const loading = ref(false);
const followLoading = ref(false);
const noLoading = ref(false);
const emailList = reactive([])
const total = ref(0);
const checkAll = ref(false);
const isIndeterminate = ref(false);
const scroll = ref(null)
const firstLoad = ref(true)
let scrollTop = 0
const latestEmail = ref(null)
const scrollbarRef = ref(null)
let reqLock = false
let isMobile = window.innerWidth < 1025
const queryParam = reactive({
  emailId: 0,
  size: 30,
});

defineExpose({
  refreshList,
  deleteEmail,
  addItem,
  emailList,
  firstLoad,
  latestEmail,
  noLoading,
  total
})

onActivated(() => {
  scroll.value.scrollTop = scrollTop
})

getEmailList()

onBeforeRouteLeave(() => {
  scrollTop = scroll.value.scrollTop
})


watch(
    () => emailList.map(item => item.checked),
    () => {
      if (emailList.length > 0) {
        updateCheckStatus();
      }
    },
    {deep: true}
);


watch(() => emailStore.deleteIds, () => {
  if (emailStore.deleteIds) {
    deleteEmail(emailStore.deleteIds)
  }
})

watch(() => emailStore.cancelStarEmailId, () => {
  emailList.forEach(email => {
    if (email.emailId === emailStore.cancelStarEmailId) {
      email.isStar = 0
      console.log('取消')
    }
  })
})

watch(() => emailStore.addStarEmailId, () => {
  emailList.forEach(email => {
    if (email.emailId === emailStore.addStarEmailId) {
      email.isStar = 1
    }
  })
})

const accountShow = computed(() => {
  return uiStore.accountShow && settingStore.settings.manyEmail === 0
})

function handleScroll(e) {
}

// 🎨 优化的邮件内容预览函数
function htmlToText(email) {
  if (email.content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = email.content.replace(
        /<(img|iframe|object|embed|video|audio|source|link)[^>]*>/gi, ''
    );

    const scriptsAndStyles = tempDiv.querySelectorAll('script, style, title');
    scriptsAndStyles.forEach(el => el.remove());
    let text = tempDiv.textContent || tempDiv.innerText || '';
    text = text.replace(/\s+/g, ' ').trim();
    return cleanSpace(text)
  }

  if (email.text) {
    return cleanSpace(email.text)
  } else {
    return ''
  }
}

// 🔍 新增：获取邮件预览文本（前两行）
function getEmailPreview(email) {
  const fullText = htmlToText(email);
  if (!fullText) return '';

  // 按句号、问号、感叹号分割，获取前两句
  const sentences = fullText.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
  const preview = sentences.slice(0, 2).join('。');

  // 如果预览文本太长，截取前120个字符
  if (preview.length > 120) {
    return preview.substring(0, 120) + '...';
  }

  return preview + (sentences.length > 2 ? '...' : '');
}

function cleanSpace(text) {
  return text
      .replace(/[\u200B-\u200F\uFEFF\u034F\u200B-\u200F\u00A0\u3000\u00AD]/g, '')// 移除零宽空格
      .replace(/\s+/g, ' ')                   // 多空白合并成一个空格
      .trim();
}


function starChange(email) {

  if (!email.isStar) {

    if (!props.allowStar) return;

    email.isStar = 1;
    props.starAdd(email.emailId).then(() => {
      email.isStar = 1;
      props.starSuccess(email)
    }).catch(e => {
      console.error(e)
      email.isStar = 0
    })
  } else {

    email.isStar = 0;
    props.starCancel(email.emailId).then(() => {
      email.isStar = 0;
      props.cancelSuccess?.(email)
    }).catch(e => {
      console.error(e)
      email.isStar = 1;
    })
  }
}

function changeAccountShow() {
  uiStore.accountShow = !uiStore.accountShow;
}


// 🛡️ 优化：更详细的删除确认机制
const handleDelete = () => {
  const selectedIds = getSelectedMailsIds();
  const count = selectedIds.length;

  ElMessageBox.confirm(
    `确定要删除选中的 ${count} 封邮件吗？\n\n⚠️ 此操作不可撤销，请谨慎操作。`,
    '删除确认',
    {
      confirmButtonText: `确定删除 ${count} 封`,
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger',
      customClass: 'delete-confirm-dialog',
      dangerouslyUseHTMLString: false
    }
  ).then(() => {
    props.emailDelete(selectedIds).then(() => {
      ElMessage({
        message: `成功删除 ${count} 封邮件`,
        type: 'success',
        plain: true
      })
      emailStore.deleteIds = selectedIds;
    }).catch(() => {
      ElMessage({
        message: '删除失败，请重试',
        type: 'error',
        plain: true
      })
    })
  }).catch(() => {
    // 用户取消删除，不做任何操作
  })
}

function deleteEmail(emailIds) {
  emailIds.forEach(emailId => {
    emailList.forEach((item, index) => {
      if (emailId === item.emailId) {
        emailList.splice(index, 1);
      }
    })
  })
  if (emailList.length < queryParam.size && !noLoading.value) {
    getEmailList()
  }
}

function addItem(email) {

  const existIndex = emailList.findIndex(item => item.emailId === email.emailId)

  if (existIndex > -1) {
    return
  }


  if (props.timeSort) {
    if (noLoading.value) {
      emailList.push(email)
      latestEmail.value = email
      total.value++
    } else {
      total.value++
    }
    return;
  }

  const index = emailList.findIndex(item => item.emailId < email.emailId)

  if (index !== -1) {
    emailList.splice(index, 0, email);
  } else {
    if (noLoading.value) {
      emailList.push(email)
    }
  }

  total.value++
}

function handleCheckAllChange(val) {
  emailList.forEach(item => item.checked = val);
  isIndeterminate.value = false;
}

// 获取选中的邮件列表id
function getSelectedMailsIds() {
  return emailList.filter(item => item.checked).map(item => item.emailId);
}


function updateCheckStatus() {
  const checkedCount = emailList.filter(item => item.checked).length;
  checkAll.value = checkedCount === emailList.length;
  isIndeterminate.value = checkedCount > 0 && checkedCount < emailList.length;
}

// 🎨 新增：标记邮件为已读
function jumpDetails(email) {
  // 标记邮件为已读
  if (!email.isRead) {
    email.isRead = true;
    saveReadStatus(email.emailId);
  }
  emit('jump', email)
}

// 🎨 新增：初始化邮件已读状态（基于本地存储）
function initEmailReadStatus(emailList) {
  const readEmails = JSON.parse(localStorage.getItem('readEmails') || '[]');
  emailList.forEach(email => {
    email.isRead = readEmails.includes(email.emailId);
    // 暂时设置所有接收的邮件为未读，发送的邮件为已读
    if (!email.hasOwnProperty('isRead')) {
      email.isRead = email.type === 1; // type 1 是发送的邮件
    }
  });
}

// 🎨 新增：保存已读状态到本地存储
function saveReadStatus(emailId) {
  const readEmails = JSON.parse(localStorage.getItem('readEmails') || '[]');
  if (!readEmails.includes(emailId)) {
    readEmails.push(emailId);
    localStorage.setItem('readEmails', JSON.stringify(readEmails));
  }
}


function getEmailList(refresh = false) {

  if (reqLock) return;

  reqLock = true

  if (!refresh) {

    if (loading.value || noLoading.value) {
      reqLock = false
      return
    }

  } else {
    loading.value = true
  }

  if (emailList.length === 0) {
    loading.value = true
  } else {
    followLoading.value = !refresh;
  }


  props.getEmailList(queryParam.emailId, queryParam.size).then(data => {


    firstLoad.value = false

    let list = data.list.map(item => ({
      ...item,
      checked: false
    }));

    // 🎨 初始化邮件已读状态
    initEmailReadStatus(list);


    if (refresh) {
      emailList.length = 0
    }

    latestEmail.value = data.latestEmail
    emailList.push(...list);

    if (refresh) scrollbarRef.value?.setScrollTop(0);

    noLoading.value = data.list.length < queryParam.size;
    followLoading.value = data.list.length >= queryParam.size;

    total.value = data.total;
    queryParam.emailId = data.list.length > 0 ? data.list.at(-1).emailId : 0
  }).finally(() => {
    loading.value = false
    reqLock = false
  })
}

function refresh() {
  emit('refresh-before')
  refreshList()
}

function refreshList() {
  checkAll.value = false;
  isIndeterminate.value = false;
  queryParam.emailId = 0;
  getEmailList(true);
}

function loadData() {
  getEmailList()
}

</script>

<style lang="scss" scoped>

.email-container {
  display: grid;
  grid-template-rows: auto 1fr;
  padding: 0;
  font-size: 14px;
  color: #1e293b;
  overflow: hidden;
  height: 100%;
  /* 🎨 超干净的现代背景 */
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
}

.scroll {
  margin: 0;
  overflow: auto;
  height: 100%;
  position: relative;

  .scroll-box {
    height: 100%;
  }

  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .noLoading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px 0;
    color: gray;
  }

  .follow-loading {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.8);
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
  }

  .loading-show {
    transition: all 200ms ease 200ms;
    opacity: 1;
  }

  .loading-hide {
    pointer-events: none;
    transition: all 200ms;
    opacity: 0;
  }
}

.email-row {
  display: flex;
  padding: 20px 24px;
  margin: 12px 16px;
  justify-content: space-between;
  border-radius: 16px;
  cursor: pointer;
  align-items: center;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  /* 🎨 现代卡片设计 */
  background: #ffffff;
  border: 1px solid #f1f5f9;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #fafbfc;
    transform: translateY(-2px);
    /* 🎨 现代蓝色悬浮效果 */
    box-shadow:
      0 8px 25px rgba(59, 130, 246, 0.15),
      0 4px 10px rgba(0, 0, 0, 0.1);
    border-color: #e0e7ff;
  }

  /* 🔥 新增：未读邮件视觉优化 */
  &.unread {
    background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
    border-left: 4px solid var(--primary-500);
    border-color: var(--primary-200);

    .email-subject {
      font-weight: 700; /* 加粗主题 */
      color: var(--primary-700);
    }

    .name {
      font-weight: 600; /* 加粗发件人 */
      color: var(--gray-800);
    }

    &:hover {
      background: linear-gradient(135deg, #dbeafe 0%, #f1f5f9 100%);
      border-left-color: var(--primary-600);
      box-shadow:
        0 8px 25px rgba(59, 130, 246, 0.2),
        0 4px 10px rgba(0, 0, 0, 0.1);
    }
  }

  /* 🔥 新增：重要邮件标识 */
  &.important {
    border-left: 4px solid var(--error-500);
    background: linear-gradient(135deg, var(--error-50) 0%, #ffffff 100%);

    .email-subject {
      color: var(--error-700);
    }
  }

  /* 🔥 未读且重要的邮件 */
  &.unread.important {
    border-left: 4px solid var(--error-500);
    background: linear-gradient(135deg, var(--error-50) 0%, var(--primary-50) 100%);
  }

  &[data-checked="true"] {
    /* 🎨 现代蓝色选中状态 */
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-color: #93c5fd;
    box-shadow:
      0 4px 15px rgba(59, 130, 246, 0.2),
      0 2px 6px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 16px 20px;
    margin: 8px 12px;
    border-radius: 14px;
  }

  @media (max-width: 480px) {
    padding: 14px 16px;
    margin: 6px 8px;
    border-radius: 12px;

    &:hover {
      transform: translateY(-1px);
      box-shadow:
        0 4px 12px rgba(59, 130, 246, 0.1),
        0 2px 4px rgba(0, 0, 0, 0.05);
    }
  }

  .user-info {
    display: flex;
    flex-wrap: wrap;
    column-gap: 10px;
    margin-top: 5px;
    margin-bottom: 5px;
    color: #94a3b8;

    .user, .account {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      transition: all 300ms;
      line-height: 12px;
      max-width: 290px;

      span:first-child {
        position: relative;
      }

      span:last-child {
        margin-left: 5px;
        position: relative;
        bottom: 5px;
      }
    }
  }

  .el-checkbox {
    display: flex;
    padding-left: 16px;
    padding-right: 24px;
    justify-content: center;

    /* 📱 移动端触摸优化 */
    @media (max-width: 768px) {
      padding-left: 12px;
      padding-right: 20px;

      /* 增大触摸区域 */
      :deep(.el-checkbox__input) {
        transform: scale(1.2);
      }
    }

    @media (max-width: 480px) {
      padding-left: 8px;
      padding-right: 16px;
    }
  }

  .title-column {
    @media (max-width: 1200px) {
      grid-template-columns: 1fr !important;
      gap: 4px !important;
    }
  }

  .title {
    flex: 1;
    display: grid;
    grid-template-columns: 220px 1fr;
    @media (max-width: 1199px) {
      padding-right: 15px;
    }
    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: 4px;
    }

    .email-sender {
      font-weight: 600;
      color: #0f172a;
      display: grid;
      grid-template-columns: auto 1fr auto;

      .email-status {
        display: flex;
        align-content: center;
      }

      .name {
        display: grid;
        gap: 5px;
        grid-template-columns: auto 1fr;
        @media (min-width: 1024px) {
          grid-template-columns: 1fr;
          > span:last-child {
            display: none;
          }
        }

        > span:first-child {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }

      .phone-time {
        font-weight: 400;
        font-size: 12px;
        color: #64748b !important;
        @media (min-width: 1200px) {
          display: none;
        }
      }
    }

    .email-text {
      color: #475569;
      display: grid;
      grid-template-columns: auto 1fr;
      @media (max-width: 1199px) {
        grid-template-columns: 1fr;
      }

      .email-subject {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 6px; /* 🎨 为预览留出空间 */
        font-size: 15px;
        line-height: 1.4;

        @media (max-width: 768px) {
          font-size: 14px;
          margin-bottom: 4px;
        }
      }

      /* 🔍 新增：邮件预览样式 */
      .email-preview {
        color: #4b5563; /* 比原内容稍深的颜色 */
        font-size: 13px;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: 2px;

        @media (max-width: 768px) {
          font-size: 12px;
          -webkit-line-clamp: 1;
        }

        @media (max-width: 1199px) {
          padding-left: 0;
          margin-top: 4px;
        }
      }

      .email-content {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding-left: 10px;
        color: #94a3b8;
        font-size: 13px;
        line-height: 1.5;

        @media (max-width: 1199px) {
          padding-left: 0;
          margin-top: 0;
        }

        @media (max-width: 768px) {
          font-size: 12px;
        }
      }
    }
  }


  .email-right {
    text-align: right;
    font-size: 12px;
    white-space: nowrap;
    display: flex;
    padding-left: 20px;
    align-items: center;
    color: #64748b;
    font-weight: 500;
    @media (max-width: 1199px) {
      display: none;
    }
  }

  /* 旧的悬浮效果已被上面的现代设计替代 */
}


.phone-star {
  display: none;
}

.pc-star {
  display: flex;
  width: 44px;
  justify-content: center;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    transform: scale(1.1);
  }
}

@media (max-width: 1024px) {
  .pc-star {
    display: none;
  }
  .phone-star {
    display: block;
    align-self: end;
    padding: 12px 20px 8px 8px;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:active {
      background: #f1f5f9;
      transform: scale(0.95);
    }
  }
  .star-pd {
    padding-top: 6px !important;
  }
}

.email-time {
  padding-right: 16px !important;
}

:deep(.el-scrollbar__view) {
  height: 100%;
}

.header-actions {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  /* 🎨 超干净的现代头部 */
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  /* 去掉圆角，让界面更整洁 */

  @media (max-width: 768px) {
    padding: 16px 20px;
    gap: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    gap: 12px;

    .email-count {
      font-size: 12px;
    }
  }


  .header-left {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 16px;
    row-gap: 8px;
  }

  .header-right {
    display: grid;
    grid-template-columns: auto auto;
    align-items: start;
    height: 100%;

    .email-count {
      white-space: nowrap;
      margin-top: 6px;
      color: var(--gray-600);
      font-size: 14px;
    }

    /* 🔢 新增：选择数量显示样式 */
    .selected-count {
      white-space: nowrap;
      margin-top: 6px;
      color: var(--primary-600);
      font-weight: 600;
      font-size: 14px;
      background: var(--primary-50);
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid var(--primary-200);

      @media (max-width: 768px) {
        font-size: 12px;
        padding: 3px 10px;
      }
    }
  }

  .icon {
    font-size: 20px !important;
    cursor: pointer;
    color: #1f2937 !important; /* 🐛 修复：使用更深的颜色确保可见 */
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
    opacity: 1 !important; /* 🐛 修复：确保不透明 */
    visibility: visible !important; /* 🐛 修复：确保可见 */
    display: inline-block !important; /* 🐛 修复：强制显示 */
    width: auto !important;
    height: auto !important;
    position: relative !important;
    z-index: 10 !important;

    &:hover {
      color: #3b82f6 !important;
      background: #f1f5f9;
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .more-icon {
    margin-top: 8px;
    margin-left: 15px;
  }
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

</style>
