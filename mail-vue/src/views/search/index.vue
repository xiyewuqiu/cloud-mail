<template>
  <div class="search-container">
    <!-- 🔍 搜索头部 -->
    <div class="search-header">
      <div class="search-input-wrapper">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索邮件主题、内容、发件人..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleClear"
        >
          <template #prefix>
            <Icon icon="material-symbols:search" width="20" height="20" />
          </template>
          <template #suffix>
            <el-button 
              type="primary" 
              :icon="Search" 
              @click="handleSearch"
              :loading="searching"
              size="small"
            >
              搜索
            </el-button>
          </template>
        </el-input>
      </div>
      
      <!-- 🎛️ 搜索过滤器 -->
      <div class="search-filters" v-if="showFilters">
        <el-select 
          v-model="searchFilters.type" 
          placeholder="邮件类型" 
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option label="全部" value="" />
          <el-option label="收件箱" :value="0" />
          <el-option label="已发送" :value="1" />
        </el-select>
        
        <el-select 
          v-model="searchFilters.accountId" 
          placeholder="选择邮箱" 
          clearable
          size="small"
          style="width: 200px"
          v-if="accountStore.accountList.length > 1"
        >
          <el-option 
            v-for="account in accountStore.accountList" 
            :key="account.accountId"
            :label="account.email" 
            :value="account.accountId" 
          />
        </el-select>
      </div>
      
      <!-- 🎚️ 过滤器切换按钮 -->
      <div class="filter-toggle">
        <el-button 
          text 
          @click="showFilters = !showFilters"
          size="small"
        >
          <Icon icon="material-symbols:tune" width="16" height="16" />
          {{ showFilters ? '隐藏筛选' : '显示筛选' }}
        </el-button>
      </div>
    </div>

    <!-- 🔍 搜索结果 -->
    <div class="search-results" v-if="hasSearched">
      <!-- 搜索状态提示 -->
      <div class="search-status" v-if="currentKeyword">
        <div class="search-info">
          <Icon icon="material-symbols:search" width="16" height="16" />
          <span>搜索 "{{ currentKeyword }}" 找到 {{ total }} 个结果</span>
        </div>
        <el-button text size="small" @click="handleClear">
          <Icon icon="material-symbols:close" width="16" height="16" />
          清除搜索
        </el-button>
      </div>

      <!-- 邮件列表 -->
      <emailScroll 
        ref="searchScroll"
        :cancel-success="cancelStar"
        :star-success="addStar"
        :getEmailList="getSearchEmailList"
        :emailDelete="emailDelete"
        :star-add="starAdd"
        :star-cancel="starCancel"
        :time-sort="0"
        :show-account-icon="false"
        actionLeft="4px"
        @jump="jumpContent"
      >
        <template #first>
          <Icon 
            class="icon" 
            @click="handleSearch" 
            icon="material-symbols:refresh" 
            width="20" 
            height="20"
            title="刷新搜索结果"
          />
        </template>
      </emailScroll>
    </div>

    <!-- 🎯 搜索建议/历史 -->
    <div class="search-suggestions" v-else>
      <div class="suggestion-section" v-if="searchHistory.length > 0">
        <h3>最近搜索</h3>
        <div class="suggestion-tags">
          <el-tag 
            v-for="(item, index) in searchHistory" 
            :key="index"
            @click="searchKeyword = item; handleSearch()"
            @close="removeFromHistory(index)"
            closable
            class="suggestion-tag"
          >
            {{ item }}
          </el-tag>
        </div>
      </div>
      
      <div class="suggestion-section">
        <h3>搜索提示</h3>
        <div class="search-tips">
          <div class="tip-item">
            <Icon icon="material-symbols:lightbulb-outline" width="16" height="16" />
            <span>可以搜索邮件主题、内容、发件人姓名或邮箱地址</span>
          </div>
          <div class="tip-item">
            <Icon icon="material-symbols:filter-alt-outline" width="16" height="16" />
            <span>使用筛选器可以缩小搜索范围</span>
          </div>
          <div class="tip-item">
            <Icon icon="material-symbols:keyboard-outline" width="16" height="16" />
            <span>按 Enter 键快速搜索</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useAccountStore } from "@/store/account.js"
import { useEmailStore } from "@/store/email.js"
import { emailSearch, emailDelete } from "@/request/email.js"
import { starAdd, starCancel } from "@/request/star.js"
import emailScroll from "@/components/email-scroll/index.vue"
import { Icon } from "@iconify/vue"
import { Search } from '@element-plus/icons-vue'
import router from "@/router/index.js"
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'search'
})

const emailStore = useEmailStore()
const accountStore = useAccountStore()
const route = useRoute()

// 搜索状态
const searchKeyword = ref('')
const currentKeyword = ref('')
const searching = ref(false)
const hasSearched = ref(false)
const total = ref(0)
const showFilters = ref(false)

// 搜索过滤器
const searchFilters = reactive({
  type: '',
  accountId: accountStore.currentAccountId || ''
})

// 搜索历史
const searchHistory = ref([])
const searchScroll = ref(null)

onMounted(() => {
  loadSearchHistory()
  // 如果有默认账户，设置过滤器
  if (accountStore.currentAccountId) {
    searchFilters.accountId = accountStore.currentAccountId
  }
  
  // 🔍 检查URL参数，如果有搜索关键词则自动搜索
  const urlKeyword = route.query.q
  if (urlKeyword && typeof urlKeyword === 'string') {
    searchKeyword.value = urlKeyword.trim()
    if (searchKeyword.value) {
      handleSearch()
    }
  }
})

// 🔍 监听路由变化，支持URL参数搜索
watch(() => route.query.q, (newKeyword) => {
  if (newKeyword && typeof newKeyword === 'string') {
    const keyword = newKeyword.trim()
    if (keyword && keyword !== currentKeyword.value) {
      searchKeyword.value = keyword
      handleSearch()
    }
  }
})

// 监听当前账户变化
watch(() => accountStore.currentAccountId, (newAccountId) => {
  if (newAccountId && !searchFilters.accountId) {
    searchFilters.accountId = newAccountId
  }
})

// 🔍 执行搜索
async function handleSearch() {
  const keyword = searchKeyword.value?.trim()
  if (!keyword) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  searching.value = true
  currentKeyword.value = keyword
  hasSearched.value = true

  try {
    // 添加到搜索历史
    addToSearchHistory(keyword)
    
    // 重置搜索结果
    if (searchScroll.value) {
      searchScroll.value.refreshList()
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    searching.value = false
  }
}

// 🔍 获取搜索结果（供 emailScroll 组件调用）
async function getSearchEmailList(emailId, size) {
  if (!currentKeyword.value) {
    return { list: [], total: 0 }
  }

  const result = await emailSearch(
    currentKeyword.value,
    searchFilters.accountId || undefined,
    searchFilters.type !== '' ? searchFilters.type : undefined,
    emailId,
    size
  )

  total.value = result.total
  
  // 🎯 为搜索结果添加高亮关键词信息
  if (result.list) {
    result.list.forEach(email => {
      email.searchKeyword = currentKeyword.value
    })
  }
  
  return result
}

// 🧹 清除搜索
function handleClear() {
  searchKeyword.value = ''
  currentKeyword.value = ''
  hasSearched.value = false
  total.value = 0
  showFilters.value = false
}

// 📝 搜索历史管理
function loadSearchHistory() {
  const history = localStorage.getItem('email_search_history')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

function addToSearchHistory(keyword) {
  // 移除重复项
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  
  // 添加到开头
  searchHistory.value.unshift(keyword)
  
  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }
  
  // 保存到本地存储
  localStorage.setItem('email_search_history', JSON.stringify(searchHistory.value))
}

function removeFromHistory(index) {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('email_search_history', JSON.stringify(searchHistory.value))
}

// ⭐ 星标操作
function addStar(email) {
  emailStore.starScroll?.addItem(email)
}

function cancelStar(email) {
  emailStore.starScroll?.deleteEmail([email.emailId])
}

// 📧 跳转到邮件详情
function jumpContent(email) {
  emailStore.contentData.email = email
  emailStore.contentData.delType = 'logic'
  emailStore.contentData.showStar = true
  emailStore.contentData.showReply = true
  router.push('/content')
}
</script>

<style lang="scss" scoped>
.search-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
}

.search-header {
  padding: 24px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  
  .search-input-wrapper {
    margin-bottom: 16px;
    
    .search-input {
      :deep(.el-input__inner) {
        height: 48px;
        font-size: 16px;
        border-radius: 24px;
        border: 2px solid #e2e8f0;
        transition: all 0.3s ease;
        
        &:focus {
          border-color: var(--el-color-primary);
          box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
        }
      }
      
      :deep(.el-input__prefix) {
        left: 16px;
      }
      
      :deep(.el-input__suffix) {
        right: 8px;
      }
    }
  }
  
  .search-filters {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  
  .filter-toggle {
    display: flex;
    justify-content: center;
  }
}

.search-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .search-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    
    .search-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
      font-size: 14px;
    }
  }
}

.search-suggestions {
  flex: 1;
  padding: 32px 24px;
  overflow-y: auto;
  
  .suggestion-section {
    margin-bottom: 32px;
    
    h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .suggestion-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .suggestion-tag {
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }
    
    .search-tips {
      .tip-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        color: #64748b;
        font-size: 14px;
        line-height: 1.5;
        
        &:not(:last-child) {
          border-bottom: 1px solid #f1f5f9;
        }
      }
    }
  }
}

.icon {
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--el-color-primary);
    transform: scale(1.1);
  }
}

@media (max-width: 768px) {
  .search-header {
    padding: 16px;
    
    .search-input-wrapper {
      .search-input {
        :deep(.el-input__inner) {
          height: 44px;
          font-size: 14px;
        }
      }
    }
    
    .search-filters {
      gap: 8px;
    }
  }
  
  .search-suggestions {
    padding: 24px 16px;
    
    .suggestion-section {
      margin-bottom: 24px;
      
      h3 {
        font-size: 16px;
      }
    }
  }
  
  .search-results .search-status {
    padding: 12px 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>