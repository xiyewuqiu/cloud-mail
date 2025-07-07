# 🎨 云邮件项目设计系统指南

> 现代化邮箱服务的完整视觉设计系统 v1.0

## 📋 概览

本设计系统为云邮件项目提供了统一、现代化的视觉语言，包含色彩、间距、阴影等核心设计元素。

## 🎨 色彩系统

### 主色调 (Primary)
```css
--primary-50: #eff6ff    /* 最浅蓝 */
--primary-100: #dbeafe   /* 浅蓝 */
--primary-200: #bfdbfe   /* 较浅蓝 */
--primary-300: #93c5fd   /* 中浅蓝 */
--primary-400: #60a5fa   /* 中蓝 */
--primary-500: #3b82f6   /* 标准蓝 */
--primary-600: #2563eb   /* 主色调 ⭐ */
--primary-700: #1d4ed8   /* 深蓝 */
--primary-800: #1e40af   /* 较深蓝 */
--primary-900: #1e3a8a   /* 最深蓝 */
```

### 功能色彩
```css
/* 成功色 */
--success-500: #10b981   /* 绿色主色 */
--success-600: #059669   /* 深绿色 */

/* 警告色 */
--warning-500: #f59e0b   /* 橙色主色 */
--warning-600: #d97706   /* 深橙色 */

/* 错误色 */
--error-500: #ef4444    /* 红色主色 */
--error-600: #dc2626    /* 深红色 */

/* 信息色 */
--info-500: #3b82f6     /* 蓝色主色 */
--info-600: #2563eb     /* 深蓝色 */
```

### 中性色系
```css
--gray-50: #f9fafb      /* 背景色 */
--gray-100: #f3f4f6     /* 次要背景 */
--gray-200: #e5e7eb     /* 边框色 */
--gray-300: #d1d5db     /* 分割线 */
--gray-400: #9ca3af     /* 禁用文字 */
--gray-500: #6b7280     /* 次要文字 */
--gray-600: #4b5563     /* 辅助文字 */
--gray-700: #374151     /* 主要文字 */
--gray-800: #1f2937     /* 标题文字 */
--gray-900: #111827     /* 强调文字 */
```

### 邮件状态色彩
```css
/* 未读邮件 */
--mail-unread-bg: var(--primary-50)
--mail-unread-border: var(--primary-500)
--mail-unread-text: var(--primary-700)

/* 已读邮件 */
--mail-read-bg: var(--gray-50)
--mail-read-border: var(--gray-300)
--mail-read-text: var(--gray-600)

/* 重要邮件 */
--mail-important-bg: var(--error-50)
--mail-important-border: var(--error-500)
--mail-important-text: var(--error-700)

/* 星标邮件 */
--mail-starred-bg: var(--warning-50)
--mail-starred-border: var(--warning-500)
--mail-starred-text: var(--warning-700)
```

## 📏 间距系统

### 基础间距
```css
--space-1: 4px      /* 最小间距 */
--space-2: 8px      /* 小间距 */
--space-3: 12px     /* 中小间距 */
--space-4: 16px     /* 标准间距 ⭐ */
--space-5: 20px     /* 中间距 */
--space-6: 24px     /* 大间距 */
--space-8: 32px     /* 很大间距 */
--space-10: 40px    /* 超大间距 */
--space-12: 48px    /* 巨大间距 */
--space-16: 64px    /* 特大间距 */
--space-20: 80px    /* 最大间距 */
```

### 圆角系统
```css
--radius-sm: 2px        /* 小圆角 */
--radius-base: 4px      /* 基础圆角 */
--radius-md: 6px        /* 中圆角 */
--radius-lg: 8px        /* 大圆角 ⭐ */
--radius-xl: 12px       /* 超大圆角 */
--radius-2xl: 16px      /* 特大圆角 */
--radius-3xl: 24px      /* 巨大圆角 */
--radius-full: 9999px   /* 完全圆角 */
```

### 组件间距标准
```css
/* 组件内部间距 */
--spacing-component-xs: var(--space-1)   /* 4px */
--spacing-component-sm: var(--space-2)   /* 8px */
--spacing-component-md: var(--space-4)   /* 16px ⭐ */
--spacing-component-lg: var(--space-6)   /* 24px */
--spacing-component-xl: var(--space-8)   /* 32px */

/* 区块间距 */
--spacing-section-xs: var(--space-4)     /* 16px */
--spacing-section-sm: var(--space-6)     /* 24px */
--spacing-section-md: var(--space-8)     /* 32px ⭐ */
--spacing-section-lg: var(--space-12)    /* 48px */
--spacing-section-xl: var(--space-16)    /* 64px */
```

## 🌊 阴影系统

### 基础阴影
```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) ⭐
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### 特殊阴影
```css
--shadow-primary: 0 4px 14px 0 rgba(37, 99, 235, 0.25)    /* 主色调阴影 */
--shadow-success: 0 4px 14px 0 rgba(16, 185, 129, 0.25)   /* 成功阴影 */
--shadow-warning: 0 4px 14px 0 rgba(245, 158, 11, 0.25)   /* 警告阴影 */
--shadow-error: 0 4px 14px 0 rgba(239, 68, 68, 0.25)      /* 错误阴影 */
```

### 玻璃态阴影
```css
--shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.12)      /* 玻璃态阴影 */
--shadow-glass-lg: 0 16px 64px rgba(0, 0, 0, 0.16)  /* 大玻璃态阴影 */
```

## 🪟 玻璃态效果

### 背景效果
```css
--glass-bg-primary: rgba(255, 255, 255, 0.85)     /* 主要玻璃背景 */
--glass-bg-secondary: rgba(255, 255, 255, 0.95)   /* 次要玻璃背景 */
--glass-border: rgba(255, 255, 255, 0.2)          /* 玻璃边框 */
--glass-backdrop-filter: blur(10px) saturate(180%) /* 背景滤镜 */
```

## 🎯 语义化别名

### 文字颜色
```css
--color-text-primary: var(--gray-900)     /* 主要文字 */
--color-text-secondary: var(--gray-700)   /* 次要文字 */
--color-text-tertiary: var(--gray-500)    /* 辅助文字 */
--color-text-disabled: var(--gray-400)    /* 禁用文字 */
```

### 背景颜色
```css
--color-bg-primary: #ffffff               /* 主要背景 */
--color-bg-secondary: var(--gray-50)      /* 次要背景 */
--color-bg-tertiary: var(--gray-100)      /* 第三背景 */
```

### 边框颜色
```css
--color-border-primary: var(--gray-200)   /* 主要边框 */
--color-border-secondary: var(--gray-300) /* 次要边框 */
--color-border-focus: var(--primary-500)  /* 焦点边框 */
```

## 📱 使用示例

### 邮件卡片
```css
.mail-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.mail-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}
```

### 按钮样式
```css
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-primary);
}
```

## 🔧 最佳实践

1. **优先使用语义化别名**：如 `--color-text-primary` 而不是 `--gray-900`
2. **保持一致性**：同类组件使用相同的间距和圆角
3. **响应式设计**：在移动端适当减小间距和阴影
4. **性能优化**：合理使用玻璃态效果，避免过度使用
5. **可访问性**：确保颜色对比度符合WCAG标准

---

**版本**: v1.0  
**更新日期**: 2025-01-07  
**状态**: ✅ 已完成
