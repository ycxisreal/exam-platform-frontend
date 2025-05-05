<template>
    <view class="category-manage-page">
        <!-- 顶部操作栏 -->
        <view class="header">
            <view class="title">分类管理</view>
            <button class="add-btn" @click="openAddPopup">添加分类</button>
        </view>

        <!-- 加载状态 -->
        <uni-load-more v-if="categoryStore.isLoading" status="loading"></uni-load-more>

        <!-- 错误提示 -->
        <view v-if="categoryStore.error" class="error-message">
            {{ categoryStore.error }}
            <button @click="refresh" size="mini">重试</button>
        </view>

        <!-- 分类表格 -->
        <view v-else class="table">
            <view class="table-header">
                <text class="table-col">分类ID</text>
                <text class="table-col">分类名称</text>
                <text class="table-col">操作</text>
            </view>

            <view v-for="category in paginatedCategories" :key="category.categoryId" class="table-row">
                <view class="row-content">
                    <text class="table-col">{{ category.categoryId }}</text>
                    <text class="table-col">{{ category.categoryName }}</text>
                    <view class="table-col actions">
                        <uni-icons
                                type="compose"
                                size="24"
                                color="#007AFF"
                                @click="openEditPopup(category)"
                        />
                        <uni-icons
                                type="trash"
                                size="24"
                                color="#FF3B30"
                                @click="confirmDelete(category.categoryId)"
                        />
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-if="categoryStore.categories.length === 0" class="empty">
                暂无分类数据，点击右上角按钮添加
            </view>
        </view>

        <!-- 分页 -->
        <uni-pagination
                v-if="categoryStore.categories.length > 0"
                :current="currentPage"
                :total="categoryStore.categories.length"
                :pageSize="pageSize"
                @change="handlePageChange"
                show-icon
        />

        <!-- 添加/编辑弹窗 -->
        <uni-popup ref="popup" type="dialog">
            <uni-popup-dialog
                    :type="isEdit ? 'info' : 'success'"
                    :title="isEdit ? '编辑分类' : '添加分类'"
                    :content="form.categoryName"
                    mode="input"
                    v-model="form.categoryName"
                    placeholder="请输入分类名称"
                    @confirm="submitForm"
                    @close="closePopup"
            ></uni-popup-dialog>
        </uni-popup>
    </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/category'
let categoryStore = useCategoryStore()
// 分页相关
const currentPage = ref(1)
const pageSize = ref(5)
const paginatedCategories = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return categoryStore.categories.slice(start, start + pageSize.value)
})

// 弹窗相关
const popup = ref()
const isEdit = ref(false)
const form = ref({
    categoryId: 0,
    categoryName: ''
})

// 生命周期
onMounted(() => {
    categoryStore = useCategoryStore()
    loadData()
})

// 方法
const loadData = async () => {
    try {
        await categoryStore.fetchCategories()
        currentPage.value = 1 // 重置到第一页
    } catch (err) {
        console.error('加载数据失败:', err)
    }
}

const refresh = () => {
    loadData()
}

const openAddPopup = () => {
    isEdit.value = false
    form.value = { categoryId: 0, categoryName: '' }
    popup.value.open()
}

const openEditPopup = (category: { categoryId: number; categoryName: string }) => {
    isEdit.value = true
    form.value = { ...category }
    popup.value.open()
}

const closePopup = () => {
    popup.value.close()
}

const submitForm = async () => {
    if (!form.value.categoryName.trim()) {
        uni.showToast({ title: '分类名称不能为空', icon: 'none' })
        return
    }

    try {
        if (isEdit.value) {
            await categoryStore.updateCategory(
                    form.value.categoryId,
                    form.value.categoryName
            )
            uni.showToast({ title: '修改成功', icon: 'success' })
        } else {
            await categoryStore.addCategory(form.value.categoryName)
            uni.showToast({ title: '添加成功', icon: 'success' })
        }
        closePopup()
    } catch (err:any) {
        uni.showToast({
            title: err.message || '操作失败',
            icon: 'none',
            duration: 2000
        })
    }
}

const confirmDelete = (id: number) => {
    uni.showModal({
        title: '确认删除',
        content: '删除后不可恢复，确定继续吗？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await categoryStore.deleteCategory(id)
                    uni.showToast({ title: '删除成功', icon: 'success' })

                    // 如果当前页没有数据且不是第一页，则返回上一页
                    if (paginatedCategories.value.length === 0 && currentPage.value > 1) {
                        currentPage.value--
                    }
                } catch (err:any) {
                    uni.showToast({
                        title: err.message || '删除失败',
                        icon: 'none',
                        duration: 2000
                    })
                }
            }
        }
    })
}

const handlePageChange = (e: { current: number }) => {
    currentPage.value = e.current
}
</script>

<style scoped>
.category-manage-page {
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

.table-header .table-col {
    font-weight: bold;
}

.actions {
    display: flex;
    gap: 20rpx;
    justify-content: center;
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

/* 优化操作按钮间距 */
.actions {
    display: flex;
    justify-content: center;
    gap: 30rpx;
}
.action-icon {
    transition: transform 0.2s;
}

.action-icon:active {
    transform: scale(1.2);
}

.popup-content {
    width: 500rpx;
    background: #fff;
    border-radius: 20rpx;
    padding: 20rpx;
}

.popup-title {
    font-size: 32rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20rpx;
}

.form-item {
    margin-bottom: 20rpx;
}

.form-item text {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 10rpx;
    display: block;
}

.form-item input {
    padding: 10rpx;
    border: 1rpx solid #ddd;
    border-radius: 10rpx;
    font-size: 28rpx;
}

.popup-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 20rpx;
}

.popup-actions button {
    padding: 10rpx 40rpx;
    font-size: 28rpx;
    border-radius: 10rpx;
}

.popup-actions .confirm-btn {
    background-color: #007AFF;
    color: #fff;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .category-manage-page, .table, .popup-content {
        background: #2c3e50;
    }

    .table-header, .row-content {
        border-color: #444;
    }

    .table-col, .popup-title, .form-item text {
        color: #ecf0f1;
    }

    .form-item input {
        border-color: #666;
        background: #34495e;
        color: #ecf0f1;
    }

    .add-btn, .confirm-btn {
        background-color: #3498db;
    }
}
</style>