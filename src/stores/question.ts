// stores/question.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { http } from '@/utils/http'
import { useCategoryStore } from './category'

interface Option {
    optionId: number
    questionId: number
    content: string
    isCorrect: boolean
}

interface QuestionFromAPI {
    questionId: number
    questionType: 'single' | 'multiple'
    content: string
    score: number
    categoryId: number
    options: Option[]
}

export interface Question extends QuestionFromAPI {
    category: {
        categoryId: number
        categoryName: string
    } | null
}

export const useQuestionStore = defineStore('question', () => {
    const categoryStore = useCategoryStore()

    // 原始状态（直接来自API）
    const _questions = ref<QuestionFromAPI[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // 计算属性：合并分类数据后的题目列表
    const questions = computed<Question[]>(() => {
        return _questions.value.map(question => {
            const category = categoryStore.categories.find(
                c => c.categoryId === question.categoryId
            )
            return {
                ...question,
                category: category ? { ...category } : null
            }
        })
    })

    // 获取分类名称（可在组件中使用）
    const getCategoryName = (categoryId: number) => {
        const category = categoryStore.categories.find(c => c.categoryId === categoryId)
        return category?.categoryName || '未知分类'
    }

    /**
     * 加载题目数据（自动合并分类信息）
     */
    const fetchQuestions = async () => {
        isLoading.value = true
        error.value = null
        try {
            // 1. 加载题目数据
            _questions.value = await http.get<QuestionFromAPI[]>('/question')

            // 2. 确保分类数据已加载
            if (categoryStore.categories.length === 0) {
                await categoryStore.fetchCategories()
            }
        } catch (err) {
            error.value = '获取题目列表失败'
            console.error('API Error:', err)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 创建题目（带批量选项）
     */
    const createQuestion = async (data: {
        content: string
        questionType: 'single' | 'multiple'
        categoryId: number
        options: Array<{
            content: string
            isCorrect: boolean
        }>
    }) => {
        try {
            // 根据题型自动设置分数
            const score = data.questionType === 'single' ? 2 : 3

            // 1. 创建题目基础信息
            const question = await http.post<QuestionFromAPI>('/question', {
                ...data,
                score
            })

            // 2. 批量创建选项
            if (data.options.length > 0) {
                await http.post(`/question/${question.questionId}/options/batch`, {
                    options: data.options
                })
            }

            // 3. 添加到本地列表
            _questions.value.push(question)
            return question
        } catch (err: any) {
            throw new Error('创建失败: ' + (err.response?.data?.message || '服务器错误'))
        }
    }

    // 内部方法：为单个题目合并分类数据
    const getQuestionWithCategory = (question: QuestionFromAPI): Question => {
        const category = categoryStore.categories.find(
            c => c.categoryId === question.categoryId
        )
        return {
            ...question,
            category: category ? { ...category } : null
        }
    }

    /**
     * 获取单个题目详情（带完整分类信息）
     */
    const fetchQuestionDetail = async (id: number) => {
        try {
            const question = await http.get<QuestionFromAPI>(`/question/${id}`)
            return getQuestionWithCategory(question)
        } catch (err) {
            console.error('API Error:', err)
            throw new Error('获取题目详情失败')
        }
    }
    /**
     * 更新题目
     */
    const updateQuestion = async (
        id: number,
        data: Partial<{
            content: string
            questionType: 'single' | 'multiple'
            categoryId: number
            options: Array<{
                content: string
                isCorrect: boolean
            }>
        }>
    ) => {
        try {
            // 1. 更新题目基本信息
            const updated = await http.patch<QuestionFromAPI>(`/question/${id}`, {
                content: data.content,
                score: data.questionType === 'single' ? 2 : 3,
                questionType: data.questionType,
                categoryId: data.categoryId
            })

            // 2. 处理选项更新（如果有）
            if (data.options) {
                // 先删除该题目的所有选项
                await http.delete(`/question/${id}/options`)

                // 再批量添加新选项（如果有）
                if (data.options.length > 0) {
                    await http.post(`/question/${id}/options/batch`, {
                        options: data.options.map(opt => ({
                            content: opt.content,
                            isCorrect: opt.isCorrect
                        }))
                    })
                }
            }

            // 3. 获取更新后的完整题目数据
            const fullQuestion = await http.get<QuestionFromAPI>(`/question/${id}`)

            // 4. 更新本地数据
            const index = _questions.value.findIndex(q => q.questionId === id)
            if (index !== -1) {
                _questions.value[index] = fullQuestion
            }

            return getQuestionWithCategory(fullQuestion)
        } catch (err) {
            console.error('更新题目失败:', err)
            throw new Error('更新失败: ' + (err || '服务器错误'))
        }
    }

    /**
     * 删除题目
     */
    const deleteQuestion = async (id: number) => {
        try {
            // 1. 先删除所有关联选项
            const question = _questions.value.find(q => q.questionId === id)
            if (question?.options?.length) {
                await Promise.all(
                    question.options.map(opt =>
                        http.delete(`/question/options/${opt.optionId}`)
                    )
                )
            }

            // 2. 再删除题目本身
            await http.delete(`/question/${id}`)

            // 3. 更新本地状态
            _questions.value = _questions.value.filter(q => q.questionId !== id)
        } catch (err) {
            console.error('API Error:', err)
            throw new Error(`删除失败: ${err || '服务器错误'}`)
        }
    }

    /**
     * 按分类获取题目
     */
    const fetchQuestionsByCategory = async (categoryId: number) => {
        try {
            return await http.get<Question[]>(`/question/category/${categoryId}`)
        } catch (err) {
            console.error('API Error:', err)
            throw new Error('获取分类题目失败')
        }
    }

    return {
        // 状态
        questions, // 计算属性（已合并分类）
        isLoading,
        error,

        // 方法
        fetchQuestions,
        fetchQuestionDetail,
        createQuestion,
        updateQuestion,
        getCategoryName,
        deleteQuestion,
        // ...其他方法
    }
})