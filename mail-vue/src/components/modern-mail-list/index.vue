<template>
  <div class="modern-mail-list">
    <!-- 🔍 现代化搜索框 -->
    <div class="mail-search-container">
      <div class="mail-search-icon">
        <Icon icon="material-symbols:search" />
      </div>
      <input 
        type="text" 
        class="mail-search-input" 
        placeholder="搜索邮件..."
        v-model="searchQuery"
      />
    </div>

    <!-- 📧 邮件列表 -->
    <div class="mail-list-container">
      <div 
        v-for="mail in filteredMails" 
        :key="mail.id"
        class="mail-list-item"
        :class="{
          'unread': !mail.isRead,
          'important': mail.isImportant,
          'starred': mail.isStarred
        }"
        @click="openMail(mail)"
      >
        <!-- 邮件头部信息 -->
        <div class="mail-item-header">
          <div class="mail-sender">
            <div class="sender-avatar">
              {{ getInitials(mail.sender) }}
            </div>
            <div class="sender-info">
              <div class="sender-name">{{ mail.senderName }}</div>
              <div class="sender-email">{{ mail.sender }}</div>
            </div>
          </div>
          <div class="mail-meta">
            <div class="mail-time">{{ formatTime(mail.time) }}</div>
            <div class="mail-actions">
              <button 
                class="action-btn star-btn"
                :class="{ 'starred': mail.isStarred }"
                @click.stop="toggleStar(mail)"
              >
                <Icon :icon="mail.isStarred ? 'material-symbols:star' : 'material-symbols:star-outline'" />
              </button>
              <button 
                class="action-btn delete-btn"
                @click.stop="deleteMail(mail)"
              >
                <Icon icon="material-symbols:delete-outline" />
              </button>
            </div>
          </div>
        </div>

        <!-- 邮件内容预览 -->
        <div class="mail-item-content">
          <div class="mail-subject">{{ mail.subject }}</div>
          <div class="mail-preview">{{ mail.preview }}</div>
        </div>

        <!-- 邮件状态和标签 -->
        <div class="mail-item-footer">
          <div class="mail-badges">
            <span v-if="!mail.isRead" class="mail-status-badge unread">未读</span>
            <span v-if="mail.hasAttachment" class="mail-status-badge attachment">
              <Icon icon="material-symbols:attach-file" />
              附件
            </span>
            <span v-if="mail.isImportant" class="mail-status-badge important">重要</span>
          </div>
          <div class="mail-size">{{ formatSize(mail.size) }}</div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredMails.length === 0" class="empty-state">
        <Icon icon="material-symbols:mail-outline" class="empty-icon" />
        <div class="empty-text">暂无邮件</div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="mail-loading">
        <div class="mail-loading-spinner"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

// Props
const props = defineProps({
  mails: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['open-mail', 'toggle-star', 'delete-mail'])

// 响应式数据
const searchQuery = ref('')

// 计算属性
const filteredMails = computed(() => {
  if (!searchQuery.value) return props.mails
  
  const query = searchQuery.value.toLowerCase()
  return props.mails.filter(mail => 
    mail.subject.toLowerCase().includes(query) ||
    mail.senderName.toLowerCase().includes(query) ||
    mail.sender.toLowerCase().includes(query) ||
    mail.preview.toLowerCase().includes(query)
  )
})

// 方法
function getInitials(email) {
  return email.charAt(0).toUpperCase()
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('zh-CN', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
  return Math.round(bytes / (1024 * 1024)) + ' MB'
}

function openMail(mail) {
  emit('open-mail', mail)
}

function toggleStar(mail) {
  emit('toggle-star', mail)
}

function deleteMail(mail) {
  emit('delete-mail', mail)
}
</script>

<style lang="scss" scoped>
.modern-mail-list {
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
}

.mail-search-container {
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
}

.mail-list-container {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.mail-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.mail-sender {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.sender-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

.sender-info {
  flex: 1;
  min-width: 0;
}

.sender-name {
  font-weight: 600;
  color: var(--neutral-800);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sender-email {
  font-size: 12px;
  color: var(--neutral-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mail-time {
  font-size: 12px;
  color: var(--neutral-500);
  white-space: nowrap;
}

.mail-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--neutral-400);
  
  &:hover {
    background: var(--neutral-100);
    color: var(--neutral-600);
  }
}

.star-btn.starred {
  color: var(--mail-starred);
}

.delete-btn:hover {
  color: var(--mail-important);
}

.mail-item-content {
  margin-bottom: 12px;
}

.mail-subject {
  font-weight: 600;
  color: var(--neutral-800);
  font-size: 15px;
  margin-bottom: 4px;
  line-height: 1.4;
}

.mail-preview {
  color: var(--neutral-600);
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mail-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mail-badges {
  display: flex;
  gap: 6px;
  align-items: center;
}

.mail-size {
  font-size: 11px;
  color: var(--neutral-400);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--neutral-500);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
}
</style>
