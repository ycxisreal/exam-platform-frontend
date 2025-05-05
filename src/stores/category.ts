// stores/category.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '@/utils/http'

interface Category {
    categoryId: number
    categoryName: string
}

export const useCategoryStore = defineStore('category', () => {
    // 状态
    const categories = ref<Category[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // 方法
    /**
     * 获取分类列表
     */
    const fetchCategories = async () => {
        isLoading.value = true
        error.value = null
        try {
            categories.value = await http.get<Category[]>('/question/categories')
        } catch (err) {
            error.value = '获取分类列表失败，请稍后重试'
            console.error('API Error:', err)
            throw err // 抛出错误供组件捕获
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 添加分类
     * @param name 分类名称
     */
    const addCategory = async (name: string) => {
        try {
            const newCategory = await http.post<Category>('/question/categories', {
                categoryName: name
            })
            categories.value.push(newCategory) // 乐观更新
            return newCategory
        } catch (err) {
            console.error('API Error:', err)
            throw new Error('添加分类失败，请检查名称是否重复')
        }
    }

    /**
     * 更新分类
     * @param id 分类ID
     * @param name 新分类名称
     */
    const updateCategory = async (id: number, name: string) => {
        try {
            const updatedCategory = await http.patch<Category>(
                `/question/categories/${id}`,
                { categoryName: name }
            )
            const index = categories.value.findIndex(c => c.categoryId === id)
            if (index !== -1) {
                categories.value[index] = updatedCategory // 乐观更新
            }
            return updatedCategory
        } catch (err) {
            console.error('API Error:', err)
            throw new Error('更新分类失败，请检查名称是否有效')
        }
    }

    /**
     * 删除分类
     * @param id 分类ID
     */
    const deleteCategory = async (id: number) => {
        try {
            await http.delete(`/question/categories/${id}`)
            categories.value = categories.value.filter(c => c.categoryId !== id) // 乐观更新
        } catch (err) {
            console.error('API Error:', err)
            throw new Error('删除分类失败，可能已被关联使用')
        }
    }

    return {
        // 状态
        categories,
        isLoading,
        error,

        // 方法
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory
    }
})