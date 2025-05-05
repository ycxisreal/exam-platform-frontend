<template>
    <uni-card :is-shadow="true" class="exam-card" @click="handleCardClick">
        <!-- 考试标题和类型标签 -->
        <view class="card-header">
            <text class="exam-name">{{ examData.examName }}</text>
            <uni-tag :text="examTypeText" :type="examTypeTag" size="small" />
        </view>
        <!-- 考试基本信息 -->
        <view class="card-content">
            <view class="info-row">
                <view>
                    <uni-icons type="calendar" size="16" color="#666"></uni-icons>
                    <text class="info-text">考试时间：{{ formattedDuration }}分钟</text>
                </view>
                <view>
                    <uni-icons type="star" size="16" color="#666"></uni-icons>
                    <text class="info-text">试卷总分：{{ examData.totalScore }}分</text>
                </view>
            </view>
            <view class="info-row">
                <view>
                    <uni-icons type="list" size="16" color="#666"></uni-icons>
                    <text class="info-text">
                        题型：单选题({{ examData.singleChoiceCount }}) /
                        多选题({{ examData.multipleChoiceCount }})
                    </text>
                </view>
            </view>
        </view>

        <!-- 考试时间范围 -->
        <view class="time-range">
            <uni-icons type="time" size="14" color="#888"></uni-icons>
            <text class="time-text">{{ formattedStartTime }} 至 {{ formattedEndTime }}</text>
        </view>

        <!-- 底部状态栏 -->
        <view slot="actions" class="card-footer">
            <view class="category-tags">
                <text class="target-categories-label">适用分类：</text>
                <template v-if="examData.examType === 'special'">
                    <template v-if="formattedCategories.length > 0">
                        <!-- 最多显示3个标签，超过的用+标签表示 -->
                        <uni-tag
                                v-for="(category, index) in formattedCategories.slice(0, maxVisibleTags)"
                                :key="category.categoryId"
                                :text="category.categoryName"
                                type="success"
                                size="small"
                                class="category-tag"
                        />
                        <uni-tag
                                v-if="formattedCategories.length > maxVisibleTags"
                                :text="`+${formattedCategories.length - maxVisibleTags}`"
                                type="default"
                                size="small"
                                class="more-tag"
                        />
                    </template>
                    <uni-tag v-else text="全部" type="primary" size="small" />
                </template>
                <template v-else>
                    <uni-tag text="个人智能分组" type="primary" size="small" />
                </template>
            </view>
            <text class="status" :class="statusClass">{{ examStatus }}</text>
        </view>
        <view v-if="isAdmin" slot="actions" class="admin-actions">
            <button class="action-btn edit-btn" @click.stop="handleEdit" size="mini">编辑</button>
            <button class="action-btn delete-btn" @click.stop="handleDelete" size="mini">删除</button>
        </view>
    </uni-card>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import { format } from 'date-fns'
import { useCategoryStore } from '@/stores/category'
import { useUserStore } from '@/stores/user'
const maxVisibleTags = ref(3)
const userStore = useUserStore()
const props = defineProps({
    examData: {
        type: Object,
        required: true,
        default: () => ({
            templateId: 0,
            examName: '',
            examType: 'normal',
            duration: 0,
            totalScore: 0,
            singleChoiceCount: 0,
            multipleChoiceCount: 0,
            availableStart: '',
            availableEnd: '',
            targetCategoryIds: []
        })
    }
})
const emit = defineEmits(['edit', 'delete'])
// 计算是否是管理员
const isAdmin = computed(() => {
    return userStore.userInfo?.role === 'admin'
})
const categoryStore = useCategoryStore()

// 考试类型转换
const examTypeText = computed(() => {
    return props.examData.examType === 'special' ? '专项考试' : '常规考试'
})

const examTypeTag = computed(() => {
    return props.examData.examType === 'special' ? 'warning' : 'primary'
})

// 格式化持续时间
const formattedDuration = computed(() => {
    return props.examData.duration || 0
})

// 格式化时间范围
const formattedStartTime = computed(() => {
    return format(new Date(props.examData.availableStart), 'yyyy-MM-dd HH:mm')
})

const formattedEndTime = computed(() => {
    return format(new Date(props.examData.availableEnd), 'yyyy-MM-dd HH:mm')
})

// 考试状态计算
const examStatus = computed(() => {
    const now = new Date()
    const start = new Date(props.examData.availableStart)
    const end = new Date(props.examData.availableEnd)

    if (now < start) return '未开始'
    if (now > end) return '已结束'
    return '进行中'
})

const statusClass = computed(() => {
    return {
        'status-not-start': examStatus.value === '未开始',
        'status-ongoing': examStatus.value === '进行中',
        'status-ended': examStatus.value === '已结束'
    }
})

// 格式化分类ID为分类对象数组
const formattedCategories = computed(() => {
    // 如果是普通考试，直接返回空数组
    if (props.examData.examType !== 'special') {
        return []
    }
    if (!props.examData.targetCategoryIds || props.examData.targetCategoryIds.length === 0) {
        return []
    }
    return props.examData.targetCategoryIds
            .map((id:any) => {
                const category = categoryStore.categories.find(c => c.categoryId === id)
                return category || null
            })
            .filter(Boolean)
})

const handleCardClick = () => {
    // 如果是管理员，不执行跳转
    if (isAdmin.value) return

    // 普通用户跳转到考试详情
    // uni.navigateTo({
    //     url: `/pages/exam/detail?id=${props.examData.templateId}`
    // })
}
const handleEdit = () => {
    emit('edit', props.examData.templateId)
}

const handleDelete = () => {
    emit('delete', props.examData.templateId)
}
</script>

<style lang="scss" scoped>
.exam-card {
    margin: 20rpx;
    border-radius: 24rpx;
    overflow: hidden;
    &:active {
        transform: scale(0.9);
        opacity: 0.9;
    }
}
.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10rpx;

    .exam-name {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        flex: 1;
    }

    .uni-tag {
        margin-left: 20rpx;
    }
}

.card-content {
    padding: 0 0;

    .info-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin: 16rpx 0;

        .info-text {
            font-size: 28rpx;
            color: #666;
            margin-left: 10rpx;
        }
    }
}

.time-range {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-top: 1rpx dashed #eee;
    border-bottom: 1rpx dashed #eee;
    margin: 5rpx 0;

    .time-text {
        font-size: 26rpx;
        color: #888;
        margin-left: 8rpx;
    }
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 24rpx;
    padding-bottom: 10rpx;

    .category-tags {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8rpx;

        .target-categories-label {
            color: #666;
            margin-right: 8rpx;
        }

        .category-tag {
            margin-right: 8rpx;
        }
    }

    .status {
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        font-size: 22rpx;

        &-not-start {
            background-color: #f0f0f0;
            color: #999;
        }

        &-ongoing {
            background-color: #e8f5e9;
            color: #2e7d32;
        }

        &-ended {
            background-color: #ffebee;
            color: #c62828;
        }
    }
    .more-tag {
        background-color: #f5f5f5 !important;
        color: #666 !important;
    }
}
.admin-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10rpx;
    padding: 0 0;
    border-top: 1px solid #eee;

    .action-btn {
        padding: 2px 12px;
        font-size: 12px;
        border-radius: 4px;
        border: none;
        cursor: pointer;

        &.edit-btn {
            background-color: #e6f7ff;
            color: #1890ff;
        }

        &.delete-btn {
            background-color: #fff1f0;
            color: #f5222d;
        }
    }
}
/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .exam-name {
        color: #fff !important;
    }

    .info-text, .target-categories-label {
        color: #aaa !important;
    }

    .time-range {
        border-color: #444 !important;
    }

    .status-not-start {
        background-color: #333 !important;
    }
    .more-tag {
        background-color: #333 !important;
        color: #aaa !important;
    }
}
</style>