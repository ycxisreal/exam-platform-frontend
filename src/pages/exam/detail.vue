<template>
    <view class="container">
        <!-- 考试标题 -->
        <view class="header">
            <uni-icons type="arrow-left" size="24" @click="goBack" />
            <text class="exam-title">{{ examData.examName }}</text>
            <view style="width: 24px"></view>
        </view>

        <!-- 考试详情 -->
        <scroll-view class="content">
            <!-- 总体信息 -->
            <view class="summary-card">
                <view class="summary-item">
                    <text class="label">考试得分</text>
                    <text class="value">{{ examData.score }}分</text>
                </view>
                <view class="summary-item">
                    <text class="label">考试时间</text>
                    <text class="value">{{ examData.time }}</text>
                </view>
            </view>

            <!-- 题目列表 -->
            <view class="question-list">
                <view
                        v-for="(question, index) in examData.questions"
                        :key="question.id"
                        class="question-item"
                >
                    <!-- 题目头部 -->
                    <view class="question-header">
                        <text class="question-index">第{{ index + 1 }}题</text>
                        <text class="question-type" :class="typeClass(question.type)">
                            {{ questionTypeText(question.type) }}
                        </text>
                        <view class="status-icon">
                            <uni-icons
                                    :type="isCorrect(question) ? 'checkmarkempty' : 'closeempty'"
                                    :color="isCorrect(question) ? '#52c41a' : '#f5222d'"
                                    size="20"
                            />
                        </view>
                    </view>

                    <!-- 题目内容 -->
                    <view class="question-content">{{ question.content }}</view>

                    <!-- 选项列表 -->
                    <view class="options">
                        <view
                                v-for="(option, key) in question.options"
                                :key="key"
                                class="option"
                                :class="{
                'correct-option': question.correctAnswer.includes(key),
                'user-option': question.userAnswer.includes(key)
              }"
                        >
                            <text class="option-key">{{ key }}.</text>
                            <text class="option-text">{{ option }}</text>
                        </view>
                    </view>

                    <!-- 答案解析 -->
                    <view class="analysis">
                        <view class="answer-row">
                            <text class="label">参考答案：</text>
                            <text class="correct-answer">{{ question.correctAnswer.join(', ') }}</text>
                        </view>
                        <view class="answer-row">
                            <text class="label">我的答案：</text>
                            <text class="user-answer">{{ question.userAnswer.join(', ') || '未作答' }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 操作按钮 -->
            <view class="action-buttons">
                <button class="btn return-btn" @click="goBack">返回列表</button>
            </view>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Question {
    id: number
    type: 'single' | 'multiple'
    content: string
    options: Record<string, string>
    correctAnswer: string[]
    userAnswer: string[]
    analysis?: string
}

interface ExamData {
    examName: string
    score: number
    time: string
    questions: Question[]
}

// Mock数据
const examData = ref<ExamData>({
    examName: '入职基础考核',
    score: 14,
    time: '2024-04-18 14:30',
    questions: [
        {
            id: 101,
            type: 'single',
            content: '以下哪项是正确的安全操作？',
            options: {
                A: '操作前检查防护装备',
                B: '带电拆卸设备部件',
                C: '单人搬运重物',
                D: '忽略安全警示标识'
            },
            correctAnswer: ['A'],
            userAnswer: ['A'],
        },
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
        },
        {
            id: 103,
            type: 'single',
            content: '发生化学品泄漏时首先应：',
            options: {
                A: '立即进行堵漏',
                B: '启动应急警报',
                C: '拍照记录现场',
                D: '继续完成当前工作'
            },
            correctAnswer: ['B'],
            userAnswer: ['B'],
        },
        {
            id: 105,
            type: 'single',
            content: '不符合操作规范的行为是：',
            options: {
                A: '按流程逐步操作',
                B: '使用专用工具',
                C: '跳过自检步骤',
                D: '填写操作记录'
            },
            correctAnswer: ['C'],
            userAnswer: ['C'],
        },
        {
            id: 106,
            type: 'single',
            content: '设备突然停机时应首先：',
            options: {
                A: '检查电源连接',
                B: '立即拆卸设备',
                C: '重启整个系统',
                D: '联系设备厂商'
            },
            correctAnswer: ['A'],
            userAnswer: ['A'], // 模拟用户答错
        },
        {
            id: 108,
            type: 'single',
            content: '安全帽的正确使用方式是：',
            options: {
                A: '系紧下颌带',
                B: '反戴增加视野',
                C: '钻孔增加透气',
                D: '喷涂个性图案'
            },
            correctAnswer: ['A'],
            userAnswer: ['A'],
        },
        {
            id: 109,
            type: 'single',
            content: '设备润滑周期应依据：',
            options: {
                A: '设备使用说明书',
                B: '个人工作经验',
                C: '天气变化情况',
                D: '其他设备标准'
            },
            correctAnswer: ['A'],
            userAnswer: ['A'],
        }
    ]
})

// 题目类型文本
const questionTypeText = (type: string) => {
    return type === 'single' ? '单选题' : '多选题'
}

// 题目类型样式
const typeClass = (type: string) => {
    return type === 'single' ? 'type-single' : 'type-multiple'
}

// 判断题目是否正确
const isCorrect = (question: Question) => {
    const correctSorted = [...question.correctAnswer].sort().join(',')
    const userSorted = [...question.userAnswer].sort().join(',')
    return correctSorted === userSorted
}

// 返回上一页
const goBack = () => {
    uni.navigateBack()
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
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

    .exam-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
    }
}

.content {
    flex: 1;
    padding: 20rpx;
}

.summary-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    display: flex;
    justify-content: space-around;

    .summary-item {
        text-align: center;

        .label {
            display: block;
            color: #666;
            font-size: 28rpx;
            margin-bottom: 10rpx;
        }

        .value {
            font-size: 36rpx;
            font-weight: bold;
            color: #1890ff;
        }
    }
}

.question-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
}

.question-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .question-index {
        font-size: 32rpx;
        color: #333;
        margin-right: 20rpx;
    }

    .question-type {
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
        font-size: 24rpx;

        &.type-single {
            background: #e6f7ff;
            color: #1890ff;
        }

        &.type-multiple {
            background: #f6ffed;
            color: #52c41a;
        }
    }

    .status-icon {
        margin-left: auto;
    }
}

.question-content {
    font-size: 30rpx;
    color: #333;
    line-height: 1.6;
    margin-bottom: 30rpx;
}

.options {
    .option {
        display: flex;
        align-items: center;
        padding: 20rpx;
        margin: 15rpx 0;
        border-radius: 12rpx;
        background: #fafafa;

        &.correct-option {
            background: #f6ffed;
            border-left: 6rpx solid #52c41a;
        }

        &.user-option {
            background: #fff1f0;
            border-left: 6rpx solid #f5222d;
        }
    }

    .option-key {
        font-weight: bold;
        margin-right: 20rpx;
        min-width: 40rpx;
    }

    .option-text {
        flex: 1;
    }
}

.analysis {
    margin-top: 30rpx;
    padding-top: 30rpx;
    border-top: 1rpx dashed #eee;

    .answer-row {
        display: flex;
        align-items: center;
        margin-bottom: 15rpx;

        .label {
            color: #666;
            min-width: 120rpx;
        }

        .correct-answer {
            color: #52c41a;
        }

        .user-answer {
            color: #f5222d;
        }
    }

    .analysis-text {
        color: #666;
        line-height: 1.6;
    }
}

.action-buttons {
    display: flex;
    gap: 30rpx;
    margin: 40rpx 0;

    .btn {
        flex: 1;
        height: 80rpx;
        line-height: 80rpx;
        border-radius: 12rpx;
        font-size: 30rpx;

        &.redo-btn {
            background: #1890ff;
            color: #fff;
        }

        &.return-btn {
            background: #f5f5f5;
            color: #666;
        }
    }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .container {
        background-color: #1a1a1a;
    }

    .header {
        background-color: #2c2c2c;

        .exam-title {
            color: #fff;
        }
    }

    .summary-card,
    .question-item {
        background-color: #2c2c2c;
    }

    .question-content,
    .question-index {
        color: #eee !important;
    }

    .option {
        background-color: #333 !important;
    }

    .correct-option {
        background-color: #162312 !important;
    }

    .user-option {
        background-color: #2a1215 !important;
    }

    .return-btn {
        background-color: #333 !important;
        color: #aaa !important;
    }
}
</style>