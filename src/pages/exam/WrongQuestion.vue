<template>
    <view class="container">
        <!-- 标题栏 -->
        <view class="header">
            <text class="title">我的错题本</text>
            <uni-icons type="info" size="20" color="#666" @click="showExplanation" />
        </view>

        <!-- 错题列表 -->
        <scroll-view class="question-list">
            <uni-collapse accordion>
                <uni-collapse-item v-for="(question, index) in wrongQuestions" :key="question.id">
                    <!-- 题目内容 -->
                    <template #title>
                        <view class="question-header">
                            <text class="index">{{ index + 1 }}.</text>
                            <text class="type-tag" :class="questionTypeClass(question.type)">
                                {{ questionTypeText(question.type) }}
                            </text>
                            <text class="question-content">{{ question.content }}</text>
                        </view>
                    </template>

                    <!-- 详情内容 -->
                    <view class="question-detail">
                        <!-- 选项展示 -->
                        <view class="options">
                            <view
                                    v-for="(option, key) in question.options"
                                    :key="key"
                                    class="option"
                                    :class="{
                  'correct-option': question.correctAnswer.includes(key),
                  'wrong-option': question.userAnswer.includes(key)
                }"
                            >
                                <text class="option-key">{{ key }}.</text>
                                <text class="option-content">{{ option }}</text>
                            </view>
                        </view>

                        <!-- 答案解析 -->
                        <view class="analysis">
                            <view class="analysis-item">
                                <uni-icons type="checkmark" size="16" color="#52c41a" />
                                <text class="analysis-text">正确答案：{{ question.correctAnswer.join(', ') }}</text>
                            </view>
                            <view class="analysis-item">
                                <uni-icons type="close" size="16" color="#f5222d" />
                                <text class="analysis-text">你的答案：{{ question.userAnswer.join(', ') }}</text>
                            </view>
<!--                            <view class="analysis-item">-->
<!--                                <uni-icons type="help" size="16" color="#1890ff" />-->
<!--                                <text class="analysis-text">题目解析：{{ question.analysis || '暂无解析' }}</text>-->
<!--                            </view>-->
                        </view>

                        <!-- 操作按钮 -->
                        <view class="actions">
<!--                            <button class="btn practice-btn" @click.stop="rePractice(question)">重做本题</button>-->
                            <button class="btn remove-btn" @click.stop="removeQuestion(question.id)">移出错题本</button>
                        </view>
                    </view>
                </uni-collapse-item>
            </uni-collapse>

            <!-- 空状态 -->
            <uni-notice-bar v-if="wrongQuestions.length === 0" text="暂无错题记录">
                <button class="empty-btn" type="primary" @click="goPractice">去刷题</button>
            </uni-notice-bar>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface WrongQuestion {
    id: number
    type: 'single' | 'multiple'
    content: string
    options: Record<string, string>
    correctAnswer: string[]
    userAnswer: string[]
    analysis?: string
    examId?: number
}

// Mock数据
const wrongQuestions = ref<WrongQuestion[]>([
    {
        id: 2,
        type: 'multiple',
        content: '以下哪些属于安全操作规程的基本要求？',
        options: {
            A: '严格遵守操作程序',
            B: '正确使用防护用品',
            C: '可以适当简化操作步骤',
            D: '及时报告安全隐患'
        },
        correctAnswer: ['A', 'B', 'D'],
        userAnswer: ['A', 'D'],
    }
])

// 题目类型文本
const questionTypeText = (type: string) => {
    return type === 'single' ? '单选' : '多选'
}

// 题目类型样式
const questionTypeClass = (type: string) => {
    return type === 'single' ? 'type-single' : 'type-multiple'
}

// 重做题目
const rePractice = (question: WrongQuestion) => {
    uni.navigateTo({
        url: `/pages/question/practice?id=${question.id}`
    })
}

// 移出错题本
const removeQuestion = (id: number) => {
    wrongQuestions.value = wrongQuestions.value.filter(q => q.id !== id)
    uni.showToast({ title: '移除成功', icon: 'success' })
}

// 去刷题
const goPractice = () => {
    uni.switchTab({
        url: '/pages/practice/index'
    })
}

// 显示说明
const showExplanation = () => {
    uni.showModal({
        title: '使用说明',
        content: '点击题目查看详细解析，可进行重做练习或移出错题本',
        showCancel: false
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

.question-list {
    flex: 1;
    padding: 20rpx;
}

.question-header {
    display: flex;
    align-items: center;
    padding: 15rpx 0;

    .index {
        margin-right: 10rpx;
        color: #666;
    }

    .type-tag {
        padding: 4rpx 12rpx;
        border-radius: 6rpx;
        font-size: 24rpx;
        margin-right: 15rpx;

        &.type-single {
            background-color: #e6f7ff;
            color: #1890ff;
        }

        &.type-multiple {
            background-color: #f6ffed;
            color: #52c41a;
        }
    }

    .question-content {
        flex: 1;
        color: #333;
    }
}

.question-detail {
    padding: 20rpx;
    background-color: #fafafa;
    border-radius: 12rpx;
}

.options {
    margin-bottom: 30rpx;

    .option {
        display: flex;
        align-items: center;
        padding: 15rpx;
        margin: 10rpx 0;
        border-radius: 8rpx;
        background-color: #fff;

        &.correct-option {
            background-color: #f6ffed;
            border-left: 6rpx solid #52c41a;
        }

        &.wrong-option {
            background-color: #fff1f0;
            border-left: 6rpx solid #f5222d;
        }
    }

    .option-key {
        font-weight: bold;
        margin-right: 15rpx;
    }
}

.analysis {
    .analysis-item {
        display: flex;
        align-items: center;
        margin: 15rpx 0;

        .analysis-text {
            margin-left: 10rpx;
        }
    }
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 20rpx;
    margin-top: 30rpx;

    .btn {
        padding: 8rpx 24rpx;
        font-size: 26rpx;
        border-radius: 8rpx;

        &.practice-btn {
            background-color: #e6f7ff;
            color: #1890ff;
        }

        &.remove-btn {
            background-color: #fff1f0;
            color: #f5222d;
        }
    }
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

    .question-content {
        color: #eee !important;
    }

    .question-detail {
        background-color: #2c2c2c;
    }

    .option {
        background-color: #333 !important;
    }

    .correct-option {
        background-color: #162312 !important;
    }

    .wrong-option {
        background-color: #2a1215 !important;
    }
}
</style>