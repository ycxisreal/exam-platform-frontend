<template>
    qq
    <view class="container">
        <exam-card
                :exam-data="examData"
                @edit="handleEditExam"
                @delete="handleDeleteExam"
        ></exam-card>
        <UserExamCard
                :exams="userExams"
                @view-details="handleViewDetails"
                @start-exam="handleStartExam"
        />
    </view>
</template>

<script setup>
import { ref } from 'vue'
import ExamCard from "@/components/ExamCard.vue";
import UserExamCard from "@/components/UserExamCard.vue";

const examData = ref({
    templateId: 4,
    examName: "2025年5月月考",
    examType: "special",
    duration: 60,
    totalScore: 100,
    singleChoiceCount: 20,
    multipleChoiceCount: 10,
    availableStart: "2025-04-30T16:00:00.000Z",
    availableEnd: "2025-05-03T15:59:59.000Z",
    targetCategoryIds: [2, 3]
})
const userExams = ref([
    {
        "userExamId": 5,
        "examName": "3月补考",
        "examType": "normal",
        "status": "finished",
        "score": 92,
        "time": "2025-03-28 10:00"
    },
    {
        "userExamId": 6,
        "examName": "test考试",
        "examType": "special",
        "status": "pending",
        "score": null,
        "time": "2025-04-20 09:00"
    }
])
const handleEditExam = () => {
    console.log('编辑考试')
}
const handleDeleteExam = () => {
    console.log('删除考试')
}
const handleViewDetails = () => {
    console.log('查看考试详情')
}
const handleStartExam = () => {
    console.log('开始考试')
}
</script>
<style scoped>
.container{
    min-height: 50vh;
}
</style>