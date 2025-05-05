<!-- pages/admin/report/Report.vue -->
<template>
    <view class="report-page">
        <!-- 标题 -->
        <view class="header">
            <view class="title">统计报告(未完成)</view>
        </view>

        <!-- 错题分析 -->
        <uni-section title="错题分析" type="line" padding>
            <uni-list>
                <uni-list-item
                        v-for="item in errorData"
                        :key="item.categoryName"
                        :title="item.categoryName"
                        :rightText="`${item.errorRate}%`"
                >
                    <template #footer>
                        <uni-tag :text="`${item.errorRate}%`" :type="getTagType(item.errorRate)" size="small" />
                    </template>
                </uni-list-item>
            </uni-list>
        </uni-section>

        <!-- AI培训建议 -->
        <uni-section title="AI培训建议" type="line" padding>
            <uni-card :title="aiSuggestion.title" :extra="aiSuggestion.date" is-shadow>
                <view class="suggestion-content">
                    <text>{{ aiSuggestion.content }}</text>
                </view>
            </uni-card>
        </uni-section>
    </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// 错题分析 Mock 数据
const errorData = ref([
    { categoryName: '安全操作', errorRate: 35 },
    { categoryName: '设备维护', errorRate: 25 },
    { categoryName: '应急处理', errorRate: 20 },
    { categoryName: '其他', errorRate: 20 },
]);

// AI培训建议 Mock 数据
const aiSuggestion = ref({
    title: 'AI培训建议 - 2025年5月',
    date: '2025-05-01',
    content:
            '根据近期考试数据分析，学员在“安全操作”分类的错题率较高，占比达35%。建议重点加强以下培训内容：\n1. 安全操作规程的理论学习，特别是高风险操作流程。\n2. 模拟考试中增加安全操作相关题目，提升实战能力。\n3. 组织专题讲座，邀请专家讲解常见错误案例。\n此外，设备维护和应急处理部分的错题率分别为25%和20%，建议安排针对性复习课程，结合实际案例进行讲解。',
});

// 根据错误率返回标签类型
const getTagType = (errorRate: number) => {
    if (errorRate >= 30) return 'error';
    if (errorRate >= 20) return 'warning';
    return 'success';
};
</script>

<style scoped>
.report-page {
    padding: 20rpx;
    background: #f5f5f5;
    min-height: 100vh;
}

.header {
    margin-bottom: 20rpx;
}

.title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
}

.suggestion-content {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
}

.suggestion-content text {
    white-space: pre-wrap;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .report-page {
        background: #2c3e50;
    }

    .title, .suggestion-content text {
        color: #ecf0f1;
    }

    uni-section, uni-card, uni-list {
        background: #34495e;
        color: #ecf0f1;
    }

    uni-list-item {
        border-color: #444;
    }
}
</style>