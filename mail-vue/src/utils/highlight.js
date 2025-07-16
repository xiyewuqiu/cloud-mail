/**
 * 🔍 搜索关键词高亮工具函数
 */

/**
 * 高亮文本中的关键词
 * @param {string} text - 原始文本
 * @param {string} keyword - 搜索关键词
 * @param {string} className - 高亮样式类名
 * @returns {string} 包含高亮标签的HTML字符串
 */
export function highlightKeyword(text, keyword, className = 'search-highlight') {
  if (!text || !keyword) {
    return text || ''
  }

  // 转义特殊字符，防止正则表达式错误
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  
  // 创建不区分大小写的正则表达式
  const regex = new RegExp(`(${escapedKeyword})`, 'gi')
  
  // 替换匹配的关键词为高亮标签
  return text.replace(regex, `<span class="${className}">$1</span>`)
}

/**
 * 高亮HTML内容中的关键词（安全版本）
 * @param {string} htmlContent - HTML内容
 * @param {string} keyword - 搜索关键词
 * @param {string} className - 高亮样式类名
 * @returns {string} 包含高亮的HTML字符串
 */
export function highlightInHTML(htmlContent, keyword, className = 'search-highlight') {
  if (!htmlContent || !keyword) {
    return htmlContent || ''
  }

  // 创建临时DOM元素来安全处理HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent

  // 递归处理文本节点
  function highlightTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent
      if (text && text.toLowerCase().includes(keyword.toLowerCase())) {
        const highlightedText = highlightKeyword(text, keyword, className)
        const wrapper = document.createElement('span')
        wrapper.innerHTML = highlightedText
        node.parentNode.replaceChild(wrapper, node)
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 跳过已经是高亮标签的元素
      if (!node.classList.contains(className)) {
        Array.from(node.childNodes).forEach(highlightTextNodes)
      }
    }
  }

  highlightTextNodes(tempDiv)
  return tempDiv.innerHTML
}

/**
 * 移除文本中的HTML标签，保留纯文本
 * @param {string} html - HTML字符串
 * @returns {string} 纯文本
 */
export function stripHTML(html) {
  if (!html) return ''
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ''
}

/**
 * 截取包含关键词的文本片段
 * @param {string} text - 原始文本
 * @param {string} keyword - 搜索关键词
 * @param {number} contextLength - 上下文长度
 * @returns {string} 包含关键词的文本片段
 */
export function extractKeywordContext(text, keyword, contextLength = 50) {
  if (!text || !keyword) {
    return text || ''
  }

  const lowerText = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()
  const keywordIndex = lowerText.indexOf(lowerKeyword)

  if (keywordIndex === -1) {
    // 如果没找到关键词，返回开头部分
    return text.length > contextLength * 2 
      ? text.substring(0, contextLength * 2) + '...'
      : text
  }

  // 计算截取范围
  const start = Math.max(0, keywordIndex - contextLength)
  const end = Math.min(text.length, keywordIndex + keyword.length + contextLength)

  let excerpt = text.substring(start, end)

  // 添加省略号
  if (start > 0) {
    excerpt = '...' + excerpt
  }
  if (end < text.length) {
    excerpt = excerpt + '...'
  }

  return excerpt
}