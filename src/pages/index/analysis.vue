<!-- pages/my-exam/MyExam.vue -->
<template>
    <view class="my-exam-page">
        <!-- 顶部用户Banner -->
        <view class="user-banner">
            <view class="user-info">
                <text class="welcome-text">欢迎，{{ userInfo.name }}</text>
                <text class="exam-stats">已完成 {{ completedExams }} 场考试，平均分 {{ averageScore }} 分</text>
            </view>
        </view>

        <!-- 宫格 -->
        <uni-grid :column="2" :showBorder="true" :square="true">
            <uni-grid-item v-for="(item, index) in gridItems" :key="index" @click="navigateTo(item.path)">
                <view class="grid-item">
                    <uni-icons :type="item.icon" size="30" :color="item.color" />
                    <text class="item-title">{{ item.title }}</text>
                    <text class="item-desc">{{ item.desc }}</text>
                </view>
            </uni-grid-item>
        </uni-grid>

        <!-- 最近考试记录 -->
        <view class="recent-exams">
            <view class="section-title">最近考试</view>
            <view v-for="(exam, index) in recentExams" :key="index" class="exam-item">
                <text class="exam-name">{{ exam.name }}</text>
                <text class="exam-score">{{ exam.score }} 分</text>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// 用户信息（示例数据，实际应从API获取）
const userInfo = ref({
    avatar: '@/static/avatar.png', // 假设的头像路径
    name: '张三'
});

// 考试统计（示例数据，实际应从API获取）
const completedExams = ref(5);
const averageScore = ref(85);

// 宫格数据结构
interface GridItem {
    title: string;
    desc: string;
    icon: string;
    color: string;
    path: string;
}

const gridItems = ref<GridItem[]>([
    {
        title: '未考考试',
        desc: '安全知识月考 等 3 场',
        icon: 'calendar',
        color: '#007AFF',
        path: '/pages/exam/pending'
    },
    {
        title: '已考考试',
        desc: '5 场已完成',
        icon: 'checkbox',
        color: '#34C759',
        path: '/pages/exam/completed'
    },
    {
        title: '正在进行',
        desc: '1 场进行中',
        icon: 'loop',
        color: '#FF9500',
        path: '/pages/exam/ongoing'
    },
    {
        title: '我的错题',
        desc: '20 道错题',
        icon: 'flag',
        color: '#FF3B30',
        path: '/pages/exam/wrong-questions'
    }
]);

// 最近考试记录（示例数据，实际应从API获取）
const recentExams = ref([
    { name: '安全知识月考', score: 90 },
    { name: '应急演练考核', score: 85 },
    { name: '设备操作考试', score: 88 }
]);

// 跳转到对应页面
const navigateTo = (path: string) => {
    uni.navigateTo({ url: path });
};
</script>

<style scoped>
.my-exam-page {
    padding: 20rpx;
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
    min-height: 100vh;
}

.user-banner {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background: #fff;
    border-radius: 10rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.welcome-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.exam-stats {
    font-size: 24rpx;
    color: #666;
    margin-top: 5rpx;
}

.grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 10rpx;
}

.item-title {
    font-size: 28rpx;
    margin-top: 10rpx;
    color: #333;
}

.item-desc {
    font-size: 24rpx;
    color: #666;
    margin-top: 5rpx;
    text-align: center;
}

.recent-exams {
    margin-top: 20rpx;
    background: #fff;
    border-radius: 10rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
}

.exam-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10rpx;
}

.exam-name {
    font-size: 28rpx;
    color: #333;
}

.exam-score {
    font-size: 28rpx;
    color: #007AFF;
}

/* 调整 uni-grid 的样式 */
:deep(.uni-grid-item) {
    background: #fff;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    margin: 0;
    transform: scale(0.93);
}
</style>