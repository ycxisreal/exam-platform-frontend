<!-- components/InputModal.vue -->
<template>
  <view v-if="show" class="modal-mask">
    <view class="modal-content">
      <text class="modal-title">{{ title }}</text>
      <input
        class="modal-input"
        v-model="inputValue"
      />
      <view class="modal-btns">
        <button @click="onCancel">取消</button>
        <button @click="onConfirm">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  show: Boolean,
  title: String,
  func: Function,
})
const inputValue = ref('')
const emit = defineEmits(['confirm', 'cancel'])
function onConfirm() {
  emit('confirm')
  props.func(inputValue.value)
}
function onCancel() {
  emit('cancel')
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modal-content {
  background: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  width: 500rpx;
}
.modal-title {
  font-size: 30rpx;
  margin-bottom: 20rpx;
}
.modal-input {
  border: 1px solid #ddd;
  padding: 10rpx;
  margin-bottom: 20rpx;
}
.modal-btns {
  display: flex;
  justify-content: flex-end;
}
.modal-btns button {
  margin-left: 20rpx;
}
</style>
