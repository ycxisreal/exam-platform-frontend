<!-- pages/admin/exam-template/ExamTemplateManage.vue -->
<template>
    <view class="exam-template-page">
        <!-- 顶部操作栏 -->
        <view class="header">
            <view class="title">考试模板管理</view>
            <button class="add-btn" @click="openAddPopup">添加模板</button>
        </view>

        <!-- 加载状态 -->
        <view v-if="isLoading" class="loading-state">
            <uni-load-more status="loading" />
        </view>

        <!-- 错误提示 -->
        <view v-if="error" class="error-state">
            {{ error }}
            <button @click="refreshData" size="mini">重试</button>
        </view>

        <!-- 模板表格 -->
        <view class="table" v-if="!isLoading && !error">
            <view class="table-header">
                <text class="table-col">考试名称</text>
                <text class="table-col">类型</text>
                <text class="table-col">时长</text>
                <text class="table-col">总分</text>
            </view>
            <view v-for="template in paginatedTemplates" :key="template.templateId" class="table-row">
                <view class="row-content" @click="toggleExpand(template.templateId)">
                    <text class="table-col content">{{ template.examName }}</text>
                    <text class="table-col">{{ examTypeText(template.examType) }}</text>
                    <text class="table-col">{{ template.duration }} 分钟</text>
                    <text class="table-col">{{ template.totalScore }}</text>
                </view>
                <!-- 展开区域 -->
                <view v-if="expandedTemplateId === template.templateId" class="expand-content">
                    <view class="expand-header">
                        <text class="expand-title">考试名称</text>
                        <text class="expand-content-text">{{ template.examName }}</text>
                    </view>
                    <view class="expand-details">
                        <view class="detail-item">
                            <text class="detail-label">类型</text>
                            <text class="detail-value">{{ examTypeText(template.examType) }}</text>
                        </view>
                        <view class="detail-item">
                            <text class="detail-label">时长</text>
                            <text class="detail-value">{{ template.duration }} 分钟</text>
                        </view>
                        <view class="detail-item">
                            <text class="detail-label">总分</text>
                            <text class="detail-value">{{ template.totalScore }}</text>
                        </view>
                        <view class="detail-item">
                            <text class="detail-label">单选题数量</text>
                            <text class="detail-value">{{ template.singleChoiceCount }}</text>
                        </view>
                        <view class="detail-item">
                            <text class="detail-label">多选题数量</text>
                            <text class="detail-value">{{ template.multipleChoiceCount }}</text>
                        </view>
                        <view class="detail-item">
                            <text class="detail-label">可用时间:</text>
                            <br>
                            <text class="detail-value">{{ formatDateTime(template.availableStart) }} 至 {{ formatDateTime(template.availableEnd) }}</text>
                        </view>
                        <view class="detail-item">
                            <text class="detail-label">目标分类</text>
                            <view class="detail-value">
                                <uni-tag
                                        v-for="category in getTargetCategories(template.targetCategoryIds)"
                                        :key="category.categoryId"
                                        :text="category.categoryName"
                                        type="primary"
                                        size="small"
                                        class="category-tag"
                                />
                                <text v-if="!template.targetCategoryIds">无</text>
                            </view>
                        </view>
                    </view>
                    <view class="expand-actions">
                        <uni-icons type="compose" size="28" color="#007AFF" @click.stop="openEditPopup(template)" />
                        <uni-icons type="trash" size="28" color="#FF3B30" @click.stop="deleteTemplate(template.templateId)" />
                    </view>
                </view>
            </view>
        </view>

        <!-- 空状态 -->
        <view v-if="!isLoading && templates.length === 0" class="empty-state">
            <uni-icons type="info" size="48" color="#999" />
            <text>暂无考试模板数据</text>
            <button @click="openAddPopup" size="mini">添加模板</button>
        </view>

        <!-- 分页 -->
        <uni-pagination
                v-if="templates.length > 0"
                :current="currentPage"
                :total="templates.length"
                :pageSize="pageSize"
                @change="handlePageChange"
                show-icon
        />

        <!-- 优化后的弹窗 -->
        <uni-popup ref="templatePopup" type="center" @maskClick="closePopup">
            <view class="popup-content">
                <view class="popup-title">{{ isEdit ? '编辑模板' : '添加模板' }}</view>

                <!-- 考试名称 -->
                <view class="form-input-item">
                    <textarea
                            v-model="form.examName"
                            placeholder="考试名称"
                            :disabled="isSubmitting"
                            class="form-input"
                            auto-height
                    />
                </view>

                <!-- 考试类型 -->
                <view class="form-input-item">
                    <text class="form-label">考试类型</text>
                    <picker
                            :range="examTypes"
                            range-key="text"
                            @change="updateExamType"
                            :disabled="isSubmitting"
                            class="form-input"
                    >
                        <view class="picker-content">
                            {{ examTypes.find((t:any) => t.value === form.examType)?.text || '选择考试类型' }}
                        </view>
                    </picker>
                </view>

                <!-- 考试时长 -->
                <view class="form-input-item">
                    <text class="form-label">考试时长</text>
                    <input
                            v-model.number="form.duration"
                            type="number"
                            placeholder="考试时长(分钟)"
                            :disabled="isSubmitting"
                            class="form-input"
                    />
                </view>

                <!-- 考试总分 -->
                <view class="form-input-item">
                    <text class="form-label">考试总分</text>
                    <input
                            v-model.number="form.totalScore"
                            type="number"
                            placeholder="考试总分"
                            :disabled="isSubmitting"
                            class="form-input"
                    />
                </view>

                <!-- 单选题数量 -->
                <view class="form-input-item">
                    <text class="form-label">单选题数量</text>
                    <input
                            v-model.number="form.singleChoiceCount"
                            type="number"
                            placeholder="单选题数量"
                            :disabled="isSubmitting"
                            class="form-input"
                    />
                </view>

                <!-- 多选题数量 -->
                <view class="form-input-item">
                    <text class="form-label">多选题数量</text>
                    <input
                            v-model.number="form.multipleChoiceCount"
                            type="number"
                            placeholder="多选题数量"
                            :disabled="isSubmitting"
                            class="form-input"
                    />
                </view>

                <!-- 开始时间 -->
                <view class="form-input-item">
                    <text class="form-label">开始时间</text>
                    <uni-datetime-picker
                            type="datetime"
                            v-model="form.availableStart"
                            :disabled="isSubmitting"
                            class="datetime-picker"
                    />
                </view>

                <!-- 结束时间 -->
                <view class="form-input-item">
                    <text class="form-label">结束时间</text>
                    <uni-datetime-picker
                            type="datetime"
                            v-model="form.availableEnd"
                            :disabled="isSubmitting"
                            class="datetime-picker"
                    />
                </view>

                <!-- 目标分类 -->
                <view class="category-selector-wrapper" v-if="form.examType !== 'normal'">
                    <view class="category-selector-title">选择目标分类</view>
                    <view class="category-selector">
                        <view
                                v-for="category in categories"
                                :key="category.categoryId"
                                class="category-item"
                                :class="{ 'selected': form.targetCategoryIds?.includes(category.categoryId) }"
                                @click="handleCategorySelect(category.categoryId)"
                        >
                            {{ category.categoryName }}
                        </view>
                    </view>
                </view>

                <view class="popup-actions">
                    <button
                            @click="closePopup"
                            :disabled="isSubmitting"
                            class="cancel-btn"
                    >
                        取消
                    </button>
                    <button
                            class="confirm-btn"
                            @click="saveTemplate"
                            :disabled="isSubmitting"
                    >
                        <template v-if="isSubmitting">
                            <uni-load-more
                                    status="loading"
                                    :icon-size="16"
                                    :content-text="{ contentdown: '处理中' }"
                            />
                        </template>
                        <template v-else>
                            {{ isEdit ? '保存' : '添加' }}
                        </template>
                    </button>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useExamTemplateStore } from '@/stores/examTemplate'
import { useCategoryStore } from '@/stores/category'

// Store 和状态
const templateStore = useExamTemplateStore()
const categoryStore = useCategoryStore()

const templates = computed(() => templateStore.templates)
const categories = computed(() => categoryStore.categories)
const isLoading = computed(() => templateStore.isLoading)
const error = computed(() => templateStore.error)
const isSubmitting = ref(false)

// 考试类型选项
const examTypes = ref([
    { value: 'normal', text: '普通考试' },
    { value: 'special', text: '专项考试' },
    { value: 'makeup', text: '补考' }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const paginatedTemplates = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return templates.value.slice(start, start + pageSize.value)
})

// 展开状态
const expandedTemplateId = ref<number | null>(null)

// 弹窗相关
const templatePopup = ref()
const isEdit = ref(false)
const form = ref({
    templateId: undefined as number | undefined,
    examName: '',
    examType: 'normal' as 'normal' | 'special',
    duration: 60,
    totalScore: 100,
    singleChoiceCount: 10,
    multipleChoiceCount: 5,
    availableStart: '',
    availableEnd: '',
    targetCategoryIds: null as number[] | null
})

// 初始化加载数据
onMounted(async () => {
    await refreshData()
})

// 刷新数据
const refreshData = async () => {
    try {
        await Promise.all([
            templateStore.fetchTemplates(),
            categoryStore.fetchCategories()
        ])
    } catch (err) {
        console.error('初始化加载失败:', err)
    }
}

// 分页切换
const handlePageChange = (e: { current: number }) => {
    currentPage.value = e.current
}

// 展开/收起模板详情
const toggleExpand = (templateId: number) => {
    expandedTemplateId.value = expandedTemplateId.value === templateId ? null : templateId
}

// 打开添加弹窗
const openAddPopup = () => {
    isEdit.value = false
    form.value = {
        templateId: undefined,
        examName: '',
        examType: 'normal',
        duration: 60,
        totalScore: 100,
        singleChoiceCount: 10,
        multipleChoiceCount: 5,
        availableStart: '',
        availableEnd: '',
        targetCategoryIds: null
    }
    templatePopup.value.open()
}

// 打开编辑弹窗
const openEditPopup = (template: any) => {
    isEdit.value = true
    form.value = { ...template }
    templatePopup.value.open()
}

// 关闭弹窗
const closePopup = () => {
    templatePopup.value.close()
}

// 更新考试类型
const updateExamType = (e: any) => {
    const type = examTypes.value[e.detail.value].value
    form.value.examType = type as 'normal' | 'special'

    // 如果是普通考试，清空目标分类
    if (type === 'normal') {
        form.value.targetCategoryIds = null
    }
}

// 格式化选择器显示的日期
const formatPickerDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(/\//g, '-')
}

// 更新开始时间处理方法
const updateAvailableStart = (e: any) => {
    const dateStr = e.detail.value
    // 转换为ISO格式并保留时区信息
    const date = new Date(dateStr)
    form.value.availableStart = date.toISOString()
}

// 更新结束时间处理方法
const updateAvailableEnd = (e: any) => {
    const dateStr = e.detail.value
    // 转换为ISO格式并保留时区信息
    const date = new Date(dateStr)
    form.value.availableEnd = date.toISOString()
}

// 处理分类选择
const handleCategorySelect = (categoryId: number) => {
    if (form.value.examType === 'normal') return

    if (!form.value.targetCategoryIds) {
        form.value.targetCategoryIds = []
    }

    const index = form.value.targetCategoryIds.indexOf(categoryId)
    if (index === -1) {
        form.value.targetCategoryIds.push(categoryId)
    } else {
        form.value.targetCategoryIds.splice(index, 1)
    }
}

// 获取目标分类
const getTargetCategories = (categoryIds: number[] | null) => {
    if (!categoryIds || categoryIds.length === 0) return []
    return categories.value.filter(cat => categoryIds.includes(cat.categoryId))
}

// 保存模板
const saveTemplate = async () => {
    if (!validateForm()) return

    isSubmitting.value = true

    try {
        const formData = {
            ...form.value,
            templateId: isEdit.value ? form.value.templateId : undefined,
            availableStart: new Date(form.value.availableStart).toISOString(),
            availableEnd: new Date(form.value.availableEnd).toISOString()
        }

        if (isEdit.value && form.value.templateId) {
            await templateStore.updateTemplate(form.value.templateId, formData)
        } else {
            await templateStore.createTemplate(formData)
        }

        closePopup()
        uni.showToast({
            title: isEdit.value ? '修改成功' : '添加成功',
            icon: 'success'
        })
    } catch (err) {
        console.error('保存失败:', err)
        uni.showToast({
            title: error.value || '操作失败',
            icon: 'none',
            duration: 3000
        })
    } finally {
        isSubmitting.value = false
    }
}

// 表单验证
const validateForm = () => {
    if (!form.value.examName.trim()) {
        uni.showToast({ title: '请输入考试名称', icon: 'none' })
        return false
    }

    if (form.value.duration <= 0) {
        uni.showToast({ title: '考试时长必须大于0', icon: 'none' })
        return false
    }

    if (form.value.totalScore <= 0) {
        uni.showToast({ title: '总分必须大于0', icon: 'none' })
        return false
    }

    if (!form.value.availableStart || !form.value.availableEnd) {
        uni.showToast({ title: '请设置考试时间范围', icon: 'none' })
        return false
    }

    const start = new Date(form.value.availableStart)
    const end = new Date(form.value.availableEnd)
    if (end <= start) {
        uni.showToast({ title: '结束时间必须晚于开始时间', icon: 'none' })
        return false
    }

    if (form.value.examType === 'special' &&
            (!form.value.targetCategoryIds || form.value.targetCategoryIds.length === 0)) {
        uni.showToast({ title: '专项考试必须选择目标分类', icon: 'none' })
        return false
    }

    return true
}

// 删除模板
const deleteTemplate = async (templateId: number) => {
    uni.showModal({
        title: '确认删除',
        content: '确定要删除此考试模板吗？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await templateStore.deleteTemplate(templateId)
                    uni.showToast({ title: '删除成功', icon: 'success' })

                    // 如果当前页没有数据且不是第一页，则返回上一页
                    if (paginatedTemplates.value.length === 0 && currentPage.value > 1) {
                        currentPage.value--
                    }
                } catch (err) {
                    uni.showToast({
                        title: error.value || '删除失败',
                        icon: 'none',
                        duration: 3000
                    })
                }
            }
        }
    })
}

// 考试类型文本
const examTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
        normal: '普通',
        special: '专项',
    }
    return typeMap[type] || type
}

// 格式化日期时间
const formatDateTime = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(/\//g, '-')
}
</script>

<style scoped>
.exam-template-page {
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

.loading-state {
    padding: 40rpx;
    text-align: center;
}

.error-state {
    padding: 20rpx;
    background-color: #ffeeee;
    color: #ff4d4f;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;
}

.empty-state {
    padding: 60rpx 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20rpx;
    color: #999;
}

.table {
    background: #fff;
    border-radius: 10rpx;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    margin-bottom: 20rpx;
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

.expand-content {
    padding: 20rpx;
    background: #f9f9f9;
    border-radius: 10rpx;
    margin: 10rpx 20rpx;
    animation: fadeIn 0.3s ease-in;
}

.expand-actions {
    display: flex;
    gap: 20rpx;
    justify-content: flex-end;
}

/* 弹窗样式 */
.popup-content {
    display: flex;
    flex-direction: column;
    width: 80vw;
    max-width: 600rpx;
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    box-sizing: border-box;
}

.popup-title {
    font-size: 32rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 30rpx;
    color: #333;
}

.form-input-item {
    margin-bottom: 25rpx;
    flex: 1;
}

.form-input {
    width: 100%;
    padding: 10rpx;
    border: 1rpx solid #e5e5e5;
    border-radius: 12rpx;
    font-size: 28rpx;
    background-color: #f9f9f9;
    box-sizing: border-box;
    min-height: 70rpx;
    line-height: 1.5;
}
.form-label{
    font-size: 28rpx;
}

textarea.form-input {
    min-height: 80rpx;
    padding-top: 20rpx;
}

.picker-content {
    width: 100%;
    height: 70rpx;
    line-height: 70rpx;
    padding: 0 10rpx;
    color: #333;
}

.category-selector-wrapper {
    margin: 30rpx 0;
}

.category-selector-title {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 15rpx;
}

.category-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
}

.category-item {
    padding: 12rpx 24rpx;
    border-radius: 8rpx;
    background-color: #f0f0f0;
    font-size: 26rpx;
    transition: all 0.2s;
}

.category-item.selected {
    background-color: #007AFF;
    color: white;
}

.category-item.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.popup-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 30rpx;
    gap: 20rpx;
}

.popup-actions button {
    flex: 1;
    padding: 20rpx;
    font-size: 28rpx;
    border-radius: 12rpx;
    transition: all 0.2s;
}

.cancel-btn {
    background-color: #f0f0f0;
    color: #666;
}

.confirm-btn {
    background-color: #007AFF;
    color: #fff;
}

.confirm-btn[disabled] {
    opacity: 0.7;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .exam-template-page, .table, .popup-content {
        background: #2c3e50;
    }

    .popup-title {
        color: #ecf0f1;
    }

    .form-input {
        background-color: #34495e;
        border-color: #444;
        color: #ecf0f1;
    }

    .picker-content {
        color: #ecf0f1;
    }

    .category-selector-title {
        color: #bdc3c7;
    }

    .category-item {
        background-color: #34495e;
    }

    .category-item.selected {
        background-color: #3498db;
    }

    .cancel-btn {
        background-color: #34495e;
        color: #bdc3c7;
    }

    .confirm-btn {
        background-color: #3498db;
    }

    .error-state {
        background-color: #3d1e1e;
        color: #ff7875;
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>