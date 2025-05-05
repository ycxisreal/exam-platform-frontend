<template>
    <view class="container">
        <!-- 标题栏 -->
        <view class="header">
            <text class="title">我的已考记录</text>
            <uni-icons type="info" size="20" color="#666" />
        </view>

        <!-- 考试列表 -->
        <scroll-view
                scroll-y:true
                class="exam-list"
                :refresher-enabled="true"
                @refresherrefresh="onRefresh"
        >
            <UserExamCard
                    :exams="finishedExams"
                    @view-details="handleViewDetails"
            />

            <!-- 空状态 -->
            <view
                    v-if="finishedExams.length === 0"
                    text="暂无考试记录"
                    icon-size="120"
            >
                <button
                        class="empty-btn"
                        type="primary"
                        size="mini"
                        @click="goExamList"
                >
                    去参加考试
                </button>
            </view>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import UserExamCard from '@/components/UserExamCard.vue'

// Mock 数据
const mockExams = ref([
    {
        userExamId: 2,
        examName: '入职基础考核',
        examType: 'normal',
        status: 'finished',
        score: 14,
        time: '2024-04-18 09:00'
    },
])

// 过滤已完成考试
const finishedExams = computed(() => {
    return mockExams.value.filter(exam => exam.status === 'finished')
})

// 查看详情
const handleViewDetails = (id: number) => {
    uni.navigateTo({
        url: `/pages/exam/detail`
    })
}

// 下拉刷新
const onRefresh = () => {
    setTimeout(() => {
        uni.stopPullDownRefresh()
        uni.showToast({ title: '刷新成功', icon: 'success' })
    }, 1000)
}

// 跳转考试列表
const goExamList = () => {
    uni.switchTab({
        url: '/pages/exam/list'
    })
}
</script>

<style lang="scss" scoped>
.container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 30rpx;
    background: #fff;

    .title {
        font-size: 36rpx;
        font-weight: 600;
        color: #333;
    }
}

.exam-list {
    flex: 1;
    padding: 20rpx 30rpx;
}

.empty-btn {
    margin-top: 20rpx;
    width: 200rpx;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .container {
        background-color: #1a1a1a;
    }

    .header {
        background-color: #2c2c2c;

        .title {
            color: #fff;
        }

        uni-icons {
            color: #aaa !important;
        }
    }

    .empty-btn {
        background-color: #1890ff;
    }
}
</style>