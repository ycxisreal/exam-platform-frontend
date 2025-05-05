<script setup lang="ts">
import {useUserStore} from '@/stores/user'
import {http} from '@/utils/http'
import InputModal from '@/components/InputModal.vue';
import {ref} from 'vue'

const show = ref(false)
const userStore = useUserStore()
const onClick = () => {
    userStore.logout()
    uni.redirectTo({
        url: '/pages/auth/login'
    })
}
const changePwd = () => {
    uni.navigateTo({
        url: '/pages/auth/change-password'
    })
}
const deleteAccount = async (p: string) => {
    // 获取用户信息
    const userStore = useUserStore()
    // 请求删除账号接口
    await http.delete('/user/delete-account', {
        username: userStore.userInfo?.username || '',
        password: p
    }).then(
            () => {
                uni.showToast({
                    title: '账号注销成功',
                    icon: 'success'
                })
                userStore.logout()
                // 跳转到登录页
                uni.redirectTo({
                    url: '/pages/auth/login'
                })
            }
    ).catch(
            () => {
                uni.showToast({
                    title: '注销失败，请重试',
                    icon: 'none'
                })
            }
    )
}
const showAllTemplate = () => {
    uni.navigateTo({
        url: '/pages/admin/AllTemplate'
    })
}
const test = () => {
    uni.navigateTo({
        url: '/pages/index/profile'
    })
}
</script>

<template>
    <input-modal
            title="确认密码"
            :show="show"
            :func="deleteAccount"
            @confirm="show = false"
            @cancel="show = false"
    >
    </input-modal>
    <div>
        个人中心
    </div>
    <button @click="onClick">
        退出登录
    </button>
    <button @click="changePwd">
        修改密码
    </button>
    <button @click="show = true">
        注销此账号
    </button>
    <button @click="showAllTemplate">
        展示考试模板列表
    </button>
    <button @click="test">
        test
    </button>

</template>

<style scoped>

</style>