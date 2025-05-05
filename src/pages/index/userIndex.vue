<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { onMounted, ref } from 'vue';
import {http} from "@/utils/http";
import InputModal from "@/components/InputModal.vue";
const show = ref(false)
const deleteAccount = async (p: string) => {
    // 获取用户信息
    const userStore = useUserStore()
    // 请求删除账号接口
    await http.delete('/user/delete-account', {
        username: userStore.userInfo?.username || '',
        password: p
    }).then(
            () => {
                uni.showToast({
                    title: '账号注销成功',
                    icon: 'success'
                })
                userStore.logout()
                // 跳转到登录页
                uni.redirectTo({
                    url: '/pages/auth/login'
                })
            }
    ).catch(
            () => {
                uni.showToast({
                    title: '注销失败，请重试',
                    icon: 'none'
                })
            }
    )
}
const userStore = useUserStore();
const menuItems = ref([
    {
        icon: 'locked',
        text: '修改密码',
        color: '#3498db',
        handler: () => uni.navigateTo({ url: '/pages/auth/change-password' })
    },
    {
        icon: 'redo',
        text: '切换账号',
        color: '#f39c12',
        handler: () => {
            uni.showModal({
                title: '确认切换',
                content: '确定要切换账号吗？',
                success: (res) => {
                    if (res.confirm) {
                        userStore.logout();
                        uni.reLaunch({ url: '/pages/auth/login' });
                    }
                }
            });
        }
    },
    {
        icon: 'trash',
        text: '注销账号',
        color: '#e74c3c',
        handler: () => {
            show.value = true;
        }
    }
]);

const handleItemClick = (item:any) => {
    item.handler();
};
</script>

<template>
    <input-modal
            title="确认密码"
            :show="show"
            :func="deleteAccount"
            @confirm="show = false"
            @cancel="show = false"
    >
    </input-modal>
    <view class="container">
        <view class="user">
            <uni-icons type="person-filled" size="60" color="#000"></uni-icons>
            <view class="username">欢迎 {{ userStore.userInfo?.username || '用户' }}</view>
        </view>

        <view class="menu-container">
            <view
                    class="menu-item"
                    v-for="(item, index) in menuItems"
                    :key="index"
                    @click="handleItemClick(item)"
            >
                <uni-icons
                        :type="item.icon"
                        size="26"
                        :color="item.color"
                        class="menu-icon"
                ></uni-icons>
                <text class="menu-text">{{ item.text }}</text>
                <uni-icons
                        type="arrowright"
                        size="20"
                        color="#999"
                        class="arrow-icon"
                ></uni-icons>
            </view>
        </view>
    </view>
</template>

<style lang="scss" scoped>
.container {
    background: linear-gradient(to bottom, #bfe6ea, #adc4ed, #89a5df);
    min-height: 95vh;
    padding: 30rpx 30rpx env(safe-area-inset-bottom);
}

.user {
    height: 20vh;
    padding: 0 30rpx;
    margin: 15rpx 0;
    background-color: white;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

    .username {
        font-size: 36rpx;
        margin-left: 30rpx;
        font-weight: 500;
    }
}

.menu-container {
    background-color: white;
    border-radius: 20rpx;
    margin-top: 30rpx;
    padding: 0 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.menu-item {
    height: 100rpx;
    display: flex;
    align-items: center;
    border-bottom: 1rpx solid #f5f5f5;
    position: relative;

    &:last-child {
        border-bottom: none;
    }

    .menu-icon {
        width: 50rpx;
        text-align: center;
    }

    .menu-text {
        flex: 1;
        font-size: 32rpx;
        margin-left: 20rpx;
        color: #333;
    }

    .arrow-icon {
        margin-right: 10rpx;
    }

    &:active {
        background-color: #f9f9f9;
    }
}

/* 安全区域适配 */
@media (prefers-color-scheme: dark) {
    .user,
    .menu-container {
        background-color: #2d2d2d;
    }
    .menu-item {
        border-bottom-color: #3d3d3d;
    }
    .menu-text {
        color: #eee !important;
    }
}
</style>