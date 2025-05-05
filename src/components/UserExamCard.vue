<template>
    <view class="exam-list">
        <view v-for="exam in exams" :key="exam.userExamId" class="user-exam-card" @click="handleCardClick(exam)">
            <!-- 顶部标题栏 -->
            <view class="card-header">
                <uni-icons type="compose" size="24" color="#2c3e50" />
                <text class="exam-name">{{ exam.examName }}</text>
            </view>
            <!-- 中间信息区 -->
            <view class="card-content">
                <view class="info-row">
                    <uni-icons type="calendar" size="16" color="#666" />
                    <text class="info-text">考试时间：{{ formatTime(exam.time) }}</text>
                </view>
                <view class="info-row" v-if="exam.score !== null">
                    <uni-icons type="star" size="16" color="#666" />
                    <text class="info-text">考试成绩：{{ exam.score }}分</text>
                </view>
                <view class="info-row">
                    <uni-icons type="list" size="16" color="#666" />
                    <text class="info-text">考试类型：{{ examTypeText(exam.examType) }}</text>
                </view>
            </view>
            <!-- 底部状态栏 -->
            <view class="card-footer">
                <view class="status" :class="statusClass(exam.status)">{{ examStatusText(exam.status) }}</view>
                <button class="action-btn" @click.stop="handleAction(exam)">
                    {{ exam.status === 'finished' ? '查看详情' : '开始考试' }}
                </button>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const props = defineProps({
    exams: {
        type: Array as () => Array<{
            userExamId: number
            examName: string
            examType: string
            status: 'finished' | 'pending'
            score: number | null
            time: string
        }>,
        required: true,
        default: () => []
    }
})

const emit = defineEmits(['view-details', 'start-exam'])

// 格式化时间
const formatTime = (time: string) => {
    return format(new Date(time), 'yyyy-MM-dd HH:mm')
}

// 考试类型文本
const examTypeText = (type: string) => {
    return type === 'special' ? '专项考试' : '常规考试'
}

// 考试状态文本和样式
const examStatusText = (status: string) => {
    return status === 'finished' ? '已完成' : '待考试'
}

const statusClass = (status: string) => {
    return status === 'finished' ? 'status-finished' : 'status-pending'
}

// 处理卡片点击
const handleCardClick = (exam: any) => {
    if (exam.status === 'finished') {
        emit('view-details', exam.userExamId)
    } else {
        emit('start-exam', exam.userExamId)
    }
}

// 处理按钮点击
const handleAction = (exam: any) => {
    if (exam.status === 'finished') {
        emit('view-details', exam.userExamId)
    } else {
        emit('start-exam', exam.userExamId)
    }
}
</script>

<style lang="scss" scoped>
.exam-list {
    padding: 20rpx;
}

.user-exam-card {
    background: #fff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
    margin-bottom: 30rpx;
    overflow: hidden;
    transition: transform 0.2s;

    &:active {
        transform: scale(0.98);
    }
}

.card-header {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
}

.exam-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #2c3e50;
    margin-left: 10rpx;
}

.card-content {
    padding: 20rpx;
}

.info-row {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;

    .info-text {
        font-size: 28rpx;
        color: #666;
        margin-left: 10rpx;
    }
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background: #f5f7fa;
}

.status {
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    border-radius: 20rpx;

    &.status-finished {
        background-color: #e8f5e9;
        color: #2e7d32;
    }

    &.status-pending {
        background-color: #fff3e0;
        color: #f57c00;
    }
}

.action-btn {
    padding: 8rpx 24rpx;
    font-size: 26rpx;
    border-radius: 8rpx;
    border: none;
    background-color: #1890ff;
    color: #fff;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .user-exam-card {
        background: #2c3e50;
    }

    .card-header {
        background: linear-gradient(135deg, #34495e, #2c3e50);
    }

    .exam-name, .info-text {
        color: #ecf0f1;
    }

    .card-footer {
        background: #34495e;
    }

    .action-btn {
        background-color: #3498db;
    }
}
</style>