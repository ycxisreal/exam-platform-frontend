// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: '',
        userInfo: null as null | Record<string, any>,
    }),
    actions: {
        setToken(token: string) {
            this.token = token
            uni.setStorageSync('token', token)
        },
        setUserInfo(info: any) {
            this.userInfo = info
            uni.setStorageSync('userInfo', info)
        },
        logout() {
            this.token = ''
            this.userInfo = null
            uni.clearStorage()
        },
    },
})
