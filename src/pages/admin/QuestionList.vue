<!-- pages/admin/question-bank/QuestionBank.vue -->
<template>
    <view class="question-bank-page">
        <!-- 顶部操作栏 -->
        <view class="header">
            <view class="title">题库管理</view>
            <button class="add-btn" @click="openAddPopup">添加题目</button>
        </view>

        <!-- 加载状态 -->
        <uni-load-more v-if="questionStore.isLoading" status="loading" />

        <!-- 错误提示 -->
        <view v-if="questionStore.error" class="error-message">
            {{ questionStore.error }}
            <button @click="refresh" size="mini">重试</button>
        </view>

        <!-- 题目表格 -->
        <view v-else class="table">
            <view class="table-header">
                <text class="table-col">题干</text>
                <text class="table-col">类型</text>
                <text class="table-col">分类</text>
            </view>

            <view v-for="question in paginatedQuestions" :key="question.questionId" class="table-row">
                <view class="row-content" @click="toggleExpand(question.questionId)">
                    <text class="table-col content">{{ question.content }}</text>
                    <text class="table-col">{{ questionTypeText(question.questionType) }}</text>
                    <view class="table-col">
                        <uni-tag
                                :text="question.category?.categoryName || '未分类'"
                                :type="question.category ? 'primary' : 'default'"
                                size="small"
                        />
                    </view>
                </view>

                <!-- 展开区域 -->
                <view v-if="expandedQuestionId === question.questionId" class="expand-content">
                    <view class="expand-header">
                        <text class="expand-title">题干</text>
                        <text class="expand-content-text">{{ question.content }}</text>
                    </view>
                    <view class="expand-options">
                        <text class="expand-title">选项（{{ question.options.length }}个）</text>
                        <view v-for="(option, index) in question.options" :key="index" class="option-card" :class="{ 'correct': option.isCorrect }">
                            <text class="option-label">{{ String.fromCharCode(65 + index) }}</text>
                            <text class="option-content">{{ option.content }}</text>
                            <text v-if="option.isCorrect" class="correct-label">正确</text>
                        </view>
                    </view>
                    <view class="expand-actions">
                        <uni-icons
                                type="compose"
                                size="28"
                                color="#007AFF"
                                @click="openEditPopup(question)"
                        />
                        <uni-icons
                                type="trash"
                                size="28"
                                color="#FF3B30"
                                @click="deleteQuestion(question.questionId)"
                        />
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-if="questionStore.questions.length === 0" class="empty">
                暂无题目数据，点击右上角按钮添加
            </view>
        </view>

        <!-- 分页 -->
        <uni-pagination
                v-if="questionStore.questions.length > 0"
                :current="currentPage"
                :total="questionStore.questions.length"
                :pageSize="pageSize"
                @change="handlePageChange"
                show-icon
        />

        <!-- 添加/编辑弹窗 -->
        <uni-popup ref="popup" type="dialog">
            <uni-popup-dialog
                    :type="isEdit ? 'info' : 'success'"
                    :title="isEdit ? '编辑题目' : '添加题目'"
                    mode="input"
                    :before-close="true"
                    @close="closePopup"
                    @confirm="saveQuestion"
            >
                <view class="popup-form">
                    <!-- 题干 -->
                    <view class="form-item">
                        <text class="label">题干</text>
                        <textarea
                                v-model="form.content"
                                placeholder="请输入题干"
                                auto-height="true"
                        />
                    </view>

                    <!-- 题型 -->
                    <view class="form-item">
                        <text class="label">题型</text>
                        <picker
                                :range="questionTypes"
                                range-key="text"
                                @change="updateQuestionType"
                        >
                            <view class="picker">
                                {{ questionTypes.find((t:any) => t.value === form.questionType)?.text || '请选择' }}
                            </view>
                        </picker>
                    </view>

                    <!-- 分值（自动根据题型设置，只显示） -->
                    <view class="form-item">
                        <text class="label">分值</text>
                        <text class="score-value">
                            {{ form.questionType === 'single' ? '2分' : '3分' }}
                        </text>
                    </view>

                    <!-- 分类 -->
                    <view class="form-item">
                        <text class="label">分类</text>
                        <picker
                                :range="categoryStore.categories"
                                range-key="categoryName"
                                @change="updateCategory"
                        >
                            <view class="picker">
                                {{ selectedCategoryName || '请选择' }}
                            </view>
                        </picker>
                    </view>

                    <!-- 选项 -->
                    <view class="form-item options">
                        <text class="label">选项</text>
                        <view
                                v-for="(option, index) in form.options"
                                :key="index"
                                class="option-input"
                        >
                            <input
                                    v-model="option.content"
                                    placeholder="请输入选项内容"
                            />
                            <checkbox-group @change="updateOptionCorrect(index,$event)">
                                <checkbox
                                        :value="index.toString()"
                                        :checked="option.isCorrect"
                                />
                            </checkbox-group>
                            <button
                                    v-if="form.options.length > 2"
                                    @click="removeOption(index)"
                                    class="delete-option-btn"
                            >
                                删除
                            </button>
                        </view>
                        <button @click="addOption" class="add-option-btn">
                            添加选项
                        </button>
                    </view>
                </view>
            </uni-popup-dialog>
        </uni-popup>
    </view>
</template>

<script lang="ts" setup>
import {ref, computed, onMounted, reactive} from 'vue'
import {type Question, useQuestionStore} from '@/stores/question'
import { useCategoryStore } from '@/stores/category'

const questionStore = useQuestionStore()
const categoryStore = useCategoryStore()

// 题型选项
const questionTypes = ref([
    { value: 'single', text: '单选题 (2分)' },
    { value: 'multiple', text: '多选题 (3分)' }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const paginatedQuestions = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return questionStore.questions.slice(start, start + pageSize.value)
})

// 展开状态
const expandedQuestionId = ref<number | null>(null)

// 表单相关
const popup = ref()
const isEdit = ref(false)
let form = reactive({
    questionId: 0,
    questionType: 'single' as 'single' | 'multiple',
    content: '',
    score: 2,
    categoryId: 0,
    options: reactive([
        reactive({ content: '', isCorrect: false }),
        reactive({ content: '', isCorrect: false })
    ])
})
const selectedCategoryName = ref('')

// 初始化加载
onMounted(async () => {
    await loadData()
})

const loadData = async () => {
    try {
        await questionStore.fetchQuestions()
        if (categoryStore.categories.length === 0) {
            await categoryStore.fetchCategories()
        }
        currentPage.value = 1
    } catch (err) {
        console.error('加载失败:', err)
    }
}

const refresh = () => {
    loadData()
}

// 分页切换
const handlePageChange = (e: { current: number }) => {
    currentPage.value = e.current
}

// 展开/收起题目
const toggleExpand = (id: number) => {
    expandedQuestionId.value = expandedQuestionId.value === id ? null : id
}

// 打开添加弹窗
const openAddPopup = () => {
    isEdit.value = false
    form = reactive({
        questionId: 0,
        questionType: 'single' as 'single' | 'multiple',
        content: '',
        score: 2,
        categoryId: 0,
        options: reactive([
            reactive({ content: '', isCorrect: false }),
            reactive({ content: '', isCorrect: false })
        ])
    })
    selectedCategoryName.value = ''
    popup.value.open()
}

// 打开编辑弹窗
const openEditPopup = (question: Question) => {
    isEdit.value = true
    form.questionId = question.questionId
    form.questionType = question.questionType
    form.content = question.content
    form.score = question.score
    form.categoryId = question.categoryId
    form.options = question.options.map(opt =>
            reactive({ ...opt })
    )
    selectedCategoryName.value = question.category?.categoryName || ''
    popup.value.open()
}


// 关闭弹窗
const closePopup = () => {
    popup.value.close()
}

// 更新题目类型
const updateQuestionType = (e: any) => {
    const type = questionTypes.value[e.detail.value].value
    form.questionType = type as 'single' | 'multiple'
    form.score = type === 'single' ? 2 : 3

    // 如果是单选，确保只有一个正确选项
    if (type === 'single') {
        const firstCorrectIndex = form.options.findIndex(o => o.isCorrect)
        if (firstCorrectIndex !== -1) {
            form.options.forEach((opt, i) => {
                opt.isCorrect = i === firstCorrectIndex
            })
        }
    }
}

// 更新分类
const updateCategory = (e: any) => {
    const index = e.detail.value
    const category = categoryStore.categories[index]
    if (category) {
        form.categoryId = category.categoryId
        selectedCategoryName.value = category.categoryName
    }
}

// 添加选项
const addOption = () => {
    form.options.push(reactive({
        content: '',
        isCorrect: false
    }))
}

// 删除选项
const removeOption = (index: number) => {
    // 确保至少有两个选项
    if (form.options.length <= 2) {
        uni.showToast({ title: '至少需要两个选项', icon: 'none' })
        return
    }

    // 如果要删除的是正确选项且是单选题
    if (form.options[index].isCorrect && form.questionType === 'single') {
        uni.showToast({ title: '请先设置其他选项为正确', icon: 'none' })
        return
    }

    form.options.splice(index, 1)
}

// 更新选项正确性
const updateOptionCorrect = (index: number, e: any) => {
    const isChecked = !!e.detail.value

    if (form.questionType === 'single') {
        // 单选：将其他选项设为false
        form.options.forEach((opt, i) => {
            opt.isCorrect = i === index ? isChecked : false
        })
    } else {
        // 多选：直接更新当前选项
        form.options[index].isCorrect = isChecked
    }
    console.log('选项状态更新:', form.options) // 调试用
}

// 保存题目
const saveQuestion = async () => {
    try {
        // 验证表单
        if (!form.content.trim()) {
            throw new Error('请输入题干内容')
        }

        if (!form.categoryId) {
            throw new Error('请选择分类')
        }

        if (form.options.some(opt => !opt.content.trim())) {
            throw new Error('请填写所有选项内容')
        }

        const correctOptions = form.options.filter(opt => opt.isCorrect)
        if (correctOptions.length === 0) {
            throw new Error('请至少设置一个正确答案')
        }

        if (form.questionType === 'single' && correctOptions.length !== 1) {
            throw new Error('单选题必须有且只有一个正确答案')
        }

        // 准备数据
        const questionData = {
            content: form.content,
            questionType: form.questionType,
            categoryId: form.categoryId,
            options: form.options
        }

        // 提交
        if (isEdit.value) {
            await questionStore.updateQuestion(form.questionId, questionData)
            uni.showToast({ title: '更新成功', icon: 'success' })
        } else {
            await questionStore.createQuestion(questionData)
            uni.showToast({ title: '添加成功', icon: 'success' })
        }

        closePopup()
    } catch (err:any) {
        uni.showToast({
            title: err.message,
            icon: 'none',
            duration: 3000
        })
    }
}

// 删除题目
const deleteQuestion = async (id: number) => {
    uni.showModal({
        title: '确认删除',
        content: '删除后不可恢复，确定继续吗？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await questionStore.deleteQuestion(id)
                    uni.showToast({ title: '删除成功', icon: 'success' })

                    // 如果当前页没有数据且不是第一页，则返回上一页
                    if (paginatedQuestions.value.length === 0 && currentPage.value > 1) {
                        currentPage.value--
                    }
                } catch (err) {
                    uni.showToast({
                        title: 'error',
                        icon: 'none',
                        duration: 3000
                    })
                }
            }
        }
    })
}

// 题目类型文本显示
const questionTypeText = (type: string) => {
    return type === 'single' ? '单选' : '多选'
}
</script>

<style scoped>
.question-bank-page {
    padding: 20rpx;
    background: #f5f5f5;
    min-height: 100vh;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.title {
    font-size: 36rpx;
    font-weight: bold;
}

.add-btn {
    padding: 8rpx 24rpx;
    font-size: 28rpx;
    background-color: #007AFF;
    color: #fff;
    border-radius: 10rpx;
}

.error-message {
    padding: 20rpx;
    color: #ff4d4f;
    background: #fff2f0;
    border-radius: 8rpx;
    margin: 20rpx 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.empty {
    padding: 40rpx;
    text-align: center;
    color: #999;
    font-size: 28rpx;
}

.table {
    background: #fff;
    border-radius: 10rpx;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.table-header, .row-content {
    display: flex;
    padding: 20rpx;
    border-bottom: 1rpx solid #eee;
}

.table-col {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    text-align: center;
}

.table-col.content {
    max-width: 200rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.table-header .table-col {
    font-weight: bold;
}

.expand-content {
    padding: 20rpx;
    background: #f9f9f9;
    border-radius: 10rpx;
    margin: 10rpx 20rpx;
    animation: fadeIn 0.3s ease-in;
}

.expand-header {
    margin-bottom: 20rpx;
}

.expand-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 10rpx;
}

.expand-content-text {
    font-size: 26rpx;
    color: #333;
    line-height: 1.5;
}

.expand-options {
    margin-bottom: 20rpx;
}

.option-card {
    display: flex;
    align-items: center;
    padding: 10rpx;
    margin-bottom: 10rpx;
    border: 1rpx solid #ddd;
    border-radius: 10rpx;
    background: #fff;
}

.option-card.correct {
    background: #e8f5e9;
    border-color: #34C759;
}

.option-label {
    width: 40rpx;
    font-size: 26rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
}

.option-content {
    flex: 1;
    font-size: 26rpx;
    color: #333;
}

.correct-label {
    font-size: 24rpx;
    color: #34C759;
}

.expand-actions {
    display: flex;
    justify-content: flex-end;
    gap: 30rpx;
}

.popup-form {
    padding: 20rpx 0;
}

.form-item {
    margin-bottom: 30rpx;
}

.label {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 10rpx;
    display: block;
}

textarea, .picker, .score-value {
    width: 100%;
    padding: 15rpx;
    border: 1rpx solid #ddd;
    border-radius: 8rpx;
    font-size: 28rpx;
    box-sizing: border-box;
}

.picker {
    background-color: #fff;
}

.score-value {
    display: inline-block;
    background-color: #f5f5f5;
    color: #666;
}

.options {
    border-top: 1rpx dashed #eee;
    padding-top: 20rpx;
}

.option-input {
    display: flex;
    align-items: center;
    gap: 15rpx;
    margin-bottom: 15rpx;
}

.option-input input {
    flex: 1;
    padding: 15rpx;
    border: 1rpx solid #ddd;
    border-radius: 8rpx;
    font-size: 28rpx;
}

.delete-option-btn {
    padding: 8rpx 16rpx;
    font-size: 24rpx;
    background-color: #FF3B30;
    color: #fff;
    border-radius: 6rpx;
}

.add-option-btn {
    width: 100%;
    padding: 12rpx 0;
    font-size: 26rpx;
    background-color: #34C759;
    color: #fff;
    border-radius: 8rpx;
    text-align: center;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .question-bank-page, .table {
        background: #2c3e50;
    }

    .title, .table-col, .expand-title,
    .expand-content-text, .option-label,
    .option-content, .label {
        color: #ecf0f1;
    }

    .table-header, .row-content {
        border-color: #444;
    }

    .expand-content, .option-card {
        background: #34495e;
        border-color: #666;
    }

    .option-card.correct {
        background: #162312;
        border-color: #27ae60;
    }

    .correct-label {
        color: #27ae60;
    }

    textarea, .picker, .option-input input {
        background: #34495e;
        border-color: #666;
        color: #ecf0f1;
    }

    .score-value {
        background: #3d4a5d;
        color: #bdc3c7;
    }

    .add-btn {
        background-color: #3498db;
    }

    .delete-option-btn {
        background-color: #c0392b;
    }

    .add-option-btn {
        background-color: #27ae60;
    }
}
</style>