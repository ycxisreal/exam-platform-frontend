<template>
    <view class="container">
        <view class="header">
            <uni-icons type="person-filled" size="60" color="#fff"></uni-icons>
            <view class="title">港口人员安全考试平台</view>
            <view class="subtitle">用户登录</view>
        </view>

        <uni-forms ref="form" :modelValue="formData" class="form">
            <uni-forms-item name="username">
                <uni-easyinput
                        v-model="formData.username"
                        type="text"
                        placeholder="请输入用户名"
                        prefixIcon="person"
                        iconColor="#3498db"
                />
            </uni-forms-item>

            <uni-forms-item name="password">
                <uni-easyinput
                        v-model="formData.password"
                        type="password"
                        placeholder="请输入密码"
                        prefixIcon="locked"
                        iconColor="#3498db"
                />
            </uni-forms-item>

            <uni-forms-item name="role">
                <uni-data-select
                        v-model="formData.role"
                        :localdata="roles"
                        :clear="false"
                        placeholder="请选择登录角色"
                />
            </uni-forms-item>

            <view class="button-group">
                <button
                        class="login-btn"
                        type="primary"
                        @click="handleLogin"
                >登录</button>
                <button
                        class="register-btn"
                        type="default"
                        @click="handleRegister"
                >立即注册</button>
            </view>
        </uni-forms>
    </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/utils/http'
import { useUserStore } from '@/stores/user'
import {useCategoryStore} from "@/stores/category";
const categoryStore = useCategoryStore()
const formData = ref({
    username: '',
    password: '',
    role: 'user'
})

const roles = ref([
    { value: 'user', text: '普通用户' },
    { value: 'admin', text: '管理员' }
])

const handleLogin = async () => {
    if (!formData.value.username || !formData.value.password) {
        await uni.showToast({ title: '请输入完整登录信息', icon: 'none' })
        return
    }

    try {
        const res = await http.post('/user/login', {
            ...formData.value
        })

        const userStore = useUserStore()
        userStore.setUserInfo(res.userInfo)
        userStore.setToken(res.token)

        await uni.showToast({title: '登录成功'})
        await categoryStore.fetchCategories()
        if(formData.value.role === 'admin')
            await uni.reLaunch({url: '/pages/admin/AdminHome'})
        else
            await uni.reLaunch({url: '/pages/index/userIndex'})
    } catch (err) {
        await uni.showToast({title: '登录失败，请检查信息', icon: 'none'})
    }
}

const handleRegister = () => {
    uni.navigateTo({ url: '/pages/auth/register' })
}
</script>

<style lang="scss" scoped>
.container {
    padding: 100rpx 40rpx;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
    box-sizing: border-box;
}

.header {
    text-align: center;
    margin-bottom: 80rpx;

    .title {
        font-size: 44rpx;
        font-weight: 600;
        color: #2c3e50;
        margin: 30rpx 0 10rpx;
    }

    .subtitle {
        font-size: 34rpx;
        color: #7f8c8d;
    }
}

.form {
    background: #fff;
    padding: 40rpx 30rpx;
    border-radius: 24rpx;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);

    :deep(.uni-forms-item__label) {
        padding: 0 0 10rpx 20rpx !important;
    }
}

.button-group {
    margin-top: 60rpx;

    .login-btn {
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
        color: #fff;
        border-radius: 50rpx;
        height: 90rpx;
        font-size: 34rpx;
    }

    .register-btn {
        margin-top: 30rpx;
        border: none;
        color: #3498db;
        font-size: 30rpx;

        &::after {
            border: none;
        }
    }
}

/* 适配暗黑模式 */
@media (prefers-color-scheme: dark) {
    .container {
        background: #1a1a1a;
    }

    .header {
        .title {
            color: #fff;
        }
        .subtitle {
            color: #95a5a6;
        }
    }

    .form {
        background: #2d2d2d;
    }
}
</style>