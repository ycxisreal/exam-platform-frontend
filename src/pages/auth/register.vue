<template>
    <view class="container">
        <view class="header">
            <uni-icons type="personadd-filled" size="60" color="#fff"></uni-icons>
            <view class="title">港口人员安全考试平台</view>
            <view class="subtitle">用户注册</view>
        </view>

        <uni-forms ref="form" class="form">
            <uni-forms-item name="username">
                <uni-easyinput
                        v-model="formData.username"
                        type="text"
                        placeholder="请输入用户名"
                        prefixIcon="person"
                        trim="both"
                />
            </uni-forms-item>

            <uni-forms-item name="password">
                <uni-easyinput
                        v-model="formData.password"
                        type="password"
                        placeholder="请输入密码（6-20位字符）"
                        prefixIcon="locked"
                />
            </uni-forms-item>

            <uni-forms-item name="fullName">
                <uni-easyinput
                        v-model="formData.fullName"
                        type="text"
                        placeholder="请输入真实姓名"
                        prefixIcon="contact"
                />
            </uni-forms-item>

            <button
                    class="register-btn"
                    :class="{'register-btn-disabled': loading}"
                    :loading="loading"
                    @click="handleRegister"
            >
                {{ loading ? '注册中...' : '立即注册' }}
            </button>

            <view class="footer">
                已有账号？<text class="login-text" @click="goToLogin">立即登录</text>
            </view>
        </uni-forms>
    </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/utils/http'

const formData = ref({
    username: '',
    password: '',
    fullName: ''
})

const loading = ref(false)

const handleRegister = async () => {
    if (!formData.value.username || !formData.value.password || !formData.value.fullName) {
        return uni.showToast({ title: '请填写完整信息', icon: 'none' })
    }

    loading.value = true
    try {
        await http.post('/user/register', {
            ...formData.value
        })

        await uni.showToast({title: '注册成功'})
        setTimeout(() => {
            uni.redirectTo({ url: '/pages/auth/login' })
        }, 1500)
    } catch (error) {
        await uni.showToast({title: '注册失败'})
    } finally {
        loading.value = false
    }
}

const goToLogin = () => {
    uni.navigateTo({ url: '/pages/auth/login' })
}
</script>

<style lang="scss" scoped>
.container {
    padding: 100rpx 40rpx;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
    position: relative;
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
}

.register-btn {
    width: 100%;
    height: 90rpx;
    font-size: 34rpx;
    border-radius: 50rpx;
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    color: #fff;
    margin-top: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
}

.register-btn-disabled {
    opacity: 0.6;
}

.footer {
    text-align: center;
    margin-top: 40rpx;
    color: #7f8c8d;
    font-size: 28rpx;
}

.login-text {
    color: #3498db;
    margin-left: 10rpx;
}

/* 顶部装饰条 */
.container::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 240rpx;
    background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
    z-index: 0;
    border-bottom-left-radius: 40rpx;
    border-bottom-right-radius: 40rpx;
}

/* 暗黑模式适配 - 改用类选择器 */
.dark-mode .container {
    background: #1a1a1a;
}

.dark-mode .header .title {
    color: #fff;
}

.dark-mode .header .subtitle {
    color: #95a5a6;
}

.dark-mode .form {
    background: #2d2d2d;
}

.dark-mode .footer {
    color: #95a5a6;
}
</style>