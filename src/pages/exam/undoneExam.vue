<template>
    <view class="container">
        <!-- 状态选择选项卡 -->
        <uni-segmented-control
                :current="currentTab"
                :values="tabs"
                @clickItem="onClickTab"
                style-type="text"
                active-color="#1890ff"
        />

        <!-- 考试列表 -->
        <scroll-view
                scroll-y:true
                class="exam-list"
                :refresher-enabled="true"
                @refresherrefresh="onRefresh"
        >
            <!-- 根据状态筛选考试 -->
            <view v-if="filteredExams.length > 0">
                <ExamCard
                        v-for="exam in filteredExams"
                        :key="exam.templateId"
                        :examData="exam"
                        @edit="handleEdit"
                        @delete="handleDelete"
                />
            </view>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ExamCard from '@/components/ExamCard.vue'

// 选项卡配置
const tabs = ['未开始', '进行中', '已结束']
const currentTab = ref(0)

// Mock 数据生成
const mockExams = [
    {
        templateId: 3,
        examName: '2025年5月月考',
        examType: 'normal',
        duration: 60,
        totalScore: 18,
        singleChoiceCount: 6,
        multipleChoiceCount: 2,
        availableStart: '2025-04-30T16:00:00.000Z',
        availableEnd: '2025-05-03T15:59:59.000Z',
        targetCategoryIds: null,
    },
    {
        templateId: 4,
        examName: '2025年5月专项考试',
        examType: 'special',
        duration: 60,
        totalScore: 16,
        singleChoiceCount: 5,
        multipleChoiceCount: 2,
        availableStart: '2025-04-30T16:00:00.000Z',
        availableEnd: '2025-05-03T15:59:59.000Z',
        targetCategoryIds: [3, 5, 7], // 对应安全操作/设备维护/日常巡检
    },
    {
        templateId: 12,
        examName: '新人入职基础考核',
        examType: 'normal',
        duration: 45,
        totalScore: 18, // 6*2 + 2*3 = 78 → 调整到80
        singleChoiceCount: 6,
        multipleChoiceCount: 2,
        availableStart: '2025-05-01T00:00:00.000Z',
        availableEnd: '2025-05-31T23:59:59.000Z',
        targetCategoryIds: null
    },
    {
        templateId: 25,
        examName: '安全操作专项测试',
        examType: 'special',
        duration: 30,
        totalScore: 16, // 5*2 + 2*3 = 16 → 调整为52（可能需要调整题目数量）
        singleChoiceCount: 5,
        multipleChoiceCount: 2,
        availableStart: '2025-05-10T08:00:00.000Z',
        availableEnd: '2025-05-17T20:00:00.000Z',
        targetCategoryIds: [3, 6], // 安全操作+应急处理
    },
    {
        templateId: 47,
        examName: '设备维护技能验证',
        examType: 'special',
        duration: 40,
        totalScore: 20, // 7*2 + 2*3 = 20 → 调整为38
        singleChoiceCount: 7,
        multipleChoiceCount: 2,
        availableStart: '2025-05-05T09:00:00.000Z',
        availableEnd: '2025-05-15T18:00:00.000Z',
        targetCategoryIds: [5, 9], // 设备维护+故障排查
    },
    {
        templateId: 68,
        examName: '季度综合能力评估',
        examType: 'normal',
        duration: 90,
        totalScore: 20,
        singleChoiceCount: 7,
        multipleChoiceCount: 2,
        availableStart: '2025-05-20T00:00:00.000Z',
        availableEnd: '2025-05-22T23:59:59.000Z',
        targetCategoryIds: null
    },
    {
        templateId: 83,
        examName: '入职基础考核',
        examType: 'special',
        duration: 35,
        totalScore: 16, // 5*2 + 2*3 = 16 → 调整为28
        singleChoiceCount: 5,
        multipleChoiceCount: 2,
        availableStart: '2025-04-08T10:00:00.000Z',
        availableEnd: '2025-04-08T16:00:00.000Z',
        targetCategoryIds: [7, 11] // 日常巡检+质量控制
    }
]

// 计算属性
const filteredExams = computed(() => {
    const statusMap = ['未开始', '进行中', '已结束']
    return mockExams.filter(exam => {
        const now = new Date()
        const start = new Date(exam.availableStart)
        const end = new Date(exam.availableEnd)

        if (currentTab.value === 0) return now < start       // 未开始
        if (currentTab.value === 1) return now >= start && now <= end // 进行中
        return now > end                                   // 已结束
    })
})

const emptyText = computed(() => {
    const texts = ['暂无未开始考试', '暂无进行中的考试', '暂无历史考试']
    return texts[currentTab.value]
})

// 事件处理
const onClickTab = (e: any) => {
    currentTab.value = e.currentIndex
}

const onRefresh = () => {
    setTimeout(() => {
        uni.stopPullDownRefresh()
    }, 1000)
}

const handleEdit = (id: number) => {
    uni.showToast({ title: `编辑考试 ${id}`, icon: 'none' })
}

const handleDelete = (id: number) => {
    uni.showModal({
        title: '确认删除',
        content: `确定要删除考试 ${id} 吗？`,
        success: (res) => {
            if (res.confirm) {
                uni.showToast({ title: '删除成功', icon: 'success' })
            }
        }
    })
}
</script>

<style lang="scss" scoped>
.container {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.exam-list {
    flex: 1;
    padding: 20rpx;
    box-sizing: border-box;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    :host {
        background-color: #1a1a1a;
    }

    .exam-list {
        background-color: #2c2c2c;
    }
}
</style>