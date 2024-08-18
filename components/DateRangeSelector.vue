<template>
  <div class="mt-2 container ">
    <div>
      <label class="weight-5" for="start-date">Start Date:</label>
      <input type="date" id="start-date" v-model="startDate" @change="updateDateRange" />
    </div>

    <div>
      <label for="end-date">End Date</label>
      <input type="date" id="end-date" v-model="endDate" @change="updateDateRange" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFinanceStore } from '~/store/finance'

const financeStore = useFinanceStore()
const { entries } = storeToRefs(financeStore)

const startDate = ref('')
const endDate = ref('')

const updateDateRange = () => {
  financeStore.setDateRange(startDate.value, endDate.value)
}

watch(entries, () => {
  if (entries.value.length > 0) {
    startDate.value = entries.value[0].date
    endDate.value = entries.value[entries.value.length - 1].date
    updateDateRange()
  }
})
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  gap: 5px;
}

.container label {
  @media (width < 800px) {
    font-size: 14px;
  }
}

.container input[type="date"] {
  max-width: 120px;
  padding: 0px;
  border-radius: 4px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  font-size: 14px;
  transition: border-color 0.3s ease;
  font-weight: 600;
  -webkit-appearance: none;
}
</style>