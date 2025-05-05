<template>
    <view class="container">
        <view class="title">修改密码</view>

        <view class="form">
            <input
                    v-model="username"
                    type="text"
                    placeholder="请输入用户名"
                    class="input"
            />
            <input
                    v-model="currentPassword"
                    type="password"
                    placeholder="请输入当前密码"
                    class="input"
            />
            <input
                    v-model="newPassword"
                    type="password"
                    placeholder="请输入新密码"
                    class="input"
            />

            <button class="button" @click="handleChangePassword">确认修改</button>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/utils/http'
import {useUserStore} from'@/stores/user'
const userStore = useUserStore()
let username = ref(userStore.userInfo!.username)

const currentPassword = ref('')
const newPassword = ref('')

const handleChangePassword = async () => {
    if (!username.value || !currentPassword.value || !newPassword.value) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
    }

    try {
        await http.post('/user/change-password', {
            username: username.value,
            currentPassword: currentPassword.value,
            newPassword: newPassword.value,
        })

        uni.showToast({ title: '密码修改成功', icon: 'success' })
        // 成功后跳转或清空表单
        username.value = ''
        currentPassword.value = ''
        newPassword.value = ''
        uni.redirectTo({ url: '/pages/index/index' })
    } catch (err) {
        uni.showToast({ title: '修改失败，请检查密码是否正确', icon: 'none' })
    }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  box-sizing: border-box;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #2c3e50;
  text-align: center;
}

.title:first-child {
  font-size: 56rpx;
  margin-bottom: 10rpx;
  color: #3498db;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.form {
  width: 100%;
  max-width: 650rpx;
  background-color: #fff;
  padding: 50rpx 40rpx;
  border-radius: 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
  margin-top: 40rpx;
  transition: all 0.3s ease;
}

.form:hover {
  box-shadow: 0 15rpx 35rpx rgba(0, 0, 0, 0.12);
}

.input {
  width: 92%;
  padding: 28rpx 32rpx;
  margin-bottom: 40rpx;
  border: 2rpx solid #e0e6ed;
  border-radius: 16rpx;
  background-color: #f8fafc;
  font-size: 30rpx;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 4rpx rgba(52, 152, 219, 0.2);
  outline: none;
}

.button {
  flex: 1;
  padding: 32rpx;
  font-size: 32rpx;
  border: none;
  border-radius: 16rpx;
  text-align: center;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
}

.button:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}
/* 添加一些细节装饰 */
.container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 240rpx;
  background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
  z-index: -1;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
}
</style>
