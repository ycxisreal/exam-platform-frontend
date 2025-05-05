// utils/http.ts
import { useUserStore } from '@/stores/user'

const baseURL = 'http://localhost:3000'

// 封装请求函数
function request<T = any>(
    url: string,
    method:any,
    data?: any
): Promise<T> {
    const userStore = useUserStore()

    return new Promise((resolve, reject) => {
        uni.request({
            url: baseURL + url,
            method,
            data,
            header: {
                'Content-Type': 'application/json',
                Authorization: userStore.token ? `Bearer ${userStore.token}` : ''
            },
            success: (res) => {
                const { data, statusCode } = res
                if (statusCode! >= 200 && statusCode! < 300) {
                    resolve(data as T)
                } else {
                    // uni.showToast({ title: '请求失败', icon: 'none' })
                    reject(res)
                }
            },
            fail: (err) => {
                uni.showToast({ title: '网络异常', icon: 'none' })
                reject(err)
            }
        })
    })
}

// 导出简洁方法
export const http = {
    get<T = any>(url: string, params?: any) {
        return request<T>(url, 'GET', params)
    },
    post<T = any>(url: string, data?: any) {
        return request<T>(url, 'POST', data)
    },
    put<T = any>(url: string, data?: any) {
        return request<T>(url, 'PUT', data)
    },
    delete<T = any>(url: string, data?: any) {
        return request<T>(url, 'DELETE', data)
    },
    patch<T = any>(url: string, data?: any) {
        return request<T>(url, 'PATCH', data)
    },
}
