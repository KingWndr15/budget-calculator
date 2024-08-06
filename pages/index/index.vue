<template>
  <div class="container mx-auto p-4">
    <h1>Finance Tracker</h1>

    <DateRangeSelector />
    <CategorySelector v-model:selectedCategory="selectedCategory" />
    <FileUpload />
    <PieChart :entries="displayedEntries" />
    <div class="bottom mt-4">
      <div class="summary" >
        <Summary />
        <NewEntryForm />
      </div>
      <TimelineTable :entries="displayedEntries" @entryDeleted="refreshEntries" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFinanceStore } from '~/store/finance'
import FileUpload from '~/components/FileUpload.vue'
import DateRangeSelector from '~/components/DateRangeSelector.vue'
import CategorySelector from '~/components/CategorySelector.vue'
import Summary from '~/components/Summary.vue'
import PieChart from '~/components/PieChart.vue'
import NewEntryForm from '~/components/NewEntryForm.vue'
import TimelineTable from '~/components/TimelineTable.vue'

const financeStore = useFinanceStore()
const { filteredEntries } = storeToRefs(financeStore)

const selectedCategory = ref('')

const displayedEntries = computed(() => {
  if (selectedCategory.value && selectedCategory.value !== '') {
    return filteredEntries.value.filter(entry => entry.category === selectedCategory.value)
  }
  return filteredEntries.value || []
})

const refreshEntries = () => {
  filteredEntries.value = [...filteredEntries.value]
}
</script>

<style>
.bottom {
  display: flex;
  justify-content: space-between;
}

.summary {
  display: flex;
  gap: 20px;
  flex-direction: column;
}
</style>