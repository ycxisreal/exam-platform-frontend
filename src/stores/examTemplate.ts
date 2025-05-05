// stores/examTemplate.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { http } from '@/utils/http'
import { useCategoryStore } from '@/stores/category'

interface ExamTemplate {
    templateId: number
    examName: string
    examType: 'normal' | 'makeup' | 'special'
    duration: number
    totalScore: number
    singleChoiceCount: number
    multipleChoiceCount: number
    availableStart: string
    availableEnd: string
    targetCategoryIds: number[] | null
}

export const useExamTemplateStore = defineStore('examTemplate', () => {
    const categoryStore = useCategoryStore()

    // 状态
    const templates = ref<ExamTemplate[]>([])
    const currentTemplate = ref<ExamTemplate | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // 计算属性
    const paginatedTemplates = computed(() => {
        const start = (currentPage.value - 1) * pageSize.value
        return templates.value.slice(start, start + pageSize.value)
    })

    const upcomingTemplates = computed(() =>
        templates.value.filter(t => new Date(t.availableStart) > new Date())
    )

    const ongoingTemplates = computed(() =>
        templates.value.filter(t =>
            new Date() > new Date(t.availableStart) &&
            new Date() < new Date(t.availableEnd))
    )

    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)

    // 获取所有模板
    const fetchTemplates = async () => {
        isLoading.value = true
        error.value = null
        try {
            templates.value = await http.get<ExamTemplate[]>('/template')
            // 确保分类数据已加载
            if (categoryStore.categories.length === 0) {
                await categoryStore.fetchCategories()
            }
        } catch (err) {
            error.value = '获取考试模板失败'
            console.error('API Error:', err)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    // 获取模板详情
    const fetchTemplateById = async (id: number) => {
        try {
            const template = await http.get<ExamTemplate>(`/template/${id}`)
            currentTemplate.value = template
            return template
        } catch (err) {
            error.value = '获取模板详情失败'
            throw err
        }
    }

    // 创建模板
    const createTemplate = async (data: Omit<ExamTemplate, 'templateId'>) => {
        try {
            // 转换日期格式
            const payload = {
                ...data,
                availableStart: new Date(data.availableStart).toISOString(),
                availableEnd: new Date(data.availableEnd).toISOString()
            }

            const newTemplate = await http.post<ExamTemplate>('/template', payload)
            templates.value.push(newTemplate)
            return newTemplate
        } catch (err) {
            error.value = '创建考试模板失败'
            throw err
        }
    }

    // 更新模板
    const updateTemplate = async (id: number, data: Partial<ExamTemplate>) => {
        try {
            // 转换日期格式
            const payload = {
                ...data,
                ...(data.availableStart && {
                    availableStart: new Date(data.availableStart).toISOString()
                }),
                ...(data.availableEnd && {
                    availableEnd: new Date(data.availableEnd).toISOString()
                })
            }

            const updated = await http.patch<ExamTemplate>(`/template/${id}`, payload)
            const index = templates.value.findIndex(t => t.templateId === id)
            if (index !== -1) {
                templates.value[index] = updated
            }
            return updated
        } catch (err) {
            error.value = '更新考试模板失败'
            throw err
        }
    }

    // 删除模板
    const deleteTemplate = async (id: number) => {
        try {
            await http.delete(`/template/${id}`)
            templates.value = templates.value.filter(t => t.templateId !== id)
        } catch (err) {
            error.value = '删除考试模板失败'
            throw err
        }
    }

    // 按状态筛选模板
    const fetchTemplatesByStatus = async (status: 'upcoming' | 'ongoing' | 'finished') => {
        isLoading.value = true
        try {
            const result = await http.get<ExamTemplate[]>(`/template/status/${status}`)
            return result
        } catch (err) {
            error.value = `获取${status}考试模板失败`
            throw err
        } finally {
            isLoading.value = false
        }
    }

    // 获取目标分类名称
    const getTargetCategoryNames = (categoryIds: number[] | null) => {
        if (!categoryIds) return []
        return categoryIds.map(id => {
            const category = categoryStore.categories.find(c => c.categoryId === id)
            return category?.categoryName || '未知分类'
        })
    }

    return {
        // 状态
        templates,
        currentTemplate,
        isLoading,
        error,
        currentPage,
        pageSize,

        // 计算属性
        paginatedTemplates,
        upcomingTemplates,
        ongoingTemplates,

        // 方法
        fetchTemplates,
        fetchTemplateById,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        fetchTemplatesByStatus,
        getTargetCategoryNames
    }
})