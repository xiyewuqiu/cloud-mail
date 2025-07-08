import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
    state: () => ({
        asideShow: window.innerWidth > 1024,
        accountShow: false,
        backgroundLoading: true,
        writerRef: null,
        // 💌 邮件撰写界面状态管理
        isWriterOpen: false,
        asideCount: {
            email: 0,
            send: 0,
            sysEmail: 0
        }
    }),
    actions: {
        // 💌 打开邮件撰写界面
        openWriter() {
            this.isWriterOpen = true
        },
        // 💌 关闭邮件撰写界面
        closeWriter() {
            this.isWriterOpen = false
        }
    },
    persist: {
        pick: ['accountShow'],
    },
})