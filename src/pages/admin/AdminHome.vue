<!-- pages/admin/AdminHome.vue -->
<template>
    <view class="admin-home">
        <!-- 欢迎信息和概览 -->
        <view class="welcome-section">
            <view class="welcome-header">
                <view class="welcome-text">
                    <text class="greeting">欢迎，{{ adminInfo.name }}！</text>
                    <text class="role">管理员</text>
                </view>
            </view>
            <view class="overview">
                <view class="overview-item">
                    <text class="overview-value">{{ overview.questionCount }}</text>
                    <text class="overview-label">题目总数</text>
                </view>
                <view class="overview-item">
                    <text class="overview-value">{{ overview.examCount }}</text>
                    <text class="overview-label">考试模板</text>
                </view>
                <view class="overview-item">
                    <text class="overview-value">{{ overview.categoryCount }}</text>
                    <text class="overview-label">分类数量</text>
                </view>
            </view>
        </view>

        <!-- 功能模块 -->
        <view class="modules-section">
            <uni-card
                    v-for="(module, index) in adminModules"
                    :key="index"
                    class="module-card"
                    :is-shadow="true"
            >
                <!-- 卡片标题栏 -->
                <view class="module-header" :style="{ backgroundColor: module.headerColor }">
                    <uni-icons :type="module.icon" size="28" color="#fff" />
                    <text class="module-title">{{ module.title }}</text>
                </view>
                <!-- 卡片内容 -->
                <view class="module-content">
                    <view class="module-stats">
                        <text class="stats-label">当前数量</text>
                        <text class="stats-value">{{ module.stats }}</text>
                    </view>
                    <text class="module-desc">{{ module.desc }}</text>
                </view>
                <!-- 卡片操作 -->
                <view slot="actions" class="module-actions">
                    <view class="action-link" @click.stop="navigateTo(module.path)">
                        <text>进入管理</text>
                        <uni-icons type="forward" size="20" color="#007AFF" />
                    </view>
                </view>
            </uni-card>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// 管理员信息（示例数据，实际从API获取）
const adminInfo = ref({
    name: '管理员',
});

// 系统概览（示例数据，实际从API获取）
const overview = ref({
    questionCount: 10,
    examCount: 7,
    categoryCount: 5,
});

// 功能模块数据
interface AdminModule {
    title: string;
    desc: string;
    icon: string;
    headerColor: string;
    stats: string;
    path: string;
}

const adminModules = ref<AdminModule[]>([
    {
        title: '题库管理',
        desc: '管理题目和选项，添加或编辑题目内容',
        icon: 'book',
        headerColor: '#007AFF',
        stats: '10 道题目',
        path: '/pages/admin/QuestionList',
    },
    {
        title: '分类管理',
        desc: '创建和编辑题目分类',
        icon: 'tags',
        headerColor: '#34C759',
        stats: '5 个分类',
        path: '/pages/admin/CategoryList',
    },
    {
        title: '考试模板管理',
        desc: '配置考试模板，设定时间和题目',
        icon: 'document',
        headerColor: '#FF9500',
        stats: '7 个模板',
        path: '/pages/admin/TemplateList',
    },
    {
        title: '统计报告',
        desc: '查看错误统计和生成培训建议',
        icon: 'stats',
        headerColor: '#FF3B30',
        stats: '生成报告',
        path: '/pages/admin/Analyze',
    },
]);

// 跳转到对应页面
const navigateTo = (path: string) => {
    uni.navigateTo({ url: path });
};
</script>

<style scoped>
.admin-home {
    padding: 20rpx;
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
    min-height: 100vh;
}

.welcome-section {
    background: #fff;
    border-radius: 20rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.welcome-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
}
.welcome-text {
    display: flex;
    flex-direction: column;
}

.greeting {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.role {
    font-size: 24rpx;
    color: #666;
    margin-top: 5rpx;
}

.overview {
    display: flex;
    justify-content: space-between;
}

.overview-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.overview-value {
    font-size: 32rpx;
    font-weight: bold;
    color: #007AFF;
}

.overview-label {
    font-size: 24rpx;
    color: #666;
}

.modules-section {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.module-card {
    border-radius: 20rpx;
    background: #fff;
    transition: transform 0.2s;
}

.module-card:active {
    transform: scale(0.98);
}

.module-header {
    display: flex;
    align-items: center;
    padding: 15rpx 20rpx;
    border-radius: 20rpx 20rpx 0 0;
}

.module-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #fff;
    margin-left: 10rpx;
}

.module-content {
    padding: 20rpx;
}

.module-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10rpx;
}

.stats-label {
    font-size: 24rpx;
    color: #666;
}

.stats-value {
    font-size: 24rpx;
    font-weight: bold;
    color: #007AFF;
}

.module-desc {
    font-size: 24rpx;
    color: #666;
}

.module-actions {
    display: flex;
    justify-content: flex-end;
    padding: 10rpx 20rpx;
    border-top: 1rpx dashed #eee;
}

.action-link {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #007AFF;
}

.action-link text {
    margin-right: 5rpx;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .admin-home {
        background: linear-gradient(135deg, #2c3e50, #4b6584);
    }

    .welcome-section, .module-card {
        background: #34495e;
    }

    .greeting, .module-title {
        color: #ecf0f1;
    }

    .role, .module-desc, .stats-label, .overview-label {
        color: #bdc3c7;
    }

    .overview-value, .stats-value, .action-link {
        color: #3498db;
    }

    .module-actions {
        border-color: #444;
    }
}
</style>